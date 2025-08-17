"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, HelpCircle, Menu, X } from 'lucide-react';
import { TestTimerRef } from './TestTimer';

interface TestHeaderProps {
  title: string;
  currentIndex: number;
  totalItems: number;
  timerRef?: React.RefObject<TestTimerRef>;
  onBackClick?: () => void;
  backLabel?: string;
  completedItems?: number;
  showTimer?: boolean;
  sectionInfo?: string; // Add section info prop
  showNavigator?: boolean;
  onToggleNavigator?: () => void;
}

export const TestHeader: React.FC<TestHeaderProps> = ({
  title,
  currentIndex,
  totalItems,
  timerRef,
  onBackClick,
  backLabel = 'Back',
  completedItems,
  showTimer = true,
  sectionInfo,
  showNavigator,
  onToggleNavigator
}) => {
  const [timeDisplay, setTimeDisplay] = useState<string>('0:00');
  
  // Calculate completed questions
  const answeredCount = completedItems !== undefined ? completedItems : 0;
  const remainingQuestions = totalItems - answeredCount;

  // Update the time display every second
  useEffect(() => {
    if (!timerRef?.current) return;

    const updateTimer = () => {
      const elapsedMs = timerRef.current?.getElapsedTime() || 0;
      const totalSeconds = Math.floor(elapsedMs / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      setTimeDisplay(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    // Update immediately
    updateTimer();
    
    // Then update every second
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [timerRef]);

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    }
  };

  return (
    <div className="bg-gray-800 text-white">
      <div className="w-full px-[1vw] py-4">
        <div className="flex items-center justify-between relative">
          {/* Left side - Back button and title */}
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBackClick}
              className="flex items-center gap-1 bg-blue-600 px-4 py-2 rounded-full hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {backLabel}
            </button>
            <div className="hidden sm:block">
                <div className="flex flex-col">
                <p className="text-orange-400 text-sm uppercase tracking-wide font-medium">
                    {sectionInfo || 'State Test Prep'}
                </p>
                <h1 className="text-xl font-bold text-white">
                    {title}
                </h1>
                </div>
            </div>
          </div>
          
          {/* Center - Timer (absolutely positioned) */}
          {showTimer && timerRef && (
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <div className="flex items-center gap-2 bg-orange-500 px-4 py-2 rounded-full shadow-lg">
                <Clock className="w-4 h-4 text-white" />
                <span className="font-medium text-white">
                  {timeDisplay}
                </span>
              </div>
            </div>
          )}
          
          {/* Right side - Questions completed */}
          <div className="flex items-center gap-3">
            {/* Mobile navigator toggle */}
            {onToggleNavigator && (
              <button
                onClick={onToggleNavigator}
                className="lg:hidden p-2 rounded-md hover:bg-white/10 transition-colors"
              >
                {showNavigator ? <X className="w-4 h-4 text-white" /> : <Menu className="w-4 h-4 text-white" />}
              </button>
            )}
            
            <div className="flex items-center gap-2 bg-orange-500 px-4 py-2 rounded-full shadow-lg hover:bg-orange-600 transition-colors">
              {/*<HelpCircle className="w-4 h-4 text-white" />*/}
              <span className="text-white font-medium text-sm">
                <span className="sm:hidden">{answeredCount}/{totalItems} Done</span>
                <span className="hidden sm:inline text-white font-medium text-sm">
                  {answeredCount} of {totalItems} Questions Completed
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
