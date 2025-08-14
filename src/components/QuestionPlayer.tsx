"use client";

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

  useEffect(() => {
    setStartedAtMs(Date.now());
    setShowExplanation(false);
    setSelectedChoice(null);
    setEssayText("");
  }, [index]);

  const question = questions[index];
  const isMcq = useMemo(() => question?.type === "mcq", [question]);

  const wordCount = useMemo(() => essayText.trim().split(/\s+/).filter(Boolean).length, [essayText]);

  const onSubmit = async () => {
    if (!firebaseUser || !question) return;
    const submittedAtMs = Date.now();
    const timeSpentSec = Math.max(1, Math.round((submittedAtMs - startedAtMs) / 1000));

    const attemptId = doc(collection(db, `users/${firebaseUser.uid}/attempts`)).id;

    const base: Omit<Attempt, "id"> = {
      userId: firebaseUser.uid,
      state,
      testId,
      subject,
      standardId,
      questionId: question.id,
      questionType: question.type,
      startedAt: startedAtMs,
      submittedAt: submittedAtMs,
      timeSpentSec,
      correct: question.type === "mcq" ? (selectedChoice != null ? selectedChoice === (question as McqQuestion).answer : null) : null,
      selectedChoice: question.type === "mcq" ? (selectedChoice ?? null) : null,
      freeResponse: question.type === "essay" ? (essayText || null) : null,
      explanationViewed: showExplanation,
      tutorUsed: false,
      classroomId: null,
      assignmentId: null,
    };

    // null-safe conversion
    const sanitized = Object.fromEntries(Object.entries(base).map(([k, v]) => [k, v === undefined ? null : v]));

    await setDoc(doc(db, `users/${firebaseUser.uid}/attempts/${attemptId}`), {
      id: attemptId,
      ...sanitized,
      createdAt: serverTimestamp(),
    });

    // Advance to next
    if (index < questions.length - 1) {
      setIndex((i) => i + 1);
    } else {
      alert("Great work! You’ve completed this set.");
    }
  };

  if (!question) return <div className="text-gray-600">No questions available.</div>;

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-500">Question {index + 1} of {questions.length}</div>

      {isMcq ? (
        <McqView
          question={question as McqQuestion}
          selectedChoice={selectedChoice}
          onSelect={setSelectedChoice}
          showExplanation={showExplanation}
          setShowExplanation={setShowExplanation}
        />
      ) : (
        <EssayView
          question={question as EssayQuestion}
          essayText={essayText}
          setEssayText={setEssayText}
          wordCount={wordCount}
        />
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={onSubmit}
          className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          disabled={isMcq && !selectedChoice}
        >
          Submit
        </button>
        {isMcq && (
          <button
            onClick={() => setShowExplanation((s) => !s)}
            className="px-3 py-2 rounded-md border"
          >
            {showExplanation ? "Hide explanation" : "Show explanation"}
          </button>
        )}
        <button
          onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
          className="px-3 py-2 rounded-md border"
        >
          Skip
        </button>
      </div>
    </div>
  );
};

const McqView: React.FC<{
  question: McqQuestion;
  selectedChoice: string | null;
  onSelect: (v: string) => void;
  showExplanation: boolean;
  setShowExplanation: (v: boolean | ((p: boolean) => boolean)) => void;
}> = ({ question, selectedChoice, onSelect, showExplanation }) => {
  return (
    <div className="space-y-3">
      {question.passage && (
        <div className="rounded-md border p-3 bg-white text-sm whitespace-pre-wrap">{question.passage}</div>
      )}
      <div className="text-lg font-medium whitespace-pre-wrap">{question.question}</div>
      <div className="space-y-2">
        {question.choices.map((c, idx) => {
          const label = c.trim().substring(0, 2).match(/^[A-D]\)/) ? c.trim()[0] : String.fromCharCode(65 + idx);
          return (
            <label key={idx} className="flex items-center gap-2 p-2 rounded-md border cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="choice"
                value={label}
                checked={selectedChoice === label}
                onChange={() => onSelect(label)}
              />
              <span className="whitespace-pre-wrap">{c}</span>
            </label>
          );
        })}
      </div>
      {showExplanation && question.explanation && (
        <div className="rounded-md border p-3 bg-emerald-50 text-sm whitespace-pre-wrap">{question.explanation}</div>
      )}
    </div>
  );
};

const EssayView: React.FC<{
  question: EssayQuestion;
  essayText: string;
  setEssayText: (v: string) => void;
  wordCount: number;
}> = ({ question, essayText, setEssayText, wordCount }) => {
  const limit = question.wordLimit || 500;
  return (
    <div className="space-y-3">
      <div className="text-lg font-medium whitespace-pre-wrap">{question.prompt}</div>
      <textarea
        value={essayText}
        onChange={(e) => setEssayText(e.target.value)}
        className="w-full min-h-40 rounded-md border p-2"
        placeholder={`Write up to ${limit} words...`}
      />
      <div className={`text-sm ${wordCount > limit ? 'text-red-600' : 'text-gray-600'}`}>
        {wordCount} / {limit} words
      </div>
    </div>
  );
}; 