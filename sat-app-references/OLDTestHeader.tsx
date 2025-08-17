/*import React, { useState, useEffect, useContext } from 'react';
import { Box, Button, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useNavigate } from 'react-router-dom';
import { TestTimerRef } from './TestTimer';
import { PromptContext, TestState } from '../PromptContext';
import { useTheme } from '@mui/material/styles';
import { FullTestProgress, TestProgress, UserContext } from '../UserAndProfile/UserContext';
interface TestHeaderProps {
  title: string;
  currentIndex: number;
  totalItems: number;
  timerRef?: React.RefObject<TestTimerRef>;
  backUrl?: string;
  backLabel?: string;
  contentPadding?: string | number;
  completedItems?: number;
}

const TestHeader: React.FC<TestHeaderProps> = ({
  title,
  currentIndex,
  totalItems,
  timerRef,
  backUrl = '/sat',
  backLabel = 'Back to Dashboard',
  contentPadding = 2,
  completedItems
}) => {
  const navigate = useNavigate();
  const [timeDisplay, setTimeDisplay] = useState<string>('');
  const { testState, setTestState } = useContext(PromptContext)!;
  const theme = useTheme();
  const { user, saveTestProgress } = useContext(UserContext);
  
  // Calculate remaining questions
  const answeredCount = completedItems !== undefined 
    ? completedItems 
    : testState.answers?.length || 0;
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
  }, [timerRef, testState.isActive, testState.elapsedTime]);


  // Handle back to dashboard with progress saving
  const handleBackToDashboard = () => {
    // 1. Stop the timer and get elapsed time
    let totalElapsedTime = 0;
    if (timerRef?.current) {
      setTestState(prev => ({ ...prev, isActive: false }));
      totalElapsedTime = timerRef.current.getElapsedTime();
      console.log('Timer stopped. Session elapsed time: ', totalElapsedTime);
    } else {
      console.error("Timer reference not available in TestHeader.");
      // Optionally navigate back even if timer fails, or show an error
      navigate(backUrl);
      return;
    }
    
    // Save current progress before navigating away
    if (user && testState.isActive) {
      const testType = testState.type;
      //const fullTestProgress = user.fullTestProgress; //Do I need this?
      // 3. Construct and save progress object
      if (testType === 'diagnostic') {
        // Get previous start time if it exists, otherwise use current test start time
        const startTimeToSave = user.diagnosticTestProgress?.startTime ?? testState.startTime;

        const progress: TestProgress = {
          currentQuestionIndex: testState.currentQuestionIndex,
          answers: testState.answers,
          markedQuestions: testState.markedQuestions,
          elapsedTime: totalElapsedTime,
          // startTime is less critical if elapsedTime is accumulated correctly but helpful just to know dates in general.
          startTime: startTimeToSave
        };

        console.log("Saving diagnostic progress:", progress);
        saveTestProgress('diagnostic', progress); //saves to user.diagnosticTestProgress

        // 4. Update live state to change the timer to 0 and change UI to show that the test is finished.
        setTestState(prev => ({
          ...prev,
          isActive: false,
          elapsedTime: totalElapsedTime // Store total accumulated time
        }));

      } else if (testType === 'fullTest' && testState.currentSection !== undefined && testState.testNumber !== undefined) {
        const previousProgress = user.fullTestProgress;
        const currentSectionIndex = testState.currentSection; // 0-based index from PromptContext, set as default in FullTestPage.tsx
        const existingSections = previousProgress?.sections ?? [];

        // Calculate total time for the current section
        const startTimeToSave = existingSections[currentSectionIndex]?.startTime ?? testState.startTime;

        // Create progress for the current section
        const currentSectionProgress: TestProgress = {
          currentQuestionIndex: testState.currentQuestionIndex,
          answers: testState.answers,
          markedQuestions: testState.markedQuestions,
          elapsedTime: totalElapsedTime,
          startTime: startTimeToSave
        };

        // Update the sections array
        const updatedSections = [...existingSections];
        // Preventative measure to ensure array is long enough 
        // //(important if sections are done out of order (shouldn't happen) or resumed(make sure loading logic is correct in FulLTest.tsx))
        while (updatedSections.length <= currentSectionIndex) {
            // Add empty progress objects for any skipped sections if necessary
            // This might need more robust handling depending on how tests are structured/resumed
            updatedSections.push({ currentQuestionIndex: 0, answers: [], markedQuestions: [], elapsedTime: 0 });
        }
        updatedSections[currentSectionIndex] = currentSectionProgress;

        const progress: FullTestProgress = {
          testNumber: testState.testNumber,
          currentSection: currentSectionIndex, // Save the current section index
          sections: updatedSections,
        };

        console.log("Saving full test progress:", progress);
        saveTestProgress('fullTest', progress);

        // 4. Update live state
        setTestState(prev => ({
          ...prev,
          isActive: false,
          elapsedTime: totalElapsedTime // Store total accumulated time for the section just paused
        }));
      } else {
         console.warn("Attempted to save progress for inactive or invalid test state:", testState);
      }
    } else {
       console.log("No active test or user not logged in, navigating back without saving.");
    }

    // 5. Navigate back
    navigate(backUrl);
  };    
        
      
  return (
    <Box 
      sx={{
        bgcolor: '#2e2e2e',
        color: 'white',
        position: 'relative'
      }}
    >
      {/* Content container with padding 
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: contentPadding,
          py: 2,
          position: 'relative'
        }}
      >
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBackToDashboard}
          sx={{mr: 3, bgcolor: theme.palette.primary.main, borderRadius: 10, px: 3,
            '&:hover': {
              bgcolor: theme.palette.primary.main,
            }
          }}
        >
          {backLabel}
        </Button>
        
        <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
          <Typography variant="overline" sx={{ color: theme.palette.primary.main, lineHeight: 1, mb: 0.5 }}>
            SAT Preparation
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
            {title}
          </Typography>
        </Box>
        
        {/* Spacer to push timer to center 
        <Box sx={{ flexGrow: 1 }} />
        
        {/* Centered timer 
        {timerRef && (
          <Box sx={{display: 'flex', alignItems: 'center', bgcolor: theme.palette.primary.main, p: 1.5, px: 3, 
            borderRadius: 10, boxShadow: '0 4px 12px rgba(241, 101, 34, 0.3)', position: 'absolute', 
            left: '50%', transform: 'translateX(-50%)', zIndex: 1}}>
            <AccessTimeIcon sx={{ mr: 1, color: 'white' }} />
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'medium' }}>
              {timeDisplay}
            </Typography>
          </Box>
        )}
        
        {/* Spacer to push question counter to right 
        <Box sx={{ flexGrow: 1 }} />
        
        {/* Questions remaining counter - styled like other orange buttons 
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          bgcolor: '#f16522',
          py: 1,
          px: 3,
          borderRadius: 10,
          boxShadow: '0 3px 8px rgba(241, 101, 34, 0.2)',
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: '#ff8a50',
            boxShadow: '0 4px 10px rgba(241, 101, 34, 0.3)',
          }
        }}>
          <HelpOutlineIcon sx={{ mr: 1, color: 'white', fontSize: '1.2rem' }} />
          <Typography variant="body2" sx={{ color: 'white', fontWeight: 'medium' }}>
            {remainingQuestions} Questions Remaining
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default TestHeader;
*/