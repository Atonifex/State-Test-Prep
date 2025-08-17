"use client";

import React from "react";
import { useAssessment } from "@/contexts/AssessmentContext";
import { useRouter } from "next/navigation";

export default function SelectPage() {
  const { selection, setSelection } = useAssessment();
  const router = useRouter();

  const goNext = () => {
    router.push("/standards");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Choose your assessment</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">State</label>
            <select
              value={selection.state}
              onChange={(e) => setSelection({ state: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="SC">South Carolina</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Test</label>
            <select
              value={selection.testId}
              onChange={(e) => setSelection({ testId: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="english-ii">English II EOC</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <select
              value={selection.subject}
              onChange={(e) => setSelection({ subject: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="English II">English II</option>
            </select>
          </div>
        </div>

        <button onClick={goNext} className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
          Continue
        </button>
      </div>
    </div>
  );
} 