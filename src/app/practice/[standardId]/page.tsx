"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { useAssessment } from "@/contexts/AssessmentContext";

export default function PracticePage() {
  const params = useParams<{ standardId: string }>();
  const { selection, setSelection } = useAssessment();

  useEffect(() => {
    if (params?.standardId) setSelection({ standardId: decodeURIComponent(params.standardId) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.standardId]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Practice: {selection.standardId}</h1>
      <p className="text-sm text-gray-600">
        {selection.state} / {selection.testId} / {selection.subject}
      </p>

      <div className="rounded-md border p-4 bg-white">
        <p className="text-gray-700">Question player coming next (MCQ + Essay). Attempts will be saved per user.</p>
      </div>

      {/* TODO(step 7): Implement MCQ/Essay player, timing, and Firestore attempt writes. */}
      {/* TODO(step 8): Add AI Tutor button and chat panel. */}
      {/* TODO(step 9): Add TTS and non-streaming STT controls. */}
    </div>
  );
} 