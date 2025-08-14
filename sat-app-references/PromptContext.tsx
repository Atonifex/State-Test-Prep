/*
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import ReactMarkdown from 'react-markdown'; // Import ReactMarkdown
import remarkGfm from 'remark-gfm'; // Extends Markdown to render tables. Might remove this later, but check if this ruins the other remarks.
import remarkMath from 'remark-math'; // For parsing LaTeX math expressions
import rehypeKatex from 'rehype-katex'; // For rendering math with KaTeX
import 'katex/dist/katex.min.css'; // Import Katex CSS for styling
import rehypeRaw from 'rehype-raw'; // Import rehypeRaw to enable raw HTML for the tables
import { Pluggable } from 'unified'; // Import Pluggable type to assert that rehypeRaw is valid config for Markdown to render HTML
import { Typography } from '@mui/material';
import { UserAnswerRecord } from '@/types';
//This Component stores generatedSATQuestion, which comes from SkillButtonsAndQuestionGenerator.tsx
//The purpose is to pass that question to the ChatComponent or other Components on the same page.

type InteractionStage = 'notStarted' | 'questionGenerated' | 'answered';

type PromptContextType = {
  questionText: string;
  choices: string[];
  correctAnswer: string;
  explanationText: string;
  selectedSubject: string;
  selectedSkill: string;
  selectedDifficulty: 'Easy' | 'Medium' | 'Hard';

  pictureURL: string | null; //added on 5/28/2025
  setPictureURL: (url: string | null) => void;

  interactionStage: 'notStarted' | 'questionGenerated' | 'answered'; // Used to render quickPrompts based on how far into a question the user is
  setInteractionStage: (stage: InteractionStage) => void;
  isSeriesActive: boolean; //Used to determine if a series of questions is active in SkillPractice/SkillButtonsAndQuestionGenerator.tsx
  setIsSeriesActive: (isActive: boolean) => void;
  setQuestionText: (text: string) => void;
  setChoices: (choices: string[]) => void;
  setCorrectAnswer: (answer: string) => void;
  setExplanationText: (text: string) => void;
  setSelectedSubject: (subject: string) => void;
  setSelectedSkill: (skill: string) => void;
  setSelectedDifficulty: (difficulty: 'Easy' | 'Medium' | 'Hard') => void;
  clearChat: () => void; // Method to clear chat history
  renderLatexOrText: (content: string, textSize?: 'normal' | 'small', removeBottomMargin?: boolean) => JSX.Element;
  chatCleared: boolean; // A boolean flag to trigger chat clearing
  questionData: any[] | null; //Array to store SAT questions loaded from 'all-sat-tests-final.json'
  //Added on 3/25/2025 for the Diagnostic Test and Full-Length Tests:
  testState: TestState;
  setTestState: (state: TestState | ((prev: TestState) => TestState)) => void; //Can be used to update the test state in a functional way as well as directly.
  startTest: (type: TestType, totalQuestions: number) => void; //Is there a world where number is 0 or null/undefined when TestType = none?
  endTest: () => void;
  markQuestion: (index: number) => void;
};

export const PromptContext = createContext<PromptContextType | undefined>(undefined);


//New on 3/25/2025, for the Diagnostic Test and Full-Length Tests:
type TestType = 'none' | 'diagnostic' | 'fullTest';
export type TestState = {
  type: TestType;
  isActive: boolean;
  currentQuestionIndex: number;
  totalQuestions: number;
  markedQuestions: number[];
  //Do I want to add skillType and difficulty here too? Maybe later on, but I might just record those live rather than at the end, so no need to store them. 
  answers: UserAnswerRecord[];
  startTime: number;
  elapsedTime: number;
  currentSection?: number; // For full test
  testNumber?: number; // For full test
};


/**
 * Provides a generic study strategy suggestion based on the skill name.
 * TODO: Consider moving this to a more central place like PromptContext or a dedicated strategy module.
 * // Helper function to provide strategies based on skill ***NEED TO ADD MORE - 
  // ASSUME THIS ISN'T DONE UNTIL THIS MESSAGE IS DELETED! - If I do create strategies, it should be done in the PromptContext.tsx file.

export function getStrategyForSkill(skill: string): string {
  const strategies: Record<string, string> = {
    'Algebra': "When solving algebraic equations, isolate the variable by performing the same operations on both sides. Double-check your distribution and combining of like terms.",
    'Advanced Math': "Focus on understanding function notation (f(x)), quadratic equations, and exponential growth. Practice manipulating complex expressions.",
    'Problem-Solving and Data Analysis': "Read charts and graphs carefully. For mean, median, and mode questions, organize your data first. Understand ratios, proportions, and percentages.",
    'Geometry and Trigonometry': "Memorize key formulas for areas, volumes, angles, and trigonometric ratios (SOH CAH TOA). Draw diagrams for spatial problems.",
    'Information and Ideas': "Identify explicit and implicit meanings. Look for evidence in the passage that directly supports your conclusion or inference. Summarize central ideas and themes.",
    'Craft and Structure': "Analyze word choice for tone and impact. Evaluate text structure (compare/contrast, cause/effect) and purpose. Understand point of view.",
    'Expression of Ideas': "Check for logical transitions between ideas. Ensure sentences effectively achieve the intended rhetorical purpose (e.g., setting up a comparison, providing an example).",
    'Standard English Conventions': "Review rules for sentence boundaries (run-ons, fragments), punctuation (commas, semicolons, colons, apostrophes), and pronoun usage (agreement, case).",
    // Add more strategies as needed
  };

  return strategies[skill] || "Focus on understanding the core concepts and practicing similar problems.";
}


export const PromptProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [questionText, setQuestionText] = useState<string>('');
  const [choices, setChoices] = useState<string[]>([]); //default is empty array - in case of no choices on Math questions
  const [correctAnswer, setCorrectAnswer] = useState<string>(''); //how might this handle multiple answers (i.e. "4.5" or "9/2")
  const [explanationText, setExplanationText] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedSkill, setSelectedSkill] = useState<string>('Function of Sentence');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [chatCleared, setChatCleared] = useState<boolean>(false);
  const [questionData, setQuestionData] = useState<any[] | null>(null); 
  const [interactionStage, setInteractionStage] = useState<InteractionStage>('notStarted');
  const [isSeriesActive, setIsSeriesActive] = useState<boolean>(false);
  const [pictureURL, setPictureURL] = useState<string | null>(null); //added on 5/28/2025

  //NEW on 3/25/2025 for the Diagnostic Test and Full-Length Tests:
  const [testState, setTestStateInternal] = useState<TestState>({
    type: 'none',
    isActive: false,
    currentQuestionIndex: 0,
    totalQuestions: 0,
    markedQuestions: [],
    answers: [],
    startTime: 0,
    elapsedTime: 0
  });


  // Create a wrapper function that handles both direct values and updater functions
  const setTestState = useCallback((stateOrUpdater: TestState | ((prev: TestState) => TestState)) => {
    if (typeof stateOrUpdater === 'function') {
      // It's an updater function
      setTestStateInternal(prev => (stateOrUpdater as ((prev: TestState) => TestState))(prev));
    } else {
      // It's a direct value
      setTestStateInternal(stateOrUpdater);
    }
  }, []);

  const startTest = useCallback((type: TestType, totalQuestions: number) => {
    setTestState({type, isActive: true,
      currentQuestionIndex: 0, totalQuestions, markedQuestions: [], answers: [], 
      startTime: Date.now(),elapsedTime: 0
    });
    //console.log(`Starting test with interactionStage: ${interactionStage}`);
    setInteractionStage('questionGenerated');
    //console.log(`Starting test with interactionStage: ${interactionStage}`);
  }, []);
  
  const endTest = useCallback(() => {
    setTestState(prev => ({
      ...prev,
      isActive: false,
      elapsedTime: prev.elapsedTime + (Date.now() - prev.startTime)
    }));
    setInteractionStage('notStarted');
    console.log(`Ending test with interactionStage: ${interactionStage}`);
  }, []);
  
  const markQuestion = useCallback((index: number) => {
    setTestState(prev => {
      const markedQuestions = [...prev.markedQuestions]; //Create a copy of the markedQuestions array
      const markedIndex = markedQuestions.indexOf(index); //Check if the question is already marked
      
      if (markedIndex >= 0) {
        markedQuestions.splice(markedIndex, 1); //If the question is already marked, remove it from the array
      } else {
        markedQuestions.push(index); //If the question is not marked, add it to the array
      }
      
      return {
        ...prev,
        markedQuestions
      };
    });
  }, []);


  //NEW on 11/11/2024: useEffect to load question data when the component mounts
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        //console.log("Loading questions from all-sat-tests-final.json");
        const response = await fetch('/satquestions/all-sat-tests-final.json'); 
        if (!response.ok) {
          throw new Error(`Failed to load question data. Status: ${response.status}`);
        }
        const data = await response.json();
        setQuestionData(data.questions); //NEW: Set the loaded questions into state
      } catch (error) {
        console.error('Error loading question data:', error);
      }
    };
    loadQuestions(); //This is where the function is actually called
  }, []);

  const clearChat = () => {
    //console.log("setting ChatCleared to true in clearChat() in PromptContext");
    setChatCleared(true);
    setTimeout(() => setChatCleared(false), 250); // Reset the flag .25 seconds (250 milliseconds) after triggering
  };

  //Used to display LaTeX or regular content in the question, answer choices, and explanation.
  const renderLatexOrText = (content: string, textSize: 'normal' | 'small' = 'normal', removeBottomMargin: boolean = false) => {
    
    // Replace "\n" with proper line breaks, then switches "_text_" but not "_____" to a span class="underline" to underline w/o HTML 
    const formattedContent = content
    .replace(/(?<!_)_(?!_)(.*?)(?<!_)_(?!_)/g, (match, p1) => {
      //console.log('Found match:', match);
      //console.log('Replacing with:', `||${p1}||`);
      return `||${p1}||`;
    });
    const rehypePluginsList: Pluggable[] = [rehypeKatex]; // Default plugins to render Math expressions in KaTeX / LaTeX
    // Check if the content contains any HTML table elements. The "/" makes it Regex expression, so no quotation marks necessary.
    
    // Conditionally add rehypeRaw if the content contains table elements
    const containsTable = /<table>|<tr>|<td>|<th>/.test(formattedContent);
    if (containsTable) {
      rehypePluginsList.push(rehypeRaw);
    }

  return (
    <div className={`rendered-question ${textSize === 'small' ? 'small-text' : ''}`}> {/* Center block elements style={{ textAlign: 'center' }}
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]} // Enable GFM and LaTeX parsing
          rehypePlugins={rehypePluginsList} // Enable raw HTML rendering conditionally // Use KaTeX for rendering LaTeX math
          components={{
            p: ({ children, ...props }) => {
              //console.log('Paragraph received:', children);
              // Process children to handle underlining
              const processedChildren = React.Children.map(children, child => {
                if (typeof child === 'string') {
                  //console.log('Processing string in paragraph:', child);
                  const parts = child.split('||');
                  return parts.map((part, i) => {
                    //console.log(`Processing part ${i}:`, part);
                    return i % 2 === 0 ? 
                      part : 
                      <span key={i} className="underline">{part}</span>
                  });
                }
                return child;
              });
              return <p style={{
                fontSize: '1.1rem', 
                marginBottom: removeBottomMargin ? '0' : '1em', 
                marginTop: 0,
                lineHeight: '1.6' // Increased from default for better line spacing
              }}
                {...props}>{processedChildren}</p>;
            },
            li: ({ node, children, ...props }) => (
              <li style={{ 
                fontSize: textSize === 'small' ? '0.875rem' : '1rem', 
                lineHeight: textSize === 'small' ? '1.6' : '1.7' // Increased line height
              }}
               {...props}>{children}</li>
            ),
            table: ({ node, ...props }) => <table className="sat-question-table" {...props} />,
            tr: ({ node, ...props }) => <tr {...props} />,
            td: ({ node, ...props }) => <td {...props} />,
            th: ({ node, ...props }) => <th {...props} />
          }}
        >
          {formattedContent}
        </ReactMarkdown>
    </div>
  );
};
 
  return (
    <PromptContext.Provider value={{ questionText, choices, correctAnswer, explanationText,  selectedSkill, questionData, selectedSubject, 
      selectedDifficulty, setQuestionText, setChoices, setCorrectAnswer, setExplanationText, 
      setSelectedSkill, clearChat, chatCleared, pictureURL, setPictureURL,
      renderLatexOrText, setSelectedSubject, setSelectedDifficulty, interactionStage, setInteractionStage,
      isSeriesActive, setIsSeriesActive,
      testState, setTestState, startTest, endTest, markQuestion
    }}
      >
      {children}
    </PromptContext.Provider>
  );
};


/* PREVIOUS:
type PromptContextType = {
  generatedSATQuestion: string;
  //setGeneratedSATQuestion: React.Dispatch<React.SetStateAction<string>>;// Previously was (generatedSATQuestion: string) => void;
  setGeneratedSATQuestion: (question: string) => void;

  /* CLEAR CHAT: not functional but add back in later 
  clearChat: () => void; // Method to clear chat history
  chatCleared: boolean; // A boolean flag to trigger chat clearing
};
*/

/* Define the LineBreak component  - worked on this at 5:48 pm on 11/6!
  const LineBreak = () => <br />;

  // Split the content by \n and map it to include LineBreak components
  const contentWithLineBreaks = formattedContent.split('\n').map((part, index) => (
    <React.Fragment key={index}>
      {index > 0 && <LineBreak />}
      {part}
    </React.Fragment>
  ));   */

  //returns all these values to any Component that needs these:
//Removed this at 1:09 am on 9/18: selectedSubject, selectedDifficulty, setSelectedSubject, setSelectedDifficulty,
