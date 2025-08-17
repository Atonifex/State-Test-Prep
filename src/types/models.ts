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
  
  // Gamification data for Dashboard 2.0
  level: number; // User's current level (starts at 1)
  xp: number; // Current experience points
  totalPoints: number; // Total points earned (for rewards store)
  currentStreak: number; // Days of consecutive practice
  longestStreak: number; // Best streak ever achieved
  
  // Personalization
  selectedAvatar: string; // Emoji avatar like "🦊"
  selectedTheme: "cosmic" | "ocean" | "forest" | "sunset"; // Theme preference
  unlockedAvatars: string[]; // Array of unlocked avatar emojis
  unlockedThemes: string[]; // Array of unlocked theme names
  
  // Achievements
  achievements: string[]; // Array of achievement names
  achievementProgress: Record<string, number>; // Progress toward achievements
  
  // Practice stats (calculated from Attempts)
  questionsCompleted: number; // Total questions answered
  totalTimeSpentMs: number; // Total practice time in milliseconds
  averageScore: number; // Average percentage score (0-100)
  lastPracticeDate: number | null; // Last time user practiced (epoch ms)
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

// New types to match your JSON structure
export interface TestSection {
  name: string; // e.g., "Part I"
  directions: string;
  label: string; // e.g., "Analyzing Literature/Short Story"
  title?: string; // e.g., "The Story of an Hour"
  subtitle?: string;
  author?: string;
  year?: number;
  context?: string;
  pictureURL?: string;
  passage?: string; // The main reading passage
  questions: TestQuestion[];
}

export interface TestQuestion {
  number: number;
  questionText: string;
  choices: string[];
  correctAnswer: string | string[]; // Can be single answer or array for multi-select
  explanationText: string;
  standards: string[];
}

// Legacy types for demo questions - keeping for backward compatibility
export interface McqQuestion extends StandardRef {
  id: string;
  type: 'mcq';
  difficulty: Difficulty;
  passage?: string | null;
  question: string;
  choices: string[];
  answer: string;
  explanation: string;
}

export interface EssayQuestion extends StandardRef {
  id: string;
  type: 'essay';
  difficulty: Difficulty;
  prompt: string;
  wordLimit: number;
}

export type Question = McqQuestion | EssayQuestion;

export interface Attempt {
  id: string;
  uid: string; // Firebase user ID
  state: string;
  testId: string;
  subject: string;
  standardId: string;
  questionId: string;
  questionType: QuestionType;
  difficulty: Difficulty;
  
  // Timing (all in milliseconds epoch for consistency)
  startedAt: number; // when question was first shown
  submittedAt: number; // when answer was submitted  
  timeSpentMs: number; // calculated: submittedAt - startedAtMs
  
  // Answer data
  userAnswer: string; // selected choice (A/B/C/D) or essay text
  isCorrect: boolean | null; // null for essay
  
  // UI state
  explanationViewed: boolean;
  tutorUsed: boolean;
  
  // Assignment tracking
  classroomId: string | null;
  assignmentId: string | null;
  
  // Firestore timestamp
  createdAt: number; // epoch ms, will be overwritten with serverTimestamp() in Firestore
}

export interface Classroom {
  id: string;
  name: string;
  teacherId: string;
  schoolId: string;
  districtId: string;
  subject: string;
  state: string;
  testId: string;
  studentIds: string[];
  createdAt: number;
  assignments: Assignment[];
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  classroomId: string;
  teacherId: string;
  standardIds: string[];
  dueDate: number | null;
  createdAt: number;
  isActive: boolean;
}

// Bundle type for demo questions
export interface DemoQuestionBundle {
  state: string;
  testId: string;
  subject: string;
  standardId: string;
  questions: Question[];
} 