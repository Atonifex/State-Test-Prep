"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

export interface AssessmentSelection {
  state: string; // e.g., 'SC'
  testId: string; // e.g., 'english-ii'
  subject: string; // e.g., 'English II'
  standardId: string | null; // selected standard for practice
}

interface AssessmentCtxValue {
  selection: AssessmentSelection;
  setSelection: (sel: Partial<AssessmentSelection>) => void;
}

const Ctx = createContext<AssessmentCtxValue | undefined>(undefined);

export const AssessmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selection, setSelectionState] = useState<AssessmentSelection>({
    state: "SC",
    testId: "english-ii",
    subject: "English II",
    standardId: null,
  });

  const setSelection = (sel: Partial<AssessmentSelection>) => {
    setSelectionState((prev) => ({ ...prev, ...sel }));
    // TODO: Persist to localStorage for convenience/offline (step 4 note). Keep ephemeral for MVP.
  };

  const value = useMemo<AssessmentCtxValue>(() => ({ selection, setSelection }), [selection]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useAssessment = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAssessment must be used within AssessmentProvider");
  return ctx;
}; 