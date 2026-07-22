import * as cheerio from 'cheerio';

// Best-effort text extraction for arbitrary third-party pages (e.g. ATS
// platforms behind a redirect) that don't expose a JobPosting JSON-LD block.
export function extractGenericPageText(html: string): string {
  const $ = cheerio.load(html);
  $('script, style, noscript, nav, header, footer, svg').remove();

  const scope = $('main, article').first();
  const target = scope.length ? scope : $('body');
  return target.text().replace(/\s+/g, ' ').trim();
}
