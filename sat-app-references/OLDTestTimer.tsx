/* src/components/TestTimer.tsx
import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef, useContext} from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { PromptContext } from '../PromptContext';

type TestTimerProps = {
  mode: 'elapsed' | 'countdown';
  initialTimeMs?: number; // For countdown mode
  onTimeUp?: () => void; // Callback when countdown reaches zero
  showControls?: boolean;
};

export type TestTimerRef = {
    getElapsedTime: () => number;
    //startTimer: () => void;
    //stopTimer: () => void;
    //resetTimer: () => void;
    //initializeTime: (timeInMs: number) => void;
};

export const TestTimer = forwardRef<TestTimerRef, TestTimerProps>((props, ref) => {
  const {mode, initialTimeMs = 1920000, onTimeUp, showControls = false} = props;
  const { testState, setTestState } = useContext(PromptContext)!;
  
  const [time, setTime] = useState(mode === 'countdown' ? initialTimeMs : 0);
  //const [isRunning, setIsRunning] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const initialElapsedTimeOnStartRef = useRef<number>(0);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    getElapsedTime: () => {
      return mode === 'elapsed' ? time : initialTimeMs - time;
    }
  }));
  
  //This is the timer that will be used to display the time remaining or elapsed - incrementing every 100ms
  useEffect(() => {
    if (testState.isActive) {
      console.log("TestTimer useEffect: testState.isActive is true");
      initialElapsedTimeOnStartRef.current = testState.elapsedTime || 0;
      setTime(initialElapsedTimeOnStartRef.current);
      startTimeRef.current = Date.now() - initialElapsedTimeOnStartRef.current; //avoids potential asynchronous problems with setTime.
      
      //startTimeRef.current = Date.now() - (mode === 'elapsed' ? time : initialTimeMs - time);
      
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
            setTestState(prev => ({ ...prev, isActive: false }));
          }
        }
      }, 100);
    } else {
      // Clear interval if not running
      if (timerRef.current) {
         clearInterval(timerRef.current);
      }
   }
    
    return () => {
      if (timerRef.current) {
        console.log("TestTimer useEffect: Cleanup clearing interval", timerRef.current);
        clearInterval(timerRef.current);

      }
    };
  }, [testState.isActive, mode, initialTimeMs, onTimeUp, setTestState, testState.elapsedTime]);
  
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const toggleTimer = () => {
    setTestState(prev => ({ ...prev, isActive: !prev.isActive }));
  };

  //I don't know if showControls are ever turned on, so could potentially remove this, but I'll keep for now.
  //- 4/9/2025.
  return showControls ? (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="h6" color={
        // Add warning colors for countdown mode
        mode === 'countdown' && time < 300000 ? 'error.main' : 
        mode === 'countdown' && time < 600000 ? 'warning.main' : 
        'text.primary'
      }>
        {mode === 'countdown' ? 'Time Remaining: ' : 'Time Elapsed: '}
        {formatTime(time)}
      </Typography>
      
      {showControls && (
        <IconButton onClick={toggleTimer} size="small">
          {testState.isActive ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>
      )}
    </Box>
  ) : null;
});*/