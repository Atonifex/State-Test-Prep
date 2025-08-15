import { Question } from "@/types/models";

export const demoQuestionsByStandard: Record<string, Question[]> = {
  "E2.RC.DEMO": [
    {
      id: "rc1",
      type: "mcq",
      state: "SC",
      testId: "english-ii",
      subject: "English II",
      standardId: "E2.RC.DEMO",
      difficulty: "Easy",
      passage: "In the following text, a community garden project brings neighbors together...",
      question: "Which choice best describes the author's central claim?",
      choices: ["A) The garden improved property values", "B) The garden unified the community", "C) The garden reduced city spending", "D) The garden ended neighborhood disputes"],
      answer: "B",
      explanation: "The author emphasizes togetherness and collaboration, supporting choice B.",
    },
  ],
  "E2.GRAM.DEMO": [
    {
      id: "gram1",
      type: "mcq",
      state: "SC",
      testId: "english-ii",
      subject: "English II",
      standardId: "E2.GRAM.DEMO",
      difficulty: "Medium",
      question: "The committee decided to ________ the proposal until next month.",
      choices: ["A) defer", "B) defur", "C) differ", "D) difer"],
      answer: "A",
      explanation: "Defer means to postpone or delay. The other options are misspellings or different words.",
    },
  ],
  "E2.ESSAY.DEMO": [
    {
      id: "essay1",
      type: "essay",
      state: "SC",
      testId: "english-ii",
      subject: "English II",
      standardId: "E2.ESSAY.DEMO",
      difficulty: "Medium",
      prompt: "Write a persuasive essay about the importance of community service for high school students. Use specific examples and reasoning to support your argument.",
      wordLimit: 500,
    },
  ],
}; 