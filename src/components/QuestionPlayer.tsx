// New enhanced QuestionPlayer.tsx - heavily inspired by your MUI version

"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, SkipForward, Bookmark, BookmarkCheck, Clock, Image as ImageIcon, Menu, X } from "lucide-react";
import { TestSection, TestQuestion, Attempt } from "@/types/models";
import { useUser } from "@/contexts/UserContext";
import { db } from "@/lib/firebase";
import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { TestHeader } from "./TestHeader";
import { TestTimer, TestTimerRef } from "./TestTimer";
import { QuestionNavigator } from "./QuestionNavigator";
import { VoiceTutor } from "./VoiceTutor";
import { useRouter } from "next/navigation";

export type QuestionPlayerProps = {
  state: string;
  testId: string;
  subject: string;
  standardId: string;
  sections: TestSection[];
};

export const QuestionPlayer: React.FC<QuestionPlayerProps> = ({ 
  state, 
  testId, 
  subject, 
  standardId, 
  sections 
}) => {
  const { firebaseUser } = useUser();
  const router = useRouter();
  const timerRef = useRef<TestTimerRef>(null);
  
  // Flatten all questions from all sections with section context
  const allQuestions = useMemo(() => {
    const flattened: Array<TestQuestion & { section: TestSection; sectionIndex: number }> = [];
    sections.forEach((section, sectionIndex) => {
      section.questions.forEach(question => {
        flattened.push({ ...question, section, sectionIndex });
      });
    });
    return flattened;
  }, [sections]);

  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [startedAtMs, setStartedAtMs] = useState<number>(Date.now());
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [selectedChoices, setSelectedChoices] = useState<string[]>([]);
  const [essayText, setEssayText] = useState<string>(""); //I feel like I need this, don't I?? But not 100% sure.
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [markedQuestions, setMarkedQuestions] = useState<number[]>([]);
  const [points, setPoints] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(true);
  const [showNavigator, setShowNavigator] = useState<boolean>(true); // Show by default now
  const [submittedAnswers, setSubmittedAnswers] = useState<Array<{
    questionIndex: number;
    answer: string;
    isCorrect?: boolean;
  }>>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null); //unsure how we're doing essays now.

  const currentQuestion = allQuestions[questionIndex];
  const isLastQuestion = questionIndex >= allQuestions.length - 1;
  const isMarked = markedQuestions.includes(questionIndex);
  const isMultiSelect = Array.isArray(currentQuestion?.correctAnswer);

  // Word count for essays
  const wordCount = useMemo(() => {
    return essayText.trim().split(/\s+/).filter(word => word.length > 0).length;
  }, [essayText]);

  // Count completed questions (submitted) - THIS PROBABLY NEEDS TO BE REVISITED ONCE QuestionNavigator is implemented!!!
  const completedCount = useMemo(() => {
    // Now we track actual submitted answers
    return submittedAnswers.length;
  }, [submittedAnswers]);

  // Reset state when question changes
  useEffect(() => {
    setShowExplanation(false);
    setSelectedChoices([]);
    setEssayText("");
    setIsSubmitted(false);
    setStartedAtMs(Date.now());
  }, [questionIndex]);

  const saveAttempt = async (userAnswer: string, isCorrect?: boolean) => {
    if (!firebaseUser || !currentQuestion) return;

    const now = Date.now();
    const attemptId = `${currentQuestion.number}-${now}`;
    
    const attempt: Attempt = {
      id: attemptId,
      uid: firebaseUser.uid,
      state,
      testId,
      subject,
      standardId,
      questionId: currentQuestion.number.toString(),
      questionType: 'mcq', //****THIS WILL NEED TO CHANGE FOR ESSAYS / FREE RESPONSE QUESTIONS */
      difficulty: 'Medium', // Default since not specified in JSON
      startedAt: startedAtMs,
      submittedAt: now,
      timeSpentMs: now - startedAtMs,
      userAnswer,
      isCorrect: isCorrect || null,
      //freeResponse: currentQuestion.type === "essay" ? userAnswer : null, Not sure how we're doing ESSAYS.
      explanationViewed: showExplanation,
      tutorUsed: false,
      classroomId: null,
      assignmentId: null,
      createdAt: now,
    };

    try {
      const attemptRef = doc(collection(db, `users/${firebaseUser.uid}/attempts`), attemptId);
      await setDoc(attemptRef, {
        ...attempt,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Failed to save attempt:", error);
    }
  };

  const handleChoiceSelect = (choice: string) => {
    if (isSubmitted) return;
    
    const choiceKey = choice.split(')')[0]; // Extract A, B, C, D
    
    if (isMultiSelect) {
      setSelectedChoices(prev => 
        prev.includes(choiceKey)
          ? prev.filter(c => c !== choiceKey)
          : [...prev, choiceKey]
      );
    } else {
      setSelectedChoices([choiceKey]);
    }
  };

  const handleSubmit = async () => {
    if (selectedChoices.length === 0 || isSubmitted) return;
    
    const userAnswer = isMultiSelect ? selectedChoices.sort().join(',') : selectedChoices[0];
    let isCorrect = false;
    
    if (isMultiSelect) {
      const correctAnswers = (currentQuestion.correctAnswer as string[]).sort();
      isCorrect = JSON.stringify(selectedChoices.sort()) === JSON.stringify(correctAnswers);
    } else {
      isCorrect = selectedChoices[0] === currentQuestion.correctAnswer;
    }
    
    await saveAttempt(userAnswer, isCorrect);
    setIsSubmitted(true);
    setShowExplanation(true);
    
    // Add to submitted answers for navigator
    setSubmittedAnswers(prev => {
      const existing = prev.find(a => a.questionIndex === questionIndex);
      if (existing) {
        return prev.map(a => 
          a.questionIndex === questionIndex 
            ? { ...a, answer: userAnswer, isCorrect }
            : a
        );
      }
      return [...prev, { questionIndex, answer: userAnswer, isCorrect }];
    });
    
    // Add points and streak
    if (isCorrect) {
      const pointsEarned = 15; // Default points - adjust later on depending on difficulty?
      setPoints(prev => prev + pointsEarned);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (questionIndex < allQuestions.length - 1) {
      setQuestionIndex(questionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (questionIndex > 0) {
      setQuestionIndex(questionIndex - 1);
    }
  };

  const toggleMarkQuestion = () => {
    setMarkedQuestions(prev => 
      prev.includes(questionIndex) 
        ? prev.filter(i => i !== questionIndex)
        : [...prev, questionIndex]
    );
  };

  const handleNavigateToQuestion = (index: number) => {
    setQuestionIndex(index);
    // setShowNavigator(false); // Close navigator on mobile after selection - I DON'T KNOW IF I WANTTHIS ***REVISIT NEXT TIME AI LOOKS AT THIS!!***
  };

  const handleBackToStandards = () => {
    // Stop timer and navigate back
    setIsTimerActive(false);
    router.push('/standards');
  };

  const handleTimerToggle = () => {
    setIsTimerActive(prev => !prev);
  };

  if (!currentQuestion) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No questions available for this standard.</p>
      </div>
    );
  }

  const { section } = currentQuestion;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with timer - full width */}
      <TestHeader
        title={`${section.name}: ${section.label}`}
        currentIndex={questionIndex + 1}
        totalItems={allQuestions.length}
        timerRef={timerRef}
        onBackClick={handleBackToStandards}
        backLabel="Return"
        completedItems={completedCount}
        showTimer={true}
        sectionInfo={`${subject} Practice`}
        showNavigator={showNavigator}
        onToggleNavigator={() => setShowNavigator(!showNavigator)}
      />

      {/* Hidden timer component for functionality */}
      <div className="hidden">
        <TestTimer
          ref={timerRef}
          mode="elapsed"
          isActive={isTimerActive}
          onToggle={handleTimerToggle}
          showControls={false}
        />
      </div>

      {/* Responsive container for all content below header */}
      <div className="flex-1 w-full max-w-[96vw] mx-auto px-[2vw]">
        {/* Question Navigator - Above main content, constrained width */}
        {showNavigator && (
          <div className="my-2">
            <div className="mx-auto">
              <QuestionNavigator
                totalItems={allQuestions.length}
                currentIndex={questionIndex}
                currentAnswers={submittedAnswers}
                markedQuestions={markedQuestions}
                onNavigate={handleNavigateToQuestion}
                showResults={false}
              />
            </div>
          </div>
        )}

        {/* Main content area */}
        <div className="py-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={questionIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-sm border overflow-hidden"
            >
              {/* Section header */}
              <div className="bg-gray-50 px-8 py-4 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    {section.title && (
                      <h2 className="text-lg font-semibold text-gray-900 mb-1">
                        {section.title}
                        {section.author && <span className="text-gray-700"> by {section.author}</span>}
                        {section.year && <span className="text-gray-700"> ({section.year})</span>}
                      </h2>
                    )}
                    {section.subtitle && (
                      <p className="text-sm text-gray-700 mt-1">{section.subtitle}</p>
                    )}
                    {section.directions && (
                      <p className="text-sm text-gray-700 mt-2">{section.directions}</p>
                    )}
                  </div>
                  <button
                    onClick={toggleMarkQuestion}
                    className={`p-2 rounded-lg transition-colors ${
                      isMarked 
                        ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {isMarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Dynamic layout: 60/40 for essays, 50/50 for regular content */}
              <div className={`grid grid-cols-1 lg:grid-cols-5 min-h-[600px] max-h-[600px]`}>
                {/* Left side - Passage (scrollable) - 60% for essays, 50% otherwise */}
                <div className={`${section.passage && section.passage.length > 1000 ? 'lg:col-span-3' : 'lg:col-span-2'} border-r border-gray-200`}>
                  <div className="p-8 h-full overflow-y-auto max-h-[600px]">
                    {section.context && (
                      <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                        <p className="text-sm font-medium text-blue-800 mb-2">Context:</p>
                        <p className="text-blue-700 text-sm leading-relaxed">{section.context}</p>
                      </div>
                    )}
                    
                    {section.passage && (
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-line text-gray-900 leading-relaxed">
                          {section.passage}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side - Question and choices - 40% for essays, 50% otherwise */}
                <div className={`${section.passage && section.passage.length > 1000 ? 'lg:col-span-2' : 'lg:col-span-3'} p-8 flex flex-col max-h-[600px] overflow-y-auto`}>
                  {/* Image if present */}
                  {section.pictureURL && (
                    <div className="mb-6 text-center flex-shrink-0">
                      <img 
                        src={`/public/${section.pictureURL}`} 
                        alt={section.title || 'Question image'}
                        className="max-w-full h-auto rounded-lg border shadow-sm"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Question */}
                  <div className="mb-6 flex-shrink-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Question {currentQuestion.number}
                    </h3>
                    <p className="text-gray-900 leading-relaxed">
                      {currentQuestion.questionText}
                    </p>
                    {isMultiSelect && (
                      <p className="text-sm text-orange-600 mt-2 font-medium">
                        Select all that apply (multiple answers required)
                      </p>
                    )}
                  </div>

                  {/* Choices */}
                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {currentQuestion.choices.map((choice, choiceIndex) => {
                      const choiceKey = choice.split(')')[0];
                      const isSelected = selectedChoices.includes(choiceKey);
                      const isCorrectChoice = isMultiSelect 
                        ? (currentQuestion.correctAnswer as string[]).includes(choiceKey)
                        : choiceKey === currentQuestion.correctAnswer;
                      const isIncorrectSelection = isSubmitted && isSelected && !isCorrectChoice;
                      
                      return (
                        <button
                          key={choiceIndex}
                          onClick={() => handleChoiceSelect(choice)}
                          disabled={isSubmitted}
                          className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 ${
                            isSubmitted
                              ? isCorrectChoice
                                ? 'bg-green-50 border-green-300 text-green-800'
                                : isIncorrectSelection
                                ? 'bg-red-50 border-red-300 text-red-800'
                                : 'bg-gray-50 border-gray-200 text-gray-700'
                              : isSelected
                              ? 'bg-orange-50 border-orange-300 text-orange-800'
                              : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                          } ${!isSubmitted ? 'cursor-pointer' : 'cursor-default'}`}
                        >
                          <span className="font-medium text-gray-900">{choice}</span>
                          {isMultiSelect && isSelected && !isSubmitted && (
                            <span className="ml-2 text-orange-600">✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Submit button */}
                  {!isSubmitted && (
                    <button
                      onClick={handleSubmit}
                      disabled={selectedChoices.length === 0}
                      className="w-full mt-6 px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                    >
                      Submit Answer
                    </button>
                  )}
                </div>
              </div>

              {/* Explanation */}
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="border-t"
                >
                  <div className="p-8 bg-blue-50 border-l-4 border-blue-400 mx-8 my-6 rounded-r-lg">
                    <p className="text-sm font-semibold text-blue-800 mb-2">Explanation:</p>
                    <p className="text-blue-700 leading-relaxed">
                      {currentQuestion.explanationText}
                    </p>
                    <div className="mt-3 text-xs text-blue-600">
                      <span className="font-medium">Standards:</span> {currentQuestion.standards.join(', ')}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Navigation */}
              <div className="flex justify-between items-center p-8 border-t bg-gray-50">
                <button
                  onClick={handlePrevious}
                  disabled={questionIndex === 0}
                  className="flex items-center gap-2 px-6 py-3 text-gray-700 border-2 border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </button>
                
                <span className="text-sm text-gray-700 font-medium">
                  {questionIndex + 1} of {allQuestions.length}
                </span>

                <button
                  onClick={handleNext}
                  disabled={isLastQuestion}
                  className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLastQuestion ? "Complete" : "Next"}
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Completion message */}
        {isLastQuestion && isSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-6 pb-8"
          >
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-green-800 mb-2">
                Outstanding work!
              </h3>
              <p className="text-green-700 mb-4">
                You've completed all {allQuestions.length} questions for this standard.
              </p>
              <div className="flex justify-center gap-4">
                <div className="bg-white px-4 py-2 rounded-lg">
                  <span className="text-2xl font-bold text-green-600">{points}</span>
                  <p className="text-sm text-gray-600">Total Points</p>
                </div>
                {streak > 0 && (
                  <div className="bg-white px-4 py-2 rounded-lg">
                    <span className="text-2xl font-bold text-orange-600">{streak}</span>
                    <p className="text-sm text-gray-600">Best Streak</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Voice Tutor - Always available floating button */}
        <VoiceTutor questionContext={`
            Question: ${currentQuestion.questionText}
            Passage: ${section.passage ? section.passage.substring(0, 500) + '...' : 'No passage'}
            Subject: ${subject}
            Standards: ${currentQuestion.standards?.join(', ') || 'General'}
            Section: ${section.name} - ${section.label}
            ${section.title ? `Title: ${section.title}` : ''}
            ${section.author ? `Author: ${section.author}` : ''}
        `.trim()} />
      </div>
    </div>
  );
};