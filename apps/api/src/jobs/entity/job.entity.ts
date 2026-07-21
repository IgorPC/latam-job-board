import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('jobs')
@Index(['publishedAt'])
@Index(['type', 'publishedAt'])
@Index(['acceptsLatam', 'publishedAt'])
export class Job {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 500 })
  title: string;

  @Column({ length: 255, default: '' })
  company: string;

  @Column({ length: 100 })
  source: string;

  // utf8mb4 uses up to 4 bytes/char; InnoDB's unique index key cap is 3072 bytes,
  // so a unique VARCHAR column here must stay well under 768 chars.
  @Column({ length: 700, unique: true })
  url: string;

  @Column({ length: 500, default: '' })
  stack: string;

  @Column({ type: 'mediumtext', nullable: true })
  description: string | null;

  @Column({ length: 100, default: '' })
  type: string;

  @Column({ length: 255, default: '' })
  salary: string;

  @Column({ name: 'accepts_latam', length: 10, default: 'Maybe' })
  acceptsLatam: string;

  @Column({ name: 'published_at', type: 'date', nullable: true })
  publishedAt: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
