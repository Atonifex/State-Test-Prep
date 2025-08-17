"use client";

import React, { useState } from 'react';
import { CheckCircle, Bookmark, Lightbulb, Timer, GraduationCap, HelpCircle, BookmarkCheck } from 'lucide-react';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`test-tabpanel-${index}`}
      aria-labelledby={`test-tab-${index}`}
    >
      {value === index && (
        <div className="px-3 py-3">
          {children}
        </div>
      )}
    </div>
  );
}

interface QuestionNavigatorProps {
  totalItems: number;
  currentIndex: number;
  currentAnswers: Array<{
    questionIndex: number;
    answer: string;
    isCorrect?: boolean;
  }>;
  markedQuestions: number[];
  onNavigate: (index: number) => void;
  showResults?: boolean;
}

export const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({
  totalItems,
  currentIndex,
  currentAnswers,
  markedQuestions,
  onNavigate,
  showResults = false
}) => {
  const [tabValue, setTabValue] = useState(0);

  // Create a map of answered questions for quick lookup
  const answeredMap = currentAnswers.reduce((map, item) => {
    map[item.questionIndex] = item;
    return map;
  }, {} as Record<number, typeof currentAnswers[0]>);

  // Button styling helper functions
  const getButtonStyles = (index: number) => {
    const isAnswered = !!answeredMap[index];
    const isMarked = markedQuestions.includes(index);
    const isCurrent = index === currentIndex;
    
    if (isCurrent) {
      return "bg-orange-500 text-white border-2 border-orange-600 transform scale-110 z-10 shadow-lg font-bold hover:bg-orange-600 hover:scale-115 hover:shadow-xl";
    }
    
    if (showResults && isAnswered) {
      const isCorrect = answeredMap[index].isCorrect;
      return isCorrect 
        ? "bg-green-500 text-white border-2 border-green-600 hover:bg-green-600"
        : "bg-red-500 text-white border-2 border-red-600 hover:bg-red-600";
    }
    
    if (isMarked) {
      return isAnswered 
        ? "bg-orange-100 text-orange-800 border-2 border-orange-300 hover:bg-orange-200"
        : "bg-orange-50 text-orange-700 border-2 border-orange-200 hover:bg-orange-100";
    }
    
    if (isAnswered) {
      return "bg-orange-500 text-white border-2 border-orange-600 hover:bg-orange-600";
    }
    
    return "bg-white text-gray-800 border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300";
  };

  const tabs = [
    {
      label: "Overview - All Questions",
      icon: CheckCircle,
      badge: null
    },
    {
      label: "Marked Questions",
      icon: Bookmark,
      badge: markedQuestions.length
    },
    {
      label: "Tips & Strategies",
      icon: Lightbulb,
      badge: null
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex w-full">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = tabValue === index;
            const isDisabled = index === 1 && markedQuestions.length === 0;
            
            return (
              <button
                key={index}
                onClick={() => !isDisabled && setTabValue(index)}
                disabled={isDisabled}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
                  isActive
                    ? 'text-orange-600 border-b-2 border-orange-500'
                    : isDisabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== null && tab.badge > 0 && (
                  <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[18px] h-4 flex items-center justify-center ml-1">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[80px]">
        {/* Overview - All Questions */}
        <TabPanel value={tabValue} index={0}>
          <div className="flex flex-wrap gap-2 p-1">
            {Array.from({ length: totalItems }, (_, index) => {
              const isAnswered = !!answeredMap[index];
              const isMarked = markedQuestions.includes(index);
              
              return (
                <div key={index} className="relative">
                  <button
                    onClick={() => onNavigate(index)}
                    className={`w-10 h-10 rounded text-sm font-bold transition-all duration-200 relative ${getButtonStyles(index)}`}
                  >
                    {index + 1}
                    {isMarked && (
                      <Bookmark className="absolute -top-1 -right-1 w-3 h-3 text-blue-500 fill-current" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </TabPanel>

        {/* Marked Questions */}
        <TabPanel value={tabValue} index={1}>
          {markedQuestions.length > 0 ? (
            <div className="flex flex-wrap gap-2 p-1">
              {markedQuestions.map(index => (
                <div key={index} className="relative">
                  <button
                    onClick={() => onNavigate(index)}
                    className={`w-10 h-10 rounded text-sm font-bold transition-all duration-200 relative ${getButtonStyles(index)}`}
                  >
                    {index + 1}
                    <Bookmark className="absolute -top-1 -right-1 w-3 h-3 text-blue-500 fill-current" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center">
              <BookmarkCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-700 text-base">No questions marked for review yet</p>
            </div>
          )}
        </TabPanel>

        {/* Tips & Strategies */}
        <TabPanel value={tabValue} index={2}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
              <Timer className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Time Management</h4>
                <p className="text-blue-800">Spend 1-2 minutes per question. Mark and move on if stuck.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded border-l-4 border-green-400">
              <Lightbulb className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-green-900 mb-1">Process of Elimination</h4>
                <p className="text-green-800">Cross out wrong answers to improve your odds.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded border-l-4 border-purple-400">
              <GraduationCap className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-purple-900 mb-1">Read Carefully</h4>
                <p className="text-purple-800">Understand what the question asks before selecting.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-orange-50 rounded border-l-4 border-orange-400">
              <HelpCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-orange-900 mb-1">Use Test Layout</h4>
                <p className="text-orange-800">Mark difficult questions and return to them later.</p>
              </div>
            </div>
          </div>
        </TabPanel>
      </div>
    </div>
  );
};
