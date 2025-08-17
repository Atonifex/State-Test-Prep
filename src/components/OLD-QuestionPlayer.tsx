/*"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Attempt, EssayQuestion, McqQuestion, Question } from "@/types/models";
import { useUser } from "@/contexts/UserContext";
import { db } from "@/lib/firebase";
import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";

export type QuestionPlayerProps = {
  state: string;
  testId: string;
  subject: string;
  standardId: string;
  questions: Question[];
};

export const QuestionPlayer: React.FC<QuestionPlayerProps> = ({ state, testId, subject, standardId, questions }) => {
  const { firebaseUser } = useUser();
  const [index, setIndex] = useState<number>(0);
  const [startedAtMs, setStartedAtMs] = useState<number>(Date.now());
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [essayText, setEssayText] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentQuestion = questions[index];
  const isLastQuestion = index >= questions.length - 1;

  // Word count for essays
  const wordCount = useMemo(() => {
    return essayText.trim().split(/\s+/).filter(word => word.length > 0).length;
  }, [essayText]);

  // Reset state when question changes
  useEffect(() => {
    setShowExplanation(false);
    setSelectedChoice(null);
    setEssayText("");
    setIsSubmitted(false);
    setStartedAtMs(Date.now());
  }, [index]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [essayText]);

  const saveAttempt = async (userAnswer: string, isCorrect?: boolean) => {
    if (!firebaseUser || !currentQuestion) return;

    const now = Date.now();
    const attemptId = `${currentQuestion.id}-${now}`;
    
    const attempt: Attempt = {
      id: attemptId,
      uid: firebaseUser.uid,
      state,
      testId,
      subject,
      standardId,
      questionId: currentQuestion.id,
      questionType: currentQuestion.type,
      difficulty: currentQuestion.difficulty,
      
      // Timing
      startedAt: startedAtMs,
      submittedAt: now,
      timeSpentMs: now - startedAtMs,
      
      // Answer data
      userAnswer,
      isCorrect: isCorrect || null,
      //      correct: currentQuestion.type === "mcq" ? (selectedChoice != null ? selectedChoice === (currentQuestion as McqQuestion).answer : null) : null,
      //selectedChoice: currentQuestion.type === "mcq" ? userAnswer : null,
      //freeResponse: currentQuestion.type === "essay" ? userAnswer : null,
      
      // Interaction tracking
      explanationViewed: showExplanation,
      tutorUsed: false,
      
      // Assignment context (will be populated later)
      classroomId: null,
      assignmentId: null,
      
      // Firestore will overwrite this with serverTimestamp()
      createdAt: now,
    };

    try {
      const attemptRef = doc(collection(db, `users/${firebaseUser.uid}/attempts`), attemptId);
      await setDoc(attemptRef, {
        ...attempt,
        createdAt: serverTimestamp(), // Firestore server timestamp
      });
    } catch (error) {
      console.error("Failed to save attempt:", error);
    }
  };

  const handleMcqSubmit = async () => {
    if (!selectedChoice || isSubmitted) return;
    
    const mcqQuestion = currentQuestion as McqQuestion;
    const isCorrect = selectedChoice === mcqQuestion.answer;
    
    await saveAttempt(selectedChoice, isCorrect);
    setIsSubmitted(true);
    setShowExplanation(true);
  };

  const handleEssaySubmit = async () => {
    if (!essayText.trim() || isSubmitted) return;
    
    await saveAttempt(essayText.trim());
    setIsSubmitted(true);
  };

  const handleNext = () => {
    if (index < questions.length - 1) {
      setIndex(index + 1);
    }
  };

  const handlePrevious = () => {
    if (index > 0) {
      setIndex(index - 1);
    }
  };

  if (!currentQuestion) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No questions available for this standard.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress indicator 
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>Question {index + 1} of {questions.length}</span>
        <span className="px-2 py-1 bg-gray-100 rounded text-xs">
          {currentQuestion.difficulty} • {currentQuestion.type.toUpperCase()}
        </span>
      </div>

      {/* Progress bar 
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((index + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question content 
      <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
        {/* Passage (for MCQ with passages) 
        {currentQuestion.type === "mcq" && (currentQuestion as McqQuestion).passage && (
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm font-medium text-gray-700 mb-2">Reading Passage:</p>
            <p className="text-gray-800 leading-relaxed">
              {(currentQuestion as McqQuestion).passage}
            </p>
          </div>
        )}

        {/* Question text 
        <div>
          <p className="text-lg font-medium text-gray-900 leading-relaxed">
            {currentQuestion.type === "mcq" 
              ? (currentQuestion as McqQuestion).question
              : (currentQuestion as EssayQuestion).prompt
            }
          </p>
        </div>

        {/* MCQ Choices 
        {currentQuestion.type === "mcq" && (
          <div className="space-y-3">
            {(currentQuestion as McqQuestion).choices.map((choice) => {
              const choiceKey = choice.split(')')[0];
              const isSelected = selectedChoice === choiceKey;
              const isCorrect = choiceKey === (currentQuestion as McqQuestion).answer;
              
              let buttonClass = "w-full text-left p-3 rounded-md border transition-colors ";
              
              if (isSubmitted) {
                if (isCorrect) {
                  buttonClass += "bg-green-50 border-green-300 text-green-800";
                } else if (isSelected && !isCorrect) {
                  buttonClass += "bg-red-50 border-red-300 text-red-800";
                } else {
                  buttonClass += "bg-gray-50 border-gray-200 text-gray-600";
                }
              } else if (isSelected) {
                buttonClass += "bg-blue-50 border-blue-300 text-blue-800";
              } else {
                buttonClass += "bg-white border-gray-200 hover:bg-gray-50";
              }

              return (
                <button
                  key={choiceKey}
                  onClick={() => !isSubmitted && setSelectedChoice(choiceKey)}
                  disabled={isSubmitted}
                  className={buttonClass}
                >
                  {choice}
                </button>
              );
            })}
          </div>
        )}

        {/* Essay Input 
        {currentQuestion.type === "essay" && (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                Word limit: {(currentQuestion as EssayQuestion).wordLimit}
              </span>
              <span className={`font-medium ${
                wordCount > (currentQuestion as EssayQuestion).wordLimit 
                  ? 'text-red-600' 
                  : 'text-gray-700'
              }`}>
                {wordCount} words
              </span>
            </div>
            <textarea
              ref={textareaRef}
              value={essayText}
              onChange={(e) => setEssayText(e.target.value)}
              disabled={isSubmitted}
              placeholder="Type your essay here..."
              className="w-full min-h-[300px] p-4 border rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
              style={{ overflow: 'hidden' }}
            />
          </div>
        )}

        {/* Submit button 
        {!isSubmitted && (
          <div className="flex justify-center">
            <button
              onClick={currentQuestion.type === "mcq" ? handleMcqSubmit : handleEssaySubmit}
              disabled={
                (currentQuestion.type === "mcq" && !selectedChoice) ||
                (currentQuestion.type === "essay" && !essayText.trim())
              }
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Answer
            </button>
          </div>
        )}

        {/* Explanation (MCQ only) 
        {currentQuestion.type === "mcq" && showExplanation && (
          <div className="mt-4 p-4 bg-blue-50 rounded-md border-l-4 border-blue-400">
            <p className="text-sm font-medium text-blue-800 mb-1">Explanation:</p>
            <p className="text-blue-700">
              {(currentQuestion as McqQuestion).explanation}
            </p>
          </div>
        )}

        {/* Essay feedback placeholder 
        {currentQuestion.type === "essay" && isSubmitted && (
          <div className="mt-4 p-4 bg-green-50 rounded-md border-l-4 border-green-400">
            <p className="text-sm font-medium text-green-800 mb-1">Submitted!</p>
            <p className="text-green-700">
              Your essay has been recorded. AI feedback will be available in a future update.
            </p>
          </div>
        )}
      </div>

      {/* Navigation 
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrevious}
          disabled={index === 0}
          className="px-4 py-2 text-gray-600 border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        <span className="text-sm text-gray-500">
          {index + 1} / {questions.length}
        </span>

        <button
          onClick={handleNext}
          disabled={isLastQuestion}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLastQuestion ? "Complete" : "Next"}
        </button>
      </div>

      {/* Completion message 
      {isLastQuestion && isSubmitted && (
        <div className="text-center py-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Great job! You've completed all questions.
            </h3>
            <p className="text-green-700">
              Your progress has been saved. Keep practicing to improve your skills!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}; */