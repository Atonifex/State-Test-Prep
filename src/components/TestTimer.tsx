"use client";

import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Pause, Play } from 'lucide-react';

type TestTimerProps = {
  mode: 'elapsed' | 'countdown';
  initialTimeMs?: number; // For countdown mode
  onTimeUp?: () => void; // Callback when countdown reaches zero
  showControls?: boolean;
  isActive?: boolean; // External control of timer state
  onToggle?: () => void; // Callback when play/pause is clicked
};

export type TestTimerRef = {
  getElapsedTime: () => number;
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
};

export const TestTimer = forwardRef<TestTimerRef, TestTimerProps>((props, ref) => {
  const {
    mode, 
    initialTimeMs = 1920000, // 32 minutes default
    onTimeUp, 
    showControls = false,
    isActive = true,
    onToggle
  } = props;
  
  const [time, setTime] = useState(mode === 'countdown' ? initialTimeMs : 0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const initialElapsedTimeOnStartRef = useRef<number>(0);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    getElapsedTime: () => {
      return mode === 'elapsed' ? time : initialTimeMs - time;
    },
    startTimer: () => {
      // This could be called externally if needed
    },
    stopTimer: () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    },
    resetTimer: () => {
      setTime(mode === 'countdown' ? initialTimeMs : 0);
      startTimeRef.current = Date.now();
      initialElapsedTimeOnStartRef.current = 0;
    }
  }));
  
  // Main timer effect
  useEffect(() => {
    if (isActive) {
      // Initialize timing references
      startTimeRef.current = Date.now() - initialElapsedTimeOnStartRef.current;
      
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const currentElapsedTime = now - startTimeRef.current;
        
        if (mode === 'elapsed') {
          setTime(currentElapsedTime);
        } else {
          const remaining = Math.max(0, initialTimeMs - currentElapsedTime);
          setTime(remaining);
          
          if (remaining === 0 && onTimeUp) {
            onTimeUp();
            clearInterval(timerRef.current!);
          }
        }
      }, 100); // Update every 100ms for smooth display
    } else {
      // Clear interval if not running
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, mode, initialTimeMs, onTimeUp]);
  
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    }
  };

  // Determine text color based on time remaining (for countdown mode)
  const getTimeColor = () => {
    if (mode === 'countdown') {
      if (time < 300000) return 'text-red-600'; // Less than 5 minutes
      if (time < 600000) return 'text-yellow-600'; // Less than 10 minutes
    }
    return 'text-white';
  };

  if (!showControls) {
    // Simple time display without controls
    return (
      <div className={`font-medium ${getTimeColor()}`}>
        {formatTime(time)}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`text-lg font-semibold ${getTimeColor()}`}>
        <span className="text-sm font-medium mr-1">
          {mode === 'countdown' ? 'Time Remaining:' : 'Time Elapsed:'}
        </span>
        {formatTime(time)}
      </div>
      
      {showControls && (
        <button
          onClick={handleToggle}
          className="p-1 rounded-md hover:bg-white/10 transition-colors"
        >
          {isActive ? (
            <Pause className="w-5 h-5 text-white" />
          ) : (
            <Play className="w-5 h-5 text-white" />
          )}
        </button>
      )}
    </div>
  );
});
