/* UserContext.tsx
import React, { createContext, useState, useEffect } from 'react';
import { auth, db } from '../../firebase'; // Adjust the import paths as needed
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, onSnapshot, Timestamp, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore'; //getDoc used to be imported too but isn't used now.
import { v4 as uuidv4 } from 'uuid';
import { TestQuestion, UserAnswerRecord } from '../../types';


export type SkillFrequency = {
  'Function of Sentence': number;
  'Inferences': number;
  'Main Idea': number;
  'Pronouns and Modifiers': number;
  'Punctuation': number;
  'Referencing Data': number;
  'Supporting Claims': number;
  'Synthesizing Notes': number;
  'Tenses': number;
  'Transition Words': number;
  'Two Passages': number;
  'Word Choice': number;
  'Absolute Value': number;
  'Algebra': number;
  'Circles': number;
  'Exponential Equations': number;
  'Exponential Word Problems': number;
  'Geometry': number;
  'Interpreting Graphs': number;
  'Linear Equations': number;
  'Linear Word Problems': number;
  'Inequality Word Problems': number;
  'Percent': number;
  'Polynomial Expressions': number;
  'Probability': number;
  'Quadratic Equations': number;
  'Statistics': number;
  'Systems of Equations': number;
  'Trigonometry': number;
  'Unit Conversions': number;
}

export const skillFrequency: SkillFrequency = {
  'Function of Sentence': .02,
  'Inferences': .05,
  'Main Idea': .054,
  'Pronouns and Modifiers': .023,
  'Punctuation': .084,
  'Referencing Data': .027,
  'Supporting Claims': .047,
  'Synthesizing Notes': .068,
  'Tenses': .036,
  'Transition Words': .061,
  'Two Passages': .009,
  'Word Choice': .099,
  'Absolute Value': .002,
  'Algebra': .027,
  'Circles': .011,
  'Exponential Equations': .009,
  'Exponential Word Problems': .014,
  'Geometry': .059,
  'Interpreting Graphs': .029,
  'Linear Equations': .045,
  'Linear Word Problems': .059,
  'Inequality Word Problems': .011,
  'Percent': .018,
  'Polynomial Expressions': .016,
  'Probability': .009,
  'Quadratic Equations': .047,
  'Statistics': .014,
  'Systems of Equations': .029,
  'Trigonometry': .014,
  'Unit Conversions': .009
}

export type TestProgress = {
  currentQuestionIndex: number;
  answers: UserAnswerRecord[];
  markedQuestions: number[];
  elapsedTime: number;
  startTime?: number; // Timestamp when test was started
}

export type FullTestProgress = {
  testNumber: number;
  currentSection: number;
  sections: TestProgress[];
}
/*This is actually defined in types.ts, but I'm keeping it here for easy reference to remember what's in the type and how to access info. 
export type UserAnswerRecord = {
  questionIndex: number;
  skill: string;
  difficulty?: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect?: boolean;
  timeSpent?: number; //time spent on question in milliseconds
  reviewStatus?: 'Hard - Review Next Time' | 'Somewhat Hard - Review in 3 Days' | 'Good - Review in 14 Days' | 'Mastered It! - No Review'; //Need to add this to the UserAnswerRecord type in types.ts
  nextReviewDate?: number | null; //date of when the question should be reviewed next
  userReflectionText?: string; //text that the user wrote about the question
}

export type TestAttempt = {
  id: string;
  testType: 'diagnostic' | 'full';
  testNumber?: number;
  date: string;
  completed: boolean;
  sections: Array<{
    sectionNumber: number; // 1-4 for full test, 1 for diagnostic
    questions: UserAnswerRecord[];
    elapsedTime: number; //Total time spent on section in milliseconds
  }>;
  readingWritingScore?: number;
  mathScore?: number;
  diagnosticReadingWritingScores?: { lower: number; upper: number};
  diagnosticMathScores?: { lower: number; upper: number};
  diagnosticTotalScores?: { lower: number; upper: number};
  totalScore?: number;
}

export type StudyPlanGoal = {
  target: number; // e.g., total questions, number of tests
  current: number; // Tracks progress towards the target
  unit: 'questions' | 'sessions' | 'tests' | 'minutes'; // Unit of the goal
};

export type StudyPlanTask = {
  id: string; // Unique ID (e.g., generated using uuid)
  createdDate: string; // ISO Timestamp when generated/added
  dueDate: string; // ISO Date string (YYYY-MM-DD) - Represents the due date
  completionDate: string | null; // ISO Timestamp when marked complete
  title: string; // e.g., "Practice Algebra (Medium)", "Review Reading Mistakes", "Full Test Section 1", "User Reminder: Finish Essay"
  description: string | null; // e.g., "When reviewing questions, ask yourself these 3 questions..."
  type: 'skill-practice' | 'question-review' | 'practice-test-section' | 'full-practice-test' | 'custom'; // Type of task
  durationMinutes: number | null; // Estimated/planned duration
  skill: SkillName | null; // Link to skill for practice/review tasks (string for custom)
  isCompleted: boolean;
  isUserCreated: boolean; // Flag for tasks added manually by the user
  // Optional: link to specific content/module ID (future enhancement)
};

export type WeeklyPlan = {
  weekNumber: number; // e.g., 1, 2, 3...
  startDate: string; // ISO Date string (YYYY-MM-DD)
  endDate: string; // ISO Date string (YYYY-MM-DD)
  weeklySkillsPracticeQuestionGoal: StudyPlanGoal; // Specific goal for this week
  weeklyReviewMissedQuestionGoal: StudyPlanGoal; // Specific goal for this week
  weeklySessionGoal: StudyPlanGoal; // e.g., target: 3, current: 0, unit: 'sessions'
  // Add other specific goals if needed (e.g., review time)
  tasks: StudyPlanTask[]; // Tasks scheduled/due within this week
};

export type SkillBenchmark = {
   targetPercentage: number; // e.g., 85 - The proficiency needed for the target score
   // Current percentage will be calculated dynamically from user.skills
};

export type StudyPlanData = {
  createdAt: string; // ISO Timestamp when the plan was generated
  testDate: string; // ISO Date string (YYYY-MM-DD) - Copied from UserData at generation
  targetScoreMath: number; // Copied from UserData at generation
  targetScoreRw: number; // Copied from UserData at generation
  // Store initial scores used for generation (optional but good for reference)
  initialDiagnosticScoreMath?: number;
  initialDiagnosticScoreRw?: number;
  // User commitment
  //sessionsPerWeek: number;
  //minutesPerSession: number;
  userPreferredTimes: string[]; // e.g., ["mornings", "weekends"] - From checkboxes
  // Overall program goals (calculated)
  overallSkillPracticeQuestionGoal: StudyPlanGoal;
  overallQuestionReviewGoal: StudyPlanGoal;
  overallPracticeTestGoal: StudyPlanGoal;
  // Breakdown
  weeklyPlans: WeeklyPlan[];
  skillBenchmarks: {
     // Use Partial<Record<SkillName, SkillBenchmark>> for type safety? Or string key?
     // Using string key for flexibility with skill key format (e.g., "algebra")
     [skillKey: string]: SkillBenchmark | null; // Target proficiency for each skill key
  };
};

export type UserData = {
  uid: string;
  email: string;
  firstName: string;
  lastName: string | null;
  userRole: 'student' | 'parent' | 'educator' | null;
  createdAt: Timestamp;

  //Stripe payment / trial info:
  trialEndDate: Timestamp | null;
  currentPeriodEnd: Timestamp | null;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionStatus: 'active' | 'trialing' | 'canceled' | null; 
  //Later on, add 'free_trial_active', 'free_trial_expired', 'paid_active', 'paid_inactive'
  //Those are in Klaviyo, but not here.
  subscriptionCancelledAt: Timestamp | null;
  lastUpdated: Timestamp | null;

  profileStep3Completed: boolean; //for student/parent SAT info, finished registration.
  educatorProfileCompleted: boolean; //for educator profile, finished registration.
  hasTakenSAT: boolean;
  hasTakenACT: boolean;
  previousSATScores: { math: string; readingWriting: string };
  previousACTScores: { math: string; reading: string; writing: string; science: string };
  hasUpcomingTest: boolean;
  testDate: string;
  targetScores: { math: string; readingWriting: string };
  colleges: string;
  intendedMajor: string;
  strengths: string;
  areasToImprove: string;
  motivation: string;
  feedbackStyle: string;
  personalInterests: string;
  grandTotalQuestionsAttempted: number;
  grandTotalQuestionsCorrect: number;
  completedSATTests: number;
  totalDaysPracticed: number;
  numberOfDaysInAStreak: number;
  lastPracticedDate: string | null; //used to calculate totalDaysPracticed and numberOfDaysInAStreak

  //Should activeChallenges be string so it's like an open-ended quest/activity, or type [string, number] or [Skills, number]?
  //*****If you change here, must change in CreateProfile too!*****
  activeChallenges: string[];
  completedChallenges: string[];
  skills: {
    [skillName: string]: {
      currentTestQuestionsAttempted: number;
      currentTestQuestionsCorrect: number;
      currentTestEasyQuestionsAttempted: number;
      currentTestEasyQuestionsCorrect: number;
      easyQuestionsIndex: number;
      currentTestMediumQuestionsAttempted: number;
      currentTestMediumQuestionsCorrect: number;
      mediumQuestionsIndex: number;
      currentTestHardQuestionsAttempted: number;
      currentTestHardQuestionsCorrect: number;
      hardQuestionsIndex: number;
      overallQuestionsAttempted: number;
      overallQuestionsCorrect: number;
    };
  };
  //NEW on 3/25/2025 for the Diagnostic Test and Full-Length Tests: stores partial progress.
  diagnosticTestProgress?: TestProgress | null;
  fullTestProgress?: FullTestProgress | null;
  //Stores an array of all test attempts (diagnostic and full-length), completed or in progress
  testAttempts: TestAttempt[];
  // --- NEW: Fields for Study Plan ---
  studyPlan: StudyPlanData | null; // Holds the generated study plan object

  // --- NEW: Fields for College Score Comparison ---
  selectedColleges: Array<{
    name: string;
    mathScores: {
      '25th': number | null;
      '50th': number | null;
      '75th': number | null;
    };
    readingWritingScores: {
      '25th': number | null;
      '50th': number | null;
      '75th': number | null;
    };
  }>;

  // --- NEW: Fields for Educator Profile ---
  organizationName?: string | null;
  jobTitle?: string | null;
  state?: string | null;

  // --- NEW: Fields for Referral System ---
  referredUsers: Array<{
    id: string; // UUID
    firstName: string;
    lastName: string | null;
    email: string;
    role: 'parent' | 'student' | 'educator';
    invitedDate: string; // ISO timestamp
    signupDate: string | null; // ISO timestamp when they signed up
    referralStatus: 'invited' | 'signed_up' | 'active';
    hashedReferralId: string; // For URL tracking
    // Progress tracking fields (populated when they sign up)
    hasCompletedDiagnostic?: boolean;
    totalQuestions?: number;
    fullTestScores?: Array<{
      testNumber: number;
      mathScore: number;
      readingWritingScore: number;
      completedDate: string;
    }>;
  }>;

  // --- NEW: Fields for Student Progress Tracking (Parent Role Only) ---
  studentEmail?: string | null;
  studentFirstName?: string | null;
  studentInvitedDate?: string | null; // ISO timestamp when invitation was sent
  studentSignupDate?: string | null; // ISO timestamp when student signed up
  studentReferralId?: string | null; // Used to link parent and student accounts
  // Student progress data (fetched from student's account)
  studentLastLoginDate?: string | null;
  studentCurrentSkills?: string[]; // Current skills being practiced
};

//Type used in SkillButtons...QGenerator to update both user, and session data (if no user)
export type SkillData = UserData['skills'][string]; //key name for each skill (I think)
export type Skills = UserData['skills']; //object containing all skills (I think)

type UserContextType = {
  user: UserData | null;
  loading: boolean;
  initialLoading: boolean;
  error: Error | null;
  isTrialExpired: boolean;
  daysLeftInTrial: number | null;
  updateUserData: (data: Partial<UserData>) => Promise<void>;
  saveTestProgress: (type: 'diagnostic' | 'fullTest', progress: any) => Promise<void>;
  clearTestProgress: (type: 'diagnostic' | 'fullTest') => Promise<void>;
  // --- NEW: Functions for Study Plan Task Management ---
  updateStudyPlanTask: (taskId: string, updates: Partial<StudyPlanTask>) => Promise<void>;
  addStudyPlanTask: (newTask: StudyPlanTask) => Promise<void>;
  deleteStudyPlanTask: (taskId: string) => Promise<void>;
  // --- NEW: Functions for Referral Management ---
  sendReferralInvitation: (referralData: {
    firstName: string;
    lastName: string | null;
    email: string;
    role: 'parent' | 'student' | 'educator';
  }) => Promise<void>;
  resendReferralInvitation: (referralId: string) => Promise<void>;
  // --- END: Functions for Referral Management ---
  
  // --- NEW: Functions for Student Progress Tracking ---
  sendStudentInvitation: (studentData: {
    firstName: string;
    email: string;
  }) => Promise<void>;
  // --- END: Functions for Student Progress Tracking ---
};

export const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  initialLoading: true,
  error: null,
  isTrialExpired: false,
  daysLeftInTrial: null,
  updateUserData: async () => {
    throw new Error("updateUserData function must be provided by the UserProvider");
  },
  saveTestProgress: async (type: 'diagnostic' | 'fullTest', progress: any) => {
    throw new Error("saveTestProgress function must be provided by the UserProvider");
  },
  clearTestProgress: async (type: 'diagnostic' | 'fullTest') => {
    throw new Error("clearTestProgress function must be provided by the UserProvider");
  },
  // --- NEW: Default implementations for Study Plan functions ---
  updateStudyPlanTask: async (taskId: string, updates: Partial<StudyPlanTask>) => {
    console.warn("updateStudyPlanTask function not yet implemented in UserProvider", taskId, updates);
    // Later: Implement Firestore logic here
    throw new Error("updateStudyPlanTask function must be provided by the UserProvider");
  },
  addStudyPlanTask: async (newTask: StudyPlanTask) => {
    console.warn("addStudyPlanTask function not yet implemented in UserProvider", newTask);
    // Later: Implement Firestore logic here
    throw new Error("addStudyPlanTask function must be provided by the UserProvider");
  },
  deleteStudyPlanTask: async (taskId: string) => {
    console.warn("deleteStudyPlanTask function not yet implemented in UserProvider", taskId);
    // Later: Implement Firestore logic here
    throw new Error("deleteStudyPlanTask function must be provided by the UserProvider");
  },
  // --- NEW: Default implementations for Referral functions ---
  sendReferralInvitation: async (referralData: {
    firstName: string;
    lastName: string | null;
    email: string;
    role: 'parent' | 'student' | 'educator';
  }) => {
    console.warn("sendReferralInvitation function not yet implemented in UserProvider", referralData);
    throw new Error("sendReferralInvitation function must be provided by the UserProvider");
  },
  resendReferralInvitation: async (referralId: string) => {
    console.warn("resendReferralInvitation function not yet implemented in UserProvider", referralId);
    throw new Error("resendReferralInvitation function must be provided by the UserProvider");
  },
  // --- NEW: Default implementations for Student Progress functions ---
  sendStudentInvitation: async (studentData: {
    firstName: string;
    email: string;
  }) => {
    console.warn("sendStudentInvitation function not yet implemented in UserProvider", studentData);
    throw new Error("sendStudentInvitation function must be provided by the UserProvider");
  },

});

export const categories = {
  "Reading and Writing": [
    "Function of Sentence", "Inferences", "Main Idea", "Pronouns and Modifiers",
    "Punctuation", "Referencing Data", "Supporting Claims", "Synthesizing Notes",
    "Tenses", "Transition Words", "Two Passages", "Word Choice"
  ],
  "Math": [
    "Absolute Value", "Algebra", "Circles", "Exponential Equations",
    "Exponential Word Problems", "Geometry", "Interpreting Graphs", "Linear Equations",
    "Linear Word Problems", "Inequality Word Problems", "Percent", "Polynomial Expressions",
    "Probability", "Quadratic Equations", "Statistics", "Systems of Equations",
    "Trigonometry", "Unit Conversions"
  ]
} as const;

export type CategoryName = keyof typeof categories; // "Reading and Writing" | "Math"
export type SkillName = typeof categories[CategoryName][number]; // Individual skill names

// Function to extract all skills from categories
export const getAllSkills = (): string[] => {
  return Object.values(categories).flat();
};

const createMissingUserDocument = async (firebaseUser: any) => {
  // Initialize skills helper function
  const initializeSkills = (): UserData['skills'] => {
    const initialSkills: UserData['skills'] = {};
    Object.values(categories).forEach(skillList => {
      skillList.forEach(skillName => {
        initialSkills[skillName as SkillName] = {
          currentTestQuestionsAttempted: 0,
          currentTestQuestionsCorrect: 0,
          currentTestEasyQuestionsAttempted: 0,
          currentTestEasyQuestionsCorrect: 0,
          easyQuestionsIndex: 0,
          currentTestMediumQuestionsAttempted: 0,
          currentTestMediumQuestionsCorrect: 0,
          mediumQuestionsIndex: 0,
          currentTestHardQuestionsAttempted: 0,
          currentTestHardQuestionsCorrect: 0,
          hardQuestionsIndex: 0,
          overallQuestionsAttempted: 0,
          overallQuestionsCorrect: 0,
        };
      });
    });
    return initialSkills;
  };

  // Create trial end date (14 days for unknown users)
  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + 14);

  // Extract name from Firebase user
  const displayName = firebaseUser.displayName || '';
  const nameParts = displayName.split(' ');
  const firstName = nameParts[0] || 'User';
  const lastName = nameParts.slice(1).join(' ') || '';

  const newUserDocData: UserData = {
    uid: firebaseUser.uid,
    firstName,
    lastName,
    email: firebaseUser.email.toLowerCase().trim(),
    userRole: null, // Will need to be set later
    createdAt: serverTimestamp() as any,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    subscriptionStatus: null,
    subscriptionCancelledAt: null,
    profileStep3Completed: false,
    educatorProfileCompleted: false,
    trialEndDate: Timestamp.fromDate(trialEndDate),
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    lastUpdated: null,
    
    // Initialize all UserData fields
    hasTakenSAT: false,
    hasTakenACT: false,
    previousSATScores: { math: '', readingWriting: '' },
    previousACTScores: { math: '', reading: '', writing: '', science: '' },
    hasUpcomingTest: false,
    testDate: '',
    targetScores: { math: '', readingWriting: '' },
    colleges: '',
    intendedMajor: '',
    strengths: '',
    areasToImprove: '',
    motivation: '',
    feedbackStyle: '',
    personalInterests: '',
    grandTotalQuestionsAttempted: 0,
    grandTotalQuestionsCorrect: 0,
    completedSATTests: 0,
    totalDaysPracticed: 0,
    numberOfDaysInAStreak: 0,
    lastPracticedDate: null,
    activeChallenges: [],
    completedChallenges: [],
    skills: initializeSkills(),
    diagnosticTestProgress: null,
    fullTestProgress: null,
    testAttempts: [],
    studyPlan: null,
    organizationName: null,
    jobTitle: null,
    state: null,
    selectedColleges: [],
    referredUsers: []
  };

  await setDoc(doc(db, 'users', firebaseUser.uid), newUserDocData);
  return newUserDocData;
};

const isTrialExpired = (user: UserData): boolean => {
  if (!user.trialEndDate) return false;
  return new Date() > user.trialEndDate.toDate(); // Convert Timestamp to Date
};

const getDaysLeftInTrial = (user: UserData): number | null => {
  if (!user.trialEndDate) return null;
  
  //console.log("getDaysLeftInTrial - trialEndDate:", user.trialEndDate);
  
  const msPerDay = 1000 * 60 * 60 * 24;
  const trialEndTime = user.trialEndDate.toDate().getTime();
  const currentTime = new Date().getTime();
  const daysLeft = Math.ceil((trialEndTime - currentTime) / msPerDay);
  
  //console.log("getDaysLeftInTrial - calculated days:", daysLeft);
  
  return Math.max(0, daysLeft);
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [initialLoading, setInitialLoading] = useState<boolean>(true); // NEW: Tracks initial loading


  useEffect(() => {
    // --- EDIT 1: Variable to hold the Firestore listener cleanup function ---
    let unsubscribeUserDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => { //onAuthStateChanged is a listener; unsubscribeAuth unmounts it
      // --- EDIT 2: Cleanup previous Firestore listener ---
      // If a listener exists from a previous user session, unsubscribe from it.
      if (unsubscribeUserDoc) {
        unsubscribeUserDoc();
        unsubscribeUserDoc = null; // Reset the variable
      }
      if (firebaseUser) {
        const uid = firebaseUser.uid;
        const userDocRef = doc(db, 'users', uid);

        // --- EDIT 3: Store the new Firestore listener cleanup function ---
        // Assign the result of onSnapshot (which is the unsubscribe function)
        unsubscribeUserDoc = onSnapshot(userDocRef, async (docSnap) => {
            //console.log(`UserContext: Received snapshot for UID: ${uid}`);
            if (docSnap.exists()) {
              //console.log("UserContext: Document exists. Data:", docSnap.data());
              const userData = { uid, ...docSnap.data() } as UserData;
              setUser(userData);
              // Clear error if data is successfully fetched
              setError(null);
            } else {
              // Instead of immediately setting an error, try to create the missing document
              try {
                console.warn(`UserContext: User document for UID ${uid} does not exist. Creating basic user document.`);
                const newUserData = await createMissingUserDocument(firebaseUser);
                setUser(newUserData);
                setError(null);
              } catch (createError) {
                console.error(`UserContext: Failed to create missing user document for UID ${uid}:`, createError);
                setError(new Error('Failed to create user profile. Please try refreshing the page.'));
              }
            }
            // Stop loading states after processing snapshot
            setLoading(false);
            setInitialLoading(false);
          },
          (error) => { // Firestore listener error
            console.error(`UserContext: Firestore snapshot error fetching user document for UID ${uid}:`, error);
            setError(error);
            setLoading(false);
            setInitialLoading(false); // Stop initial loading if an error occurs
          }
        );

        // Note: Original code returned unsubscribeUserDoc here, which is incorrect.
        // The cleanup should happen in the outer return statement or when auth state changes.

      } else { // No user logged in
        setUser(null);
        setLoading(false);
        setInitialLoading(false); // Stop initial loading if no user is logged in
        setError(null); // Clear any previous errors
      }
    });

    // --- EDIT 5: Cleanup Firestore listener on component unmount ---
    return () => {
      unsubscribeAuth(); // Unsubscribe from auth listener
      // Also unsubscribe from the Firestore listener if it's active
      if (unsubscribeUserDoc) {
        unsubscribeUserDoc();
      }
    };
  }, []);

  const updateUserData = async (data: Partial<UserData>) => {
    // Use the 'user' state variable directly
    if (!user) {
        console.error("updateUserData called when user is null");
        return;
    }
    const userDocRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userDocRef, data);

      // Manually update the user state to reflect changes immediately, then real data is updated afterwards in the background.
    setUser((prevUser) => (prevUser ? { ...prevUser, ...data } : prevUser));

    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };


  const saveTestProgress = async (type: 'diagnostic' | 'fullTest', progress: any) => {
    if (!user) return;
    
    const updates: Partial<UserData> = {};
    if (type === 'diagnostic') {
      updates.diagnosticTestProgress = progress;
    } else {
      updates.fullTestProgress = progress;
    }
    
    await updateUserData(updates);
  };
  
  //NEW on 3/25/2025 for the Diagnostic Test and Full-Length Tests: Not sure when this would be used though.
  const clearTestProgress = async (type: 'diagnostic' | 'fullTest') => {
    if (!user) return;
    
    const updates: Partial<UserData> = {};
    if (type === 'diagnostic') {
      updates.diagnosticTestProgress = null;
    } else {
      updates.fullTestProgress = null;
    }
    
    await updateUserData(updates);
  };

  // --- Implementations for Study Plan Task Functions ---
  // These now correctly use the 'user' state variable
  const updateStudyPlanTask = async (taskId: string, updates: Partial<StudyPlanTask>) => {
    if (!user || !user.studyPlan) {
      console.error("User or study plan not available for updating task.");
      return;
    }
    const currentPlan = user.studyPlan;
    let taskUpdated = false;
    const updatedWeeklyPlans = currentPlan.weeklyPlans.map(week => ({
      ...week,
      tasks: week.tasks.map(task => {
        if (task.id === taskId) {
          taskUpdated = true;
          return { ...task, ...updates };
        }
        return task;
      })
    }));

    if (taskUpdated) {
        await updateUserData({ studyPlan: { ...currentPlan, weeklyPlans: updatedWeeklyPlans } });
        console.log(`Study Plan Task Updated: ${taskId}`);
    } else {
        console.warn(`Task ${taskId} not found for update.`);
    }
  };

  const addStudyPlanTask = async (newTask: StudyPlanTask) => {
    if (!user || !user.studyPlan) {
      console.error("User or study plan not available for adding task.");
      return;
    }
    console.log("addStudyPlanTask: User and study plan available for adding task - placeholder below - must revist this April 23, 2025.");
    /*Placeholder below - must revist this April 23, 2025.
     const currentPlan = user.studyPlan;
     // Find the correct week (implementation depends on how weeks are identified/dated)
     // This is a simplified example assuming weekNumber matches index - adjust as needed!
     const targetWeekIndex = currentPlan.weeklyPlans.findIndex(week => week.weekNumber === newTask.weekNumber); // Or match by date range

     if (targetWeekIndex !== -1) {
        const updatedWeeklyPlans = [...currentPlan.weeklyPlans];
        // Ensure the new task has an ID if it doesn't already
        const taskWithId = { ...newTask, id: newTask.id || doc(collection(db, '_')).id };
        updatedWeeklyPlans[targetWeekIndex] = {
            ...updatedWeeklyPlans[targetWeekIndex],
            tasks: [...updatedWeeklyPlans[targetWeekIndex].tasks, taskWithId]
        };
        await updateUserData({ studyPlan: { ...currentPlan, weeklyPlans: updatedWeeklyPlans } });
        console.log(`Study Plan Task Added: ${taskWithId.description}`);
     } else {
       console.error("Could not find appropriate week for the new task.");
     }
  };

  const deleteStudyPlanTask = async (taskId: string) => {
    if (!user || !user.studyPlan) {
      console.error("User or study plan not available for deleting task.");
      return;
    }
    const currentPlan = user.studyPlan;
    let taskFound = false;
    const updatedWeeklyPlans = currentPlan.weeklyPlans.map(week => {
        const originalLength = week.tasks.length;
        const filteredTasks = week.tasks.filter(task => task.id !== taskId);
        if (filteredTasks.length < originalLength) {
            taskFound = true;
        }
        return { ...week, tasks: filteredTasks };
    });

    if (taskFound) {
        await updateUserData({ studyPlan: { ...currentPlan, weeklyPlans: updatedWeeklyPlans } });
        console.log(`Study Plan Task Deleted: ${taskId}`);
    } else {
        console.warn(`Task ${taskId} not found for deletion.`);
    }
  };

  // --- Implementations for Student Progress Functions ---
  const sendStudentInvitation = async (studentData: {
    firstName: string;
    email: string;
  }) => {
    if (!user) {
      console.error("User not available for sending student invitation.");
      return;
    }

    // Generate unique referral ID for tracking
    const referralId = uuidv4();
    const hashedReferralId = btoa(referralId); // Simple base64 encoding for URL safety

    // Update parent's record with student information
    const studentUpdateData = {
      studentEmail: studentData.email,
      studentFirstName: studentData.firstName,
      studentInvitedDate: new Date().toISOString(),
      studentReferralId: hashedReferralId,
    };

    await updateUserData(studentUpdateData);

    // Call Klaviyo invitation handler with student_invite type
    try {
      const response = await fetch('/api/klaviyo-invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'student_invite',
          inviterUserId: user.uid,
          inviterName: user.firstName,
          inviterEmail: user.email,
          inviteeEmail: studentData.email,
          inviteeFirstName: studentData.firstName,
          //**********NOTE: This is inviteeRole (because userRole is already occupied with parent's role) 
          // ---> So if Klaviyo uses any kind of conditional logic, use invitee_Role instead of user_role
          inviteeRole: 'student',
          referralId: hashedReferralId,
        }),
      });

      if (!response.ok) {
        console.error('Failed to send student invitation via Klaviyo');
      } else {
        console.log(`Student invitation sent successfully for ${studentData.email}`);
      }
    } catch (error) {
      console.error('Error sending student invitation:', error);
    }
  };



  // --- Implementations for Referral Functions ---
  const sendReferralInvitation = async (referralData: {
    firstName: string;
    lastName: string | null;
    email: string;
    role: 'parent' | 'student' | 'educator';
  }) => {
    if (!user) {
      console.error("User not available for sending referral invitation.");
      return;
    }

    // Generate unique referral ID
    const referralId = uuidv4();
    const hashedReferralId = btoa(referralId); // Simple base64 encoding for URL safety

    const newReferral = {
      id: referralId,
      firstName: referralData.firstName,
      lastName: referralData.lastName,
      email: referralData.email,
      role: referralData.role,
      invitedDate: new Date().toISOString(),
      signupDate: null,
      referralStatus: 'invited' as const,
      hashedReferralId: hashedReferralId,
    };

    // Add to user's referredUsers array
    const updatedReferredUsers = [...(user.referredUsers || []), newReferral];
    await updateUserData({ referredUsers: updatedReferredUsers });

    // Call Klaviyo invitation handler
    try {
      const response = await fetch('/api/klaviyo-invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'referral_invite',
          inviterUserId: user.uid,
          inviterName: user.firstName,
          inviterEmail: user.email,
          inviteeEmail: referralData.email,
          inviteeFirstName: referralData.firstName,
          inviteeLastName: referralData.lastName,
          inviteeRole: referralData.role,
          referralId: hashedReferralId,
        }),
      });

      if (!response.ok) {
        console.error('Failed to send referral invitation via Klaviyo');
        // Note: We've already updated the user data, so we don't rollback here
        // The invitation will show as "sent" but the email may not have been delivered
        // TODO: Future enhancement - add retry mechanism or status tracking
      } else {
        console.log(`Referral invitation sent successfully for ${referralData.email}`);
      }
    } catch (error) {
      console.error('Error sending referral invitation:', error);
      // Same note as above - we don't rollback the user data update
    }
  };

  const resendReferralInvitation = async (referralId: string) => {
    if (!user || !user.referredUsers) {
      console.error("User or referredUsers not available for resending invitation.");
      return;
    }

    const referral = user.referredUsers.find(r => r.id === referralId);
    if (!referral) {
      console.error(`Referral with ID ${referralId} not found.`);
      return;
    }

    if (referral.referralStatus !== 'invited') {
      console.warn(`Cannot resend invitation for user who has already signed up.`);
      return;
    }

    // Call Klaviyo invitation handler
    try {
      const response = await fetch('/api/klaviyo-invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'referral_invite',
          inviterUserId: user.uid,
          inviterName: user.firstName,
          inviterEmail: user.email,
          inviteeEmail: referral.email,
          inviteeFirstName: referral.firstName,
          inviteeLastName: referral.lastName,
          inviteeRole: referral.role,
          referralId: referral.hashedReferralId,
          isResend: true,
        }),
      });

      if (!response.ok) {
        console.error('Failed to resend referral invitation via Klaviyo');
      } else {
        console.log(`Referral invitation resent successfully for ${referral.email}`);
      }
    } catch (error) {
      console.error('Error resending referral invitation:', error);
    }
  };

  const userContextValue = {
    user,
    loading,
    initialLoading,
    error,
    isTrialExpired: user ? isTrialExpired(user) : false,
    daysLeftInTrial: user ? getDaysLeftInTrial(user) : null,
    updateUserData,
    saveTestProgress,
    clearTestProgress,
    updateStudyPlanTask,
    addStudyPlanTask,
    deleteStudyPlanTask,
    // --- NEW: Functions for Referral Management ---
    sendReferralInvitation,
    resendReferralInvitation,
    // --- END: Functions for Referral Management ---
    
    // --- NEW: Functions for Student Progress Tracking ---
    sendStudentInvitation,
    // --- END: Functions for Student Progress Tracking ---
  };

  return (
    <UserContext.Provider value={userContextValue}>
      {children}
    </UserContext.Provider>
  );
};*/
