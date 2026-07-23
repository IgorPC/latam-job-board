import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import axios from 'axios';
import pdfParse from 'pdf-parse';
import { AiRepository } from './ai.repository';
import { AnalyzeResumeDto } from './dto/analyze-resume.dto';
import { AnalysisImprovement, ResumeAnalysis } from './entity/resume-analysis.entity';
import { MAX_RESUME_FILE_BYTES, MAX_RESUMES } from './consts/endpoints';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const DEFAULT_MODEL = 'deepseek-v4-flash';
const MAX_RESUME_TEXT_CHARS = 12_000; // ~3,000 tokens — enough for a 2-3 page resume
const MAX_JOB_DESC_CHARS = 6_000; // ~1,500 tokens for the job description

interface DeepSeekAnalysisResult {
  score: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  improvements: AnalysisImprovement[];
  verdict: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly repo: AiRepository) {}

  // ─── Resumes ────────────────────────────────────────────────────────────

  async uploadResume(file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file was uploaded.');
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Only PDF files are accepted.');
    }
    if (file.size > MAX_RESUME_FILE_BYTES) {
      throw new BadRequestException('Resume must be under 5MB.');
    }

    const count = await this.repo.resumes.count();
    if (count >= MAX_RESUMES) {
      throw new BadRequestException(`You can have at most ${MAX_RESUMES} resumes. Delete one before uploading a new one.`);
    }

    const existing = await this.repo.resumes.findOneBy({ filename: file.originalname });
    if (existing) {
      throw new ConflictException(`A resume named "${file.originalname}" already exists. Rename the file or delete the existing one first.`);
    }

    const { text } = await pdfParse(file.buffer);
    if (!text || text.trim().length < 50) {
      throw new BadRequestException('Could not extract text from this PDF. Make sure it is not a scanned image.');
    }

    return this.repo.resumes.save(
      this.repo.resumes.create({
        filename: file.originalname,
        textContent: text.trim().slice(0, MAX_RESUME_TEXT_CHARS),
        fileSizeBytes: file.size,
      }),
    );
  }

  listResumes() {
    return this.repo.resumes.find({
      select: ['id', 'filename', 'fileSizeBytes', 'createdAt'],
      order: { createdAt: 'DESC' },
    });
  }

  async deleteResume(id: number) {
    const result = await this.repo.resumes.delete(id);
    if (!result.affected) throw new NotFoundException('Resume not found.');
  }

  // ─── Analysis ───────────────────────────────────────────────────────────

  async analyze(dto: AnalyzeResumeDto): Promise<ResumeAnalysis> {
    const resume = await this.repo.resumes.findOneBy({ id: dto.resumeId });
    if (!resume) throw new NotFoundException('Resume not found.');

    const job = await this.repo.jobs.findOneBy({ id: dto.jobId });
    if (!job) throw new NotFoundException('Job not found.');

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new ServiceUnavailableException('AI analysis is unavailable: DEEPSEEK_API_KEY is not configured.');
    }
    const model = process.env.DEEPSEEK_MODEL || DEFAULT_MODEL;

    const jobText = [
      `Title: ${job.title}`,
      `Company: ${job.company || 'Unlisted'}`,
      `Stack: ${job.stack || 'N/A'}`,
      `Description:\n${(job.description ?? '').slice(0, MAX_JOB_DESC_CHARS)}`,
    ].join('\n\n');

    let result: DeepSeekAnalysisResult;
    try {
      const response = await axios.post(
        DEEPSEEK_API_URL,
        {
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: `## JOB POSTING\n\n${jobText}\n\n## CANDIDATE RESUME\n\n${resume.textContent}` },
          ],
          response_format: { type: 'json_object' },
          max_tokens: 2000,
        },
        {
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          timeout: 60_000,
        },
      );
      result = JSON.parse(response.data.choices[0].message.content);
    } catch (err) {
      this.logger.error(`DeepSeek call failed resumeId=${dto.resumeId} jobId=${dto.jobId}`, err instanceof Error ? err.stack : String(err));
      throw new ServiceUnavailableException('The AI analysis service is unavailable right now. Please try again later.');
    }

    const score = Math.min(10, Math.max(0, parseFloat(String(result.score)) || 0));

    return this.repo.analyses.save(
      this.repo.analyses.create({
        resumeId: resume.id,
        resumeFilename: resume.filename,
        jobId: job.id,
        score,
        summary: result.summary ?? '',
        strengths: result.strengths ?? [],
        gaps: result.gaps ?? [],
        improvements: result.improvements ?? [],
        verdict: result.verdict ?? '',
        modelUsed: model,
      }),
    );
  }

  // Every past analysis for a job, newest first — never deduplicated, so
  // the user can build up a full history across as many runs as they want.
  getHistory(jobId: number) {
    return this.repo.analyses.find({ where: { jobId }, order: { createdAt: 'DESC' } });
  }
}

// The prompt is deliberately structured to force the exact fields the product
// needs (0-10 score, summary, strengths, gaps, improvements, verdict) as
// strict JSON, so the response can be parsed and stored without guesswork.
const SYSTEM_PROMPT = `
You are an expert technical recruiter and career coach specializing in remote tech positions for Latin American candidates.
Analyze how well the candidate's resume matches the job posting.

Respond with a JSON object using exactly this structure and nothing else:
{
  "score": <number 0.0-10.0, one decimal place>,
  "summary": "<2-3 sentence overall assessment of the match>",
  "strengths": ["<concrete strength tied to the job's requirements>", "..."],
  "gaps": ["<concrete gap or missing requirement>", "..."],
  "improvements": [
    { "area": "<specific skill or resume section>", "suggestion": "<concrete, actionable suggestion>" }
  ],
  "verdict": "<one sentence final recommendation for this candidate on this job>"
}

Scoring guide:
- 9-10: Excellent match — candidate is likely to pass screening
- 7-8: Good match — minor gaps that can be addressed
- 5-6: Partial match — transferable skills exist but significant gaps
- 3-4: Weak match — major requirements not met
- 0-2: Poor match — candidate should look at different roles

Be specific and actionable, referencing exact skills/technologies from both documents. Weigh: technical skill
alignment, years of experience, remote-work signals, English proficiency, and portfolio/GitHub evidence.
Never invent resume content that isn't there — base "gaps" only on what is genuinely absent from the resume text.
`.trim();
