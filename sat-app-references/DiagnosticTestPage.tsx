/* DiagnosticTest.tsx
import React, { useState, useEffect, useContext, useCallback, FormEvent, useRef } from 'react';
import { Box, Button, Typography, TextField, CircularProgress, useTheme, Paper, Divider, Chip } from '@mui/material';
import Grid from '@mui/material/Grid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import { motion, AnimatePresence } from "framer-motion";
import { UserContext, TestAttempt, SkillName, TestProgress, categories, SkillData, UserData } from '../UserAndProfile/UserContext';
import { PromptContext, TestState } from '../PromptContext';
//import { ReviewGrid } from './ReviewTestQGrid';
import { TestTimer, TestTimerRef } from './TestTimer';
import ChatComponent from '../ChatComponent';
import { useNavigate } from 'react-router-dom';
import TimerIcon from '@mui/icons-material/Timer';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { StyledHeroSection } from '../SecondPage';
import PersonalizedBar6 from './PersonalizedBar-6';
import { TestQuestion, UserAnswerRecord } from '../../types';
import { readingScoreTable, mathScoreTable, findScore } from '../dashboard-components/sat-score-estimation';
import { GradeDiagnosticTest } from './GradeTest';
// Define the question type based on your JSON structure


const DiagnosticTestPage: React.FC = () => {
  // Contexts
  const { user, updateUserData, saveTestProgress, clearTestProgress } = useContext(UserContext);
  const {clearChat, setQuestionText, setChoices, setCorrectAnswer, setExplanationText, 
    setSelectedSkill, renderLatexOrText, testState, setTestState, startTest, 
    endTest, markQuestion, interactionStage, setInteractionStage
  } = useContext(PromptContext)!; //'!' asserts that PromptContext is not null because PromptProvider wraps all of SecondPage.tsx
  const theme = useTheme();
  const navigate = useNavigate();

  // Helpers to mirror Skill Practice behavior
  const skillNameToKey = (skillName: string): string => {
    return skillName.toLowerCase().replace(/ /g, '_');
  };

  const createInitialSkillData = (): SkillData => ({
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
    overallQuestionsCorrect: 0
  });

  const checkAndUpdatePracticeDate = () => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    if (user.lastPracticedDate !== today) {
      updateUserData({
        totalDaysPracticed: (user.totalDaysPracticed || 0) + 1,
        lastPracticedDate: today,
      });
    }
  };

  const updateProgressForAnswer = (skillDisplayName: string, difficulty: 'Easy' | 'Medium' | 'Hard', isCorrect: boolean) => {
    if (!user) return;
    const skillKey = skillNameToKey(skillDisplayName);
    const currentSkillData: SkillData = user.skills?.[skillKey] || createInitialSkillData();

    // Build field-path updates to avoid sending the entire skills object
    const attemptedPath = `skills.${skillKey}.overallQuestionsAttempted`;
    const correctPath = `skills.${skillKey}.overallQuestionsCorrect`;
    const difficultyAttemptedPath = `skills.${skillKey}.currentTest${difficulty}QuestionsAttempted`;
    const difficultyCorrectPath = `skills.${skillKey}.currentTest${difficulty}QuestionsCorrect`;

    const updates: Record<string, any> = {
      [attemptedPath]: (currentSkillData.overallQuestionsAttempted || 0) + 1,
      [difficultyAttemptedPath]: (currentSkillData[`currentTest${difficulty}QuestionsAttempted` as keyof SkillData] as number || 0) + 1,
      grandTotalQuestionsAttempted: (user.grandTotalQuestionsAttempted || 0) + 1,
    };
    if (isCorrect) {
      updates[correctPath] = (currentSkillData.overallQuestionsCorrect || 0) + 1;
      updates[difficultyCorrectPath] = (currentSkillData[`currentTest${difficulty}QuestionsCorrect` as keyof SkillData] as number || 0) + 1;
      updates.grandTotalQuestionsCorrect = (user.grandTotalQuestionsCorrect || 0) + 1;
    } else {
      // Preserve existing correct counts when incorrect
      updates[correctPath] = (currentSkillData.overallQuestionsCorrect || 0);
      updates[difficultyCorrectPath] = (currentSkillData[`currentTest${difficulty}QuestionsCorrect` as keyof SkillData] as number || 0);
      updates.grandTotalQuestionsCorrect = (user.grandTotalQuestionsCorrect || 0);
    }
    // Apply updates; cast to any to allow field-path keys
    updateUserData(updates as any);
  };

  // State for test data and UI
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for current question
  const [currentQuestion, setCurrentQuestion] = useState<TestQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [incorrectAnswers, setIncorrectAnswers] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string>('');
  const [hasSubmittedFirstAttempt, setHasSubmittedFirstAttempt] = useState(false);
  const [lastQuestionTimestamp, setLastQuestionTimestamp] = useState<number>(0);

  // Timer reference
  const timerRef = useRef<TestTimerRef>(null);
  
  
  // Load diagnostic test questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('/satquestions/diagnostic-test.json');
        if (!response.ok) {
          throw new Error('Failed to load diagnostic test questions');
        }
        
        const data = await response.json();
        setQuestions(data.questions); //data.questions is an array of TestQuestion objects
        setLoading(false);
      } catch (err) {
        setError('Error loading diagnostic test: ' + (err instanceof Error ? err.message : String(err)));
        setLoading(false);
      }
    };
    
    fetchQuestions();
  }, []);
  
  // Set current question when index changes - does this handle the case where the user is on the last question and clicks next?
  useEffect(() => {
    if (questions.length > 0 && testState.isActive) {
      const question = questions[testState.currentQuestionIndex];
      setCurrentQuestion(question);

      // Reset previous question state
      setSelectedAnswer('');
      setIsAnswerSubmitted(false);
      setIncorrectAnswers([]);
      setHasSubmittedFirstAttempt(false);
      setFeedback('');
      
      // Update PromptContext for ChatComponent
      setQuestionText(question.question);
      setChoices(question.choices);
      setCorrectAnswer(question.answer);
      setExplanationText(question.explanation);
      setSelectedSkill(question.skill);
      //setSelectedDifficulty(question.difficulty); //Is there a reason to include this for reporting/analytics? 
      // If so, add to dependency array too.
    }
  }, [testState.currentQuestionIndex, questions, testState.isActive, setQuestionText, setChoices, setCorrectAnswer, setExplanationText, setSelectedSkill]);
  

  // This is for RESUMING DIAGNOSTIC TEST ***
  useEffect(() => {
    // Guard clauses: ensure data is ready, test isn't active, and not loading questions
    if (!user || !user.diagnosticTestProgress || questions.length === 0 || testState.isActive || loading) {
      return;
    }
    // --- Resume Logic ---
    const savedProgress: TestProgress = user.diagnosticTestProgress;

    // Validate saved question index
    if (savedProgress.currentQuestionIndex < 0 || savedProgress.currentQuestionIndex >= questions.length) {
      console.error(`Invalid question index (${savedProgress.currentQuestionIndex}) in saved diagnostic progress. Clearing progress.`);
      clearTestProgress('diagnostic'); // Clear invalid progress
      return;
    }
    console.log(`Found saved diagnostic progress. Resuming at question ${savedProgress.currentQuestionIndex + 1}...`);

    // 1. Update PromptContext's testState
    setTestState({
      type: 'diagnostic',
      isActive: true,
      currentQuestionIndex: savedProgress.currentQuestionIndex,
      answers: savedProgress.answers || [], // Load saved answers
      markedQuestions: savedProgress.markedQuestions || [], // Load saved marks
      totalQuestions: questions.length, // Total questions for the diagnostic
      startTime: Date.now() - (savedProgress.elapsedTime || 0), // Approximate original start time
      elapsedTime: savedProgress.elapsedTime || 0, // Load saved elapsed time
    });
    setInteractionStage('questionGenerated');

    setLastQuestionTimestamp(savedProgress.elapsedTime || 0); // Set timestamp for time tracking

  }, [user, questions, testState.isActive, setTestState, loading, clearTestProgress]); // Dependencies for resume effect


  // Start the diagnostic test
  const handleStartTest = useCallback(() => {
    if (questions.length > 0) {
      clearChat();
      startTest('diagnostic', questions.length);
      setLastQuestionTimestamp(0);
      // Align practice streak metrics with Skill Practice
      checkAndUpdatePracticeDate();
    }
    else {
      console.error('No questions found for diagnostic test.');
    }
  }, [questions, startTest, clearChat]);
  
  // Handle answer selection
  const handleAnswerSelect = (answer: string) => {
    if (!isAnswerSubmitted) {
      setSelectedAnswer(answer);
    }
  };
  
  /* Handle answer submission
  const handleSubmit = () => {
    if (!selectedAnswer || !currentQuestion) return;
    
    const isCorrect = selectedAnswer === currentQuestion.answer;
    
    // Update test state with the answer
    setTestState((prev: TestState) => {
      const answers = [...prev.answers];
      const existingAnswerIndex = answers.findIndex(a => a.questionIndex === prev.currentQuestionIndex);
      
      if (existingAnswerIndex >= 0) {
        // Update existing answer
        answers[existingAnswerIndex] = {
          ...answers[existingAnswerIndex],
          answer: selectedAnswer,
          isCorrect
        };
      } else {
        // Add new answer
        answers.push({
          questionIndex: prev.currentQuestionIndex,
          answer: selectedAnswer,
          isCorrect,
          skill: currentQuestion.skill,
          difficulty: currentQuestion.difficulty
        });
      }
      
      return {
        ...prev,
        answers
      };
    });
    
    // Set feedback based on correctness
    if (isCorrect) {
      setFeedback("Correct! " + currentQuestion.explanation);
    } else {
      setIncorrectAnswers([...incorrectAnswers, selectedAnswer]);
      setFeedback(`Incorrect. The correct answer is ${currentQuestion.answer}. ${currentQuestion.explanation}`);
    }
    
    setIsAnswerSubmitted(true);
    setHasSubmittedFirstAttempt(true);
    
    // Save progress to user data
    if (user) {
      saveTestProgress('diagnostic', {
        currentQuestionIndex: testState.currentQuestionIndex,
        answers: testState.answers,
        markedQuestions: testState.markedQuestions,
        elapsedTime: timerRef.current?.getElapsedTime() || 0,
        startTime: testState.startTime
      });
    }
  };
  
  
  // Handle navigation to next question
  const handleNextQuestion = () => {
    let timeSpentOnQuestion = 0;
    const currentTime = timerRef.current?.getElapsedTime() || 0;

    timeSpentOnQuestion = currentTime - lastQuestionTimestamp;
    //console.log("handleNextQuestion: timeSpentOnQuestion is ", timeSpentOnQuestion, "and currentTime is ", currentTime, "and lastQuestionTimestamp is ", lastQuestionTimestamp);

    // If an answer was selected, record it (keeping the grading logic)
    if (selectedAnswer && currentQuestion) {

      const selectedLetter = selectedAnswer[0];
      const correctLetter = currentQuestion.answer[0];
      const isCorrect = selectedLetter === correctLetter;

      const answerIndex = testState.answers.findIndex(a => a.questionIndex === testState.currentQuestionIndex);

      let nextAnswers: UserAnswerRecord[];
      let firstSubmissionForThisQuestion = false;

      if (answerIndex >= 0) {
        const previousTimeSpent = testState.answers[answerIndex].timeSpent || 0;
        const newTimeSpent = previousTimeSpent + timeSpentOnQuestion;
        // Update existing answer (no progress counter updates)
        nextAnswers = testState.answers.map((a, idx) =>
          idx === answerIndex
            ? {
                ...a,
                selectedAnswer: selectedAnswer,
                correctAnswer: correctLetter,
                isCorrect,
                // Keep it simple: overwrite timeSpent with the most recent stint
                timeSpent: newTimeSpent,
                // Keep skill/difficulty consistent with the current question just in case
                skill: currentQuestion.skill,
                difficulty: currentQuestion.difficulty,
              }
            : a
        );
      } else {
        // First submission for this question (increment counters once)
        firstSubmissionForThisQuestion = true;
        const newAnswer: UserAnswerRecord = {
          questionIndex: testState.currentQuestionIndex,
          selectedAnswer,
          correctAnswer: correctLetter,
          isCorrect,
          skill: currentQuestion.skill,
          difficulty: currentQuestion.difficulty,
          timeSpent: timeSpentOnQuestion,
        };
        nextAnswers = [...testState.answers, newAnswer];
      }

      // Apply answers to state immediately
      //This is directly passed to the handleFinishTestSection function because setTestState is asynchronous and won't update in time. - DONT DELETE THIS LINE
      setTestState((prev: TestState) => ({
        ...prev,
        answers: nextAnswers,
      }));


      // Update per-answer progress in Firestore (skills + grand totals, difficulty-specific)
      updateProgressForAnswer(currentQuestion.skill, currentQuestion.difficulty as 'Easy' | 'Medium' | 'Hard', isCorrect);

      // Update the last question timestamp
      setLastQuestionTimestamp(currentTime);

      // Move to next or finish
      if (testState.currentQuestionIndex < questions.length - 1) {
        setTestState((prev: TestState) => ({
          ...prev,
          currentQuestionIndex: prev.currentQuestionIndex + 1,
        }));
        setSelectedAnswer('');
        setIsAnswerSubmitted(false);
      } else {
        handleFinishTestSection(nextAnswers);
      }
    } else { //Handles the case when no answer is selected - just move to the next question.
      if (testState.currentQuestionIndex < questions.length - 1) {
        setTestState((prev: TestState) => ({
            ...prev,
            currentQuestionIndex: prev.currentQuestionIndex + 1
        }));

        // Reset for the next question
        setSelectedAnswer('');
        setIsAnswerSubmitted(false);
      } else {
          // This is the last question, finish the test or section
          handleFinishTestSection(testState.answers);
      }
    }

    
  };
  
  // Handle navigation to previous question
  const handlePreviousQuestion = () => {
    if (testState.currentQuestionIndex > 0) {
      setTestState((prev: TestState) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1
      }));
    }
  };
  
  // Toggle marking a question for review
  const toggleMarkQuestion = () => {
    markQuestion(testState.currentQuestionIndex);
  };
  
  // Handle direct navigation to a specific question
  const handleQuestionSelect = (index: number) => {
    setTestState((prev: TestState) => ({
      ...prev,
      currentQuestionIndex: index
    }));
  };
  
  // Finish the test and save results
  const handleFinishTestSection = (newAnswers: UserAnswerRecord[]) => {
    // End the test in PromptContext
    endTest();
    // Calculate scores and create test attempt record
    if (user && questions.length > 0) {
      const totalElapsedTime = timerRef.current?.getElapsedTime() || 0;

      // Create initial test attempt record (without scores)
      let testAttempt: TestAttempt = { // Use 'let' so we can add scores later
        id: `diagnostic-${Date.now()}`,
        testType: 'diagnostic',
        date: new Date().toISOString(),
        completed: true,
        sections: [
          {
            sectionNumber: 1, 
            questions: newAnswers,
            elapsedTime: totalElapsedTime
          }
        ],
        // Scores will be added after grading
        // Remove diagnosticReadingWritingScores, diagnosticMathScores, diagnosticTotalScores
      };

      // Calculate scores using the utility function
      const gradedScores = GradeDiagnosticTest(testAttempt);

      // Update the testAttempt with the calculated scores
      testAttempt.readingWritingScore = gradedScores.readingWritingScore;
      testAttempt.mathScore = gradedScores.mathScore;
      testAttempt.totalScore = gradedScores.totalScore;
      testAttempt.diagnosticReadingWritingScores = gradedScores.diagnosticReadingWritingScores;
      testAttempt.diagnosticMathScores = gradedScores.diagnosticMathScores;
      testAttempt.diagnosticTotalScores = gradedScores.diagnosticTotalScores;

      console.log('Graded test attempt: ', testAttempt);

      // Update user data with the complete test attempt
      updateUserData({
        testAttempts: [...(user.testAttempts || []), testAttempt],
        diagnosticTestProgress: null // Clear in-progress test (Firebase can use null but not undefined.)
      });
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <Box sx={{ p: 3, maxWidth: '1400px', mx: 'auto', mt: { xs: '80px', sm: '100px' } }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-start' }}>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/sat')}>
            Back to Dashboard
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>Loading diagnostic test...</Typography>
        </Box>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 3, maxWidth: '1400px', mx: 'auto', mt: { xs: '80px', sm: '100px' } }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-start' }}>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/sat')}>
            Back to Dashboard
          </Button>
        </Box>
        <Typography variant="h6" color="error">{error}</Typography>
        <Button variant="contained" onClick={() => window.location.reload()}>Reload</Button>
      </Box>
    );
  }
  
  
  // Render test completion screen - This is a placeholder 
  // DELETE THIS AFTER IMPLEMENTING PostTestResultsPage.tsx, making sure the FinishTest button redirects there.
  if (!testState.isActive && testState.answers.length > 0) {
    const totalCorrect = testState.answers.filter(a => a.isCorrect).length;
    const percentCorrect = Math.round((totalCorrect / questions.length) * 100);
    
    return (
      <Box sx={{ p: 3, maxWidth: '800px', mx: 'auto' }}>
        <Typography variant="h4" sx={{ mb: 3 }}>Diagnostic Test Complete</Typography>
        <Typography variant="h6" sx={{ mb: 2 }}>
          You answered {totalCorrect} out of {questions.length} questions correctly ({percentCorrect}%).
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Your results have been saved. You can view your detailed performance in the dashboard.
        </Typography>
        <Button variant="contained" color="primary"
          onClick={() => navigate('/diagnostic-test-results')}
        >
          See Your Results!
        </Button>
      </Box>
    );
  }
  
  // Render active test
  return (

    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <StyledHeroSection/>
      {!testState.isActive ? (
        <Box sx={{ p: 3, maxWidth: '800px', mx: 'auto' }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-start' }}>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/sat')}>
              Back to Dashboard
            </Button>
          </Box>
          <Typography variant="h4" sx={{ mb: 3 }}>SAT Diagnostic Test</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            This diagnostic test will help us understand your current skill level and create a personalized study plan.
            The test contains {questions.length} questions and covers various SAT topics.
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            You can mark questions for review and return to them later. Your progress will be saved automatically.
          </Typography>
          <Button variant="contained" color="primary" size="large"onClick={handleStartTest}>
            Start Diagnostic Test
          </Button>
        </Box>
      ) : 
      ( 
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          
          {/*<Box sx={{ position: 'absolute', height: 0}}>
            <TestTimer ref={timerRef} mode="elapsed" />
          </Box>
        
        
          {/*<PersonalizedBar1 title="Diagnostic Test" currentIndex={testState.currentQuestionIndex} totalItems={questions.length} timerRef={timerRef}/>
          <PersonalizedBar6 title="Diagnostic Test" 
            currentIndex={testState.currentQuestionIndex} 
            totalItems={questions.length} 
            timerRef={timerRef}
            currentAnswers={testState.answers.map(a => ({
              questionIndex: a.questionIndex,
              answer: a.selectedAnswer,
              isCorrect: a.isCorrect
            }))}
            markedQuestions={testState.markedQuestions}
            onNavigate={handleQuestionSelect}
            showResults={!testState.isActive && testState.answers.length > 0}
          />

          
          <Box sx={{flex: 1, display: 'flex', flexDirection: 'column', gap: 0, paddingX: '3vw'}}>
          
            {/* Current question with enhanced styling 
            <AnimatePresence mode="wait">
              {currentQuestion && (
                <motion.div
                  key={testState.currentQuestionIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box sx={{flex: 1, overflow: 'auto', bgcolor: 'background.paper', p: 3, borderRadius: 2, 
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', border: '1px solid', borderColor: 'divider'}}>
                    <Box sx={{display: 'flex', flexDirection: 'row', gap: 1, justifyContent: 'space-between'}}>
                      <Box sx={{display: 'flex', flexDirection: 'column', gap: 1, mb: 3, minWidth: '300px', maxWidth: '65%'}}>
                        {/* Question skill and difficulty 
                        <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                            Skill: {currentQuestion.skill}  •  Difficulty: {currentQuestion.difficulty}
                        </Typography>
                        {/* Question text 
                        <Box sx={{ mb: 3, minWidth: '300px'}}>
                          {currentQuestion.pictureURL && (
                            <Box sx={{ mb: 2, textAlign: 'center' }}>
                              <img src={currentQuestion.pictureURL}
                                alt={`Diagram for question ${testState.currentQuestionIndex + 1}`}
                                style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto', borderRadius: '4px', border: `1px solid ${theme.palette.divider}` }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  console.warn(`Failed to load image: ${currentQuestion.pictureURL}`);
                                }}
                              />
                            </Box>
                          )}
                          {renderLatexOrText(currentQuestion.question)}
                        </Box>
                      </Box>
          
                      
                      {/* Answer choices 
                      <Box sx={{ mb: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {currentQuestion.choices.map((choice, index) => {
                          const choiceLetter = String.fromCharCode(65 + index); // A, B, C, D
                          const isSelected = selectedAnswer === choiceLetter;
                          const isCorrectAnswer = currentQuestion.answer === choiceLetter;
                          const isIncorrectSelection = isAnswerSubmitted && isSelected && !isCorrectAnswer;
                          
                          return (
                              <Box key={index} onClick={() => handleAnswerSelect(choiceLetter)}
                              sx={{p: 1, mb: 0, borderRadius: 2, border: 2, minWidth: {xs: '100%', md: '300px', xl: '500px'},
                                  borderColor: isSelected ? 'primary.main' : 'divider',
                                  bgcolor: isAnswerSubmitted
                                  ? isCorrectAnswer
                                      ? 'success.light'
                                      : isIncorrectSelection
                                      ? 'error.light'
                                      : 'background.paper'
                                  : isSelected 
                                      ? theme.palette.custom.veryLightOrange // Very light orange background when selected 
                                      : 'background.paper',

                                  cursor: isAnswerSubmitted ? 'default' : 'pointer',
                                  transition: 'all 0.2s ease',

                                  '&:hover': {
                                      transform: isAnswerSubmitted ? 'none' : 'scale(1.01)',
                                      boxShadow: isAnswerSubmitted ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.1)',
                                      bgcolor: isAnswerSubmitted 
                                      ? isCorrectAnswer
                                          ? 'success.light'
                                          : isIncorrectSelection
                                          ? 'error.light'
                                          : 'background.paper'
                                      : isSelected
                                          ? 'rgba(241, 101, 34, 0.12)' // Slightly darker on hover when selected
                                          : 'rgba(0, 0, 0, 0.04)' // Light gray on hover when not selected
                                  }
                              }}
                              >
                              <Typography variant="body1" component="div">
                                  {renderLatexOrText(choice)}
                              </Typography>
                              </Box>
                          );
                          })}
                      </Box>
                    </Box>


                    {/* Feedback after submission - NOTE TO IVAN on 3/27/2025 commented out for now, but consider when/how to integrate this later in other components. 
                    {isAnswerSubmitted && (
                        <Box sx={{mt: 2, p: 2, borderRadius: 1,
                        bgcolor: selectedAnswer === currentQuestion.answer ? 'success.light' : 'error.light',
                        }}>
                        <Typography variant="h6" sx={{ mb: 1, color: 'text.primary', fontWeight: 'bold' }}>
                            {selectedAnswer === currentQuestion.answer ? 'Correct!' : 'Incorrect'}
                        </Typography>
                        <Typography variant="body1" component="div">
                            {renderLatexOrText(currentQuestion.explanation)}
                        </Typography>
                        </Box>
                    )} 
                    
                    {/* Navigation buttons 
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                      <Button variant="outlined" startIcon={<ArrowBackIcon />}
                        onClick={handlePreviousQuestion}
                        disabled={testState.currentQuestionIndex === 0}
                      >
                      Previous
                      </Button>
                      
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button variant="outlined" color="secondary" onClick={toggleMarkQuestion}>
                            {testState.markedQuestions.includes(testState.currentQuestionIndex) 
                            ? 'Unmark Question' 
                            : 'Mark for Review'}
                        </Button>
                      
                        {/* Previously had  "": handleSubmit" after handleNext question, but it's been removed as of 3/27/2025
                        <Button variant="contained" color="primary" onClick={handleNextQuestion} endIcon={<SkipNextIcon />}>
                            {testState.currentQuestionIndex === questions.length - 1 
                                ? 'Finish Test' 
                                : 'Next Question'}
                        </Button>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{mt: 2}}>
                      <ChatComponent />
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>
        </Box>
      )}
  </Box>

    

    
  );
};

export default DiagnosticTestPage;

*/