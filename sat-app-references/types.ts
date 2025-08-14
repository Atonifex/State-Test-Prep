/*import { SkillName } from "./components/UserAndProfile/UserContext";

export interface TestQuestion {
    index: number;
    skill: SkillName;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    question: string;
    choices: string[];
    answer: string;
    explanation: string;
    isCorrect?: boolean;
    userAnswer?: string;
    sectionNumber?: number;
    pictureURL?: string | null; //URL of the picture for questions with graphs / charts / etc.
  }



// --- Unified Type ---
// Represents the user's recorded interaction AND relevant static info
export interface UserAnswerRecord {
    questionIndex: number;    // Matches the 'index' of the corresponding TestQuestion
    skill: SkillName;         // Copied from TestQuestion
    difficulty: 'Easy' | 'Medium' | 'Hard'; // Copied from TestQuestion
    selectedAnswer: string;   // The literal answer selected/entered by the user
    correctAnswer: string;    // The CORRECT answer key/string (copied from TestQuestion)
    isCorrect: boolean;       // Was the selectedAnswer correct?
    timeSpent?: number;      // Optional: time spent in milliseconds
    reviewStatus?: 'Hard - Review Next Time' | 'Somewhat Hard - Review in 3 Days' | 'Good - Review in 14 Days' | 'Mastered! - No Review'; //Need to add this to the UserAnswerRecord type in types.ts
    nextReviewDate?: number | null; //date of when the question should be reviewed next
    userReflectionText?: string; //text that the user wrote about the question
}*/
