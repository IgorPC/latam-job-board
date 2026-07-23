import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

// No auth in this project (see BUSINESS_MODEL.md / apps/api/README.md) — resumes
// are global, not scoped to a user. Filename is unique so a re-upload of the
// same file name gets a clear error instead of silently shadowing the old one.
@Entity('resumes')
export class Resume {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, unique: true })
  filename: string;

  // Extracted text only — the binary PDF itself is never persisted.
  @Column({ name: 'text_content', type: 'mediumtext' })
  textContent: string;

  @Column({ name: 'file_size_bytes' })
  fileSizeBytes: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
