import { z } from 'zod';
import { can } from '@/lib/roles';

export const DEFAULT_MAX_SCORE = 5;

export const gradeInputSchema = z
  .object({
    studentId: z.string().min(1),
    title: z.string().trim().min(1).max(200),
    score: z.coerce.number().min(0),
    maxScore: z.coerce.number().positive().max(1000).default(DEFAULT_MAX_SCORE),
    comment: z.string().trim().max(2000).optional().nullable(),
    period: z.string().trim().max(50).optional().nullable(),
    subject: z.string().trim().max(200).optional().nullable(),
    courseId: z.string().optional().nullable(),
    experimentId: z.string().optional().nullable(),
  })
  .refine((g) => g.score <= g.maxScore, { message: 'La nota no puede superar la nota máxima', path: ['score'] });

export const gradeUpdateSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    score: z.coerce.number().min(0),
    maxScore: z.coerce.number().positive().max(1000),
    comment: z.string().trim().max(2000).nullable(),
    period: z.string().trim().max(50).nullable(),
    subject: z.string().trim().max(200).nullable(),
    courseId: z.string().nullable(),
    experimentId: z.string().nullable(),
  })
  .partial();

/** Un profesor solo edita/borra sus propias notas; ADMIN+ puede editar todas. */
export function canEditGrade(actor: { id: string; role: string }, grade: { teacherId: string }) {
  return grade.teacherId === actor.id || can(actor.role, 'grades:manage_all');
}

export const gradeSelect = {
  id: true,
  studentId: true,
  teacherId: true,
  courseId: true,
  experimentId: true,
  subject: true,
  title: true,
  score: true,
  maxScore: true,
  comment: true,
  period: true,
  createdAt: true,
  updatedAt: true,
  student: { select: { id: true, name: true, email: true } },
  teacher: { select: { id: true, name: true } },
  course: { select: { id: true, title: true } },
} as const;
