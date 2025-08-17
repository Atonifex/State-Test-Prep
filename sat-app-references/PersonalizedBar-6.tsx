/*import React, { ReactNode } from 'react';
import { Box, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import TestHeader from './TestHeader';
import TestProgressStats from './TestProgressStats';
import QuestionNavigator from './QuestionNavigator';
import { TestTimer } from './TestTimer';

interface PersonalizedBarProps {
  title: string;
  currentIndex?: number;
  totalItems?: number;
  timerRef?: React.RefObject<any>;
  backUrl?: string;
  backLabel?: string;
  children?: ReactNode;
  currentAnswers?: Array<{
    questionIndex: number;
    answer: string;
    isCorrect?: boolean;
  }>;
  markedQuestions?: number[];
  onNavigate?: (index: number) => void;
  showResults?: boolean;
}

const PersonalizedBar6: React.FC<PersonalizedBarProps> = ({
  title,
  currentIndex = 0,
  totalItems = 0,
  timerRef,
  backUrl = '/sat',
  backLabel = 'Back to Dashboard',
  children,
  currentAnswers = [],
  markedQuestions = [],
  onNavigate = () => {},
  showResults = false
}) => {
  const theme = useTheme();

  // Calculate stats
  const answeredCount = currentAnswers.length;
  const markedCount = markedQuestions.length;

  return (
    <Box sx={{ mb: 4 }}>
      {/* Hidden timer that creates the timer instance 
      {timerRef && (
        <Box sx={{ position: 'absolute', height: 0, overflow: 'hidden', opacity: 0 }}>
          <TestTimer ref={timerRef} mode="elapsed" />
        </Box>
      )}

      <Paper 
        elevation={0} 
        sx={{
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid',
          borderColor: theme.palette.divider,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
        }}
      >
        {/* Header - full width background with padded content 
        <TestHeader 
          title={title}
          currentIndex={currentIndex}
          totalItems={totalItems}
          timerRef={timerRef}
          backUrl={backUrl}
          backLabel={backLabel}
          contentPadding="3vw"
        />
        
        {/* Gradient line 
        <Box sx={{ 
          height: 8, 
          width: '100%', 
          background: 'linear-gradient(90deg, #f16522 0%, #ff8a50 50%, #2e2e2e 100%)' 
        }} />
        
        {/* Progress stats - full width background with padded content 
        <TestProgressStats 
          answeredCount={answeredCount}
          markedCount={markedCount}
          totalItems={totalItems}
          contentPadding="3vw"
          currentAnswers={currentAnswers}
          markedQuestions={markedQuestions}
        />
        
        {/* Question navigator - full width background with padded content 
        <QuestionNavigator 
          totalItems={totalItems}
          currentIndex={currentIndex}
          currentAnswers={currentAnswers}
          markedQuestions={markedQuestions}
          onNavigate={onNavigate}
          showResults={showResults}
          contentPadding="3vw"
        />
      </Paper>
      
      {children}
    </Box>
  );
};

export default PersonalizedBar6;

*/