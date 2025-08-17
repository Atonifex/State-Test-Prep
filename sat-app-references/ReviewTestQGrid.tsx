/* src/components/ReviewGrid.tsx
import React from 'react';
import { Box, Button, Typography, useTheme } from '@mui/material';
import Grid from '@mui/material/Grid';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

type ReviewGridProps = {
  totalQuestions: number;
  currentQuestionIndex: number;
  currentAnswers: Array<{
    questionIndex: number;
    answer: string;
    isCorrect?: boolean;
  }>;
  markedQuestions: number[];
  onNavigate: (index: number) => void;
  showResults: boolean;
};

export const ReviewGrid: React.FC<ReviewGridProps> = ({totalQuestions, currentQuestionIndex, currentAnswers, markedQuestions, 
    onNavigate, showResults = false}) => {

  const theme = useTheme();

  // Create a map of answered questions for quick lookup by looping through the currentAnswers array and adding each question index and answer to the map
  const answeredMap = currentAnswers.reduce((map, item) => {
    map[item.questionIndex] = item;
    return map;
  }, {} as Record<number, typeof currentAnswers[0]>);
  
  return (
    <Box sx={{ mt: 0 }}>
      {/*<Typography variant="h6" sx={{ mb: 2 }}>Question Review</Typography>
      
      <Grid container spacing={1}>
        {Array.from({ length: totalQuestions }).map((_, index) => {
          const isAnswered = !!answeredMap[index];
          const isMarked = markedQuestions.includes(index);
          const isCorrect = showResults && isAnswered ? answeredMap[index].isCorrect : undefined;
          const isCurrent = currentQuestionIndex === index;

          // Determine button color (using valid MUI color values)
          let buttonColor: 'primary' | 'secondary' | 'success' | 'error' | 'info' = 'primary';
          
          if (showResults) {
            if (isCorrect === true) buttonColor = 'success';
            else if (isCorrect === false) buttonColor = 'error';
            else if (isMarked) buttonColor = 'secondary';
          } else {
            if (isMarked) buttonColor = 'secondary';
          }
          
          // If it's the current question, use info color
          if (isCurrent) buttonColor = 'info';
          
          // ********FUTURE NOTE TO SELF:
          /* The colors on the Buttons might need to be adjusted so they only show afterwards - can't show 'em before!
          
                  isCurrent ? theme.palette.secondary.main :
                  !showResults ? (isMarked ? "secondary" : "primary") :
                  isCorrect === true ? "success" : 
                  isCorrect === false ? "error" : 
                  isMarked ? "secondary" : "primary"
          
          return (
            <Grid key={index}>
              <Button variant={isAnswered ? "contained" : "outlined"}
                color={buttonColor}
                onClick={() => onNavigate(index)} 
                sx={{minWidth: '40px', position: 'relative',
                    //Adds the progress indicator:
                    ...(isAnswered && !showResults && !isCurrent && {
                        bgcolor: 'primary.main',
                        color: 'white',
                    }),
                    // Styling for current question
                    ...(isCurrent && {
                        bgcolor: 'secondary.main',
                        color: 'white',
                        fontWeight: 'bold',
                        transform: 'scale(1.1)',
                        zIndex: 1,
                        boxShadow: '0 0 5px rgba(0, 0, 0, 0.2)',
                        // Override hover styles for current question
                        '&:hover': {
                            bgcolor: buttonColor === 'secondary' ? theme.palette.secondary.dark : 
                                    buttonColor === 'info' ? theme.palette.info.dark :
                                    buttonColor === 'success' ? theme.palette.success.dark :
                                    buttonColor === 'error' ? theme.palette.error.dark :
                                    theme.palette.primary.dark,
                        }
                    }),
                }}
              >
                {index + 1}
                {isMarked && (
                  <BookmarkIcon sx={{color: theme.palette.custom.red, position: 'absolute', top: -8, right: -8, fontSize: '1rem'}}/>
                )}
              </Button>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};
*/