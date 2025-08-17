/*import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';

interface TestProgressStatsProps {
  answeredCount: number;
  markedCount: number;
  totalItems: number;
  contentPadding?: string | number;
  currentAnswers?: Array<{
    questionIndex: number;
    answer: string;
    isCorrect?: boolean;
  }>;
  markedQuestions?: number[];
}

const TestProgressStats: React.FC<TestProgressStatsProps> = ({
  answeredCount,
  markedCount,
  totalItems,
  contentPadding = 2,
  currentAnswers = [],
  markedQuestions = []
}) => {
  const remainingCount = totalItems - answeredCount;
  const answeredPercentage = (answeredCount / totalItems) * 100;
  
  // Calculate segment positions for the tick marks
  const tickPositions = Array.from({ length: totalItems + 1 }, (_, i) => (i / totalItems) * 100);

  return (
    <Box sx={{ bgcolor: 'background.paper' }}>
      {/* Content container with padding 
      <Box sx={{ px: contentPadding, py: 2 }}>
        <Box sx={{ mb: 1 }}>
          <Typography variant="body1" fontWeight="medium" color="text.primary" sx={{ mb: 0.5 }}>
            Progress: {answeredCount} of {totalItems} Questions Completed
          </Typography> {/*Your Progress: 
          
          {/* Progress bar container with tick marks 
          <Box sx={{ position: 'relative', mt: 3, mb: 4 }}>
            {/* Tick marks 
            {tickPositions.map((position, index) => (
              <Box
                key={index}
                sx={{
                  position: 'absolute',
                  left: `${position}%`,
                  height: 8,
                  width: 2,
                  bgcolor: index % 5 === 0 ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)',
                  top: -12,
                  transform: 'translateX(-50%)',
                  display: totalItems <= 30 ? 'block' : (index % 5 === 0 ? 'block' : 'none')
                }}
              />
            ))}
            
            {/* Progress bar 
            <LinearProgress 
              variant="determinate" 
              value={answeredPercentage} 
              sx={{ 
                height: 16, 
                borderRadius: 2,
                bgcolor: 'rgba(0, 0, 0, 0.05)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: '#f16522',
                  borderRadius: 2,
                }
              }} 
            />
            
            {/* Question number indicators - now below the progress bar 
            {tickPositions.slice(1).map((position, index) => (
              <Typography
                key={`number-${index}`}
                variant="caption"
                sx={{
                  position: 'absolute',
                  left: `${position}%`,
                  top: -40, // Positioned below the progress bar
                  transform: 'translateX(-50%)',
                  fontSize: '0.9rem', // Increased font size
                  fontWeight: 'medium',
                  color: 'text.secondary',
                  display: totalItems <= 10 ? 'block' : (index % 5 === 4 ? 'block' : 'none')
                }}
              >
                {index + 1}
              </Typography>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default TestProgressStats;
*/