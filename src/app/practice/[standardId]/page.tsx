"use client";

import React, { useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useAssessment } from "@/contexts/AssessmentContext";
import { QuestionPlayer } from "@/components/QuestionPlayer";
import { TestSection } from "@/types/models";

// Import the real test data
import englishTest1 from "@/data/english-test-1.json";

export default function PracticePage() {
  const params = useParams<{ standardId: string }>();
  const { selection, setSelection } = useAssessment();

  useEffect(() => {
    if (params?.standardId) setSelection({ standardId: decodeURIComponent(params.standardId) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.standardId]);

  // Convert the JSON data to our TestSection format
  const sections = useMemo(() => {
    // The JSON structure has sections in an array, each with a "section" property
    return englishTest1.map((item: any) => item.section as TestSection);
  }, []);

  if (!selection.standardId) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading practice questions...</p>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No questions available for this standard.</p>
      </div>
    );
  }

  return (
    <QuestionPlayer
      state={selection.state}
      testId={selection.testId}
      subject={selection.subject}
      standardId={selection.standardId}
      sections={sections}
    />
  );
} 