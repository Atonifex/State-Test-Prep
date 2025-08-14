export type Role = 'student' | 'teacher' | 'districtAdmin';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type QuestionType = 'mcq' | 'essay';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  role: Role | null; // null until assigned
  districtId: string | null;
  schoolId: string | null;
  classroomIds: string[]; // membership
  createdAt: number | null; // epoch ms
  lastLoginAt: number | null; // epoch ms
}

export interface StandardRef {
  state: string; // e.g., 'SC'
  testId: string; // e.g., 'english-ii'
  subject: string; // e.g., 'English II'
  standardId: string; // e.g., 'E2.RC.1.1'
}

export interface Standard extends StandardRef {
  description: string;
  version: string;
  gradeBand?: string | null;
}

export interface McqQuestion extends StandardRef {
  id: string;
  type: 'mcq';
  difficulty: Difficulty;
  passage?: string | null;
  question: string;
  choices: string[];
  answer: string; // 'A' | 'B' | 'C' | 'D' or index string
  explanation?: string | null;
  assets?: { type: 'image' | 'audio'; url: string }[] | null;
}

export interface EssayQuestion extends StandardRef {
  id: string;
  type: 'essay';
  difficulty: Difficulty;
  prompt: string;
  wordLimit: number; // default 500
  explanation?: string | null; // rubric/exemplar
}

export type Question = McqQuestion | EssayQuestion;

export interface Attempt {
  id: string;
  userId: string;
  state: string;
  testId: string;
  subject: string;
  standardId: string;
  questionId: string;
  questionType: QuestionType;
  startedAt: number; // ms epoch
  submittedAt: number; // ms epoch
  timeSpentSec: number;
  correct: boolean | null; // null for essay
  selectedChoice?: string | null;
  freeResponse?: string | null;
  explanationViewed: boolean;
  tutorUsed: boolean;
  classroomId: string | null;
  assignmentId: string | null;
}

export interface Classroom {
  id: string;
  name: string;
  districtId: string;
  schoolId: string;
  teacherId: string;
  subject: string;
  state: string;
  testId: string;
}

export interface Assignment {
  id: string;
  classroomId: string;
  name: string;
  standardIds: string[];
  startDate: number; // ms epoch
  dueDate: number; // ms epoch
  timePerDayMin?: number | null;
  targetQuestions?: number | null;
}

export interface DemoQuestionBundle {
  standardId: string;
  questions: Question[];
} 