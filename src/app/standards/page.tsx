"use client";

import React from "react";
import Link from "next/link";
import { useAssessment } from "@/contexts/AssessmentContext";

export default function StandardsPage() {
  const { selection, setSelection } = useAssessment();

  const demoStandards = [
    { id: "E2.RC.DEMO", title: "Reading Comprehension Demo" },
    { id: "E2.GRAM.DEMO", title: "Grammar Demo" },
    { id: "E2.ESSAY.DEMO", title: "Essay Writing Demo" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Standards</h1>
        <p className="text-sm text-gray-600">
          {selection.state} / {selection.testId} / {selection.subject}
        </p>

        <ul className="divide-y border rounded-md">
          {demoStandards.map((s) => (
            <li key={s.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{s.title}</div>
                <div className="text-xs text-gray-500">{s.id}</div>
              </div>
              <Link
                href={`/practice/${encodeURIComponent(s.id)}`}
                onClick={() => setSelection({ standardId: s.id })}
                className="px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm"
              >
                Practice
              </Link>
            </li>
          ))}
        </ul>

        {/* TODO(step 6 & 15): Load standards dynamically from Firestore after content ingestion. */}
      </div>
    </div>
  );
} 