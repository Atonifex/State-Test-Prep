/*import React, { useContext } from 'react';
import { Box, Button, Typography, Tabs, Tab, Badge, List, ListItem, ListItemIcon, ListItemText, Paper } from '@mui/material';
import Grid from '@mui/material/Grid';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import TimerIcon from '@mui/icons-material/Timer';
import SchoolIcon from '@mui/icons-material/School';
import { useTheme } from '@mui/material/styles';
import { PromptContext } from '../PromptContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  contentPadding?: string | number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, contentPadding = 3, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`test-tabpanel-${index}`}
      aria-labelledby={`test-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ px: contentPadding, py: 3 }}>
          {children}
        </Box>
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
  showResults: boolean;
  contentPadding?: string | number;
}

const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({
  totalItems,
  currentIndex,
  currentAnswers,
  markedQuestions,
  onNavigate,
  showResults,
  contentPadding = 2
}) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = React.useState(0);
  const promptContext = useContext(PromptContext);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Create a map of answered questions for quick lookup
  const answeredMap = currentAnswers.reduce((map, item) => {
    map[item.questionIndex] = item;
    return map;
  }, {} as Record<number, typeof currentAnswers[0]>);

  // Button color & style helper functions
  const getButtonVariant = (index: number) => {
    const isAnswered = !!answeredMap[index];
    return isAnswered ? "contained" : "outlined";
  };

  const getButtonColor = (index: number) => {
    if (index === currentIndex) {
      return "secondary";
    }
    
    if (showResults && !!answeredMap[index]) {
      return answeredMap[index].isCorrect ? "success" : "error";
    }
    
    if (markedQuestions.includes(index)) {
      return "secondary";
    }
    
    return "primary";
  };

  const getButtonStyles = (index: number) => {
    const isAnswered = !!answeredMap[index];
    const isMarked = markedQuestions.includes(index);
    const isCurrent = index === currentIndex;
    
    const baseStyles = {
      minWidth: 0,
      width: 40,
      height: 40,
      p: 0,
      position: 'relative',
      transition: 'all 0.2s',
      '&:hover': {
        transform: 'scale(1.05)',
        boxShadow: '0 0 8px rgba(0, 0, 0, 0.3)',
        bgcolor: isCurrent 
          ? theme.palette.secondary.dark 
          : isMarked 
            ? theme.palette.secondary.dark 
            : isAnswered 
              ? theme.palette.primary.dark
              : 'rgba(0, 0, 0, 0.08)'
      }
    };
    
    // Add additional styles for current question
    if (isCurrent) {
      return {
        ...baseStyles,
        bgcolor: theme.palette.secondary.main,
        color: 'white',
        transform: 'scale(1.1)',
        zIndex: 1,
        boxShadow: '0 0 5px rgba(0, 0, 0, 0.2)',
        fontWeight: 'bold',
        border: `2px solid ${theme.palette.secondary.dark}`,
        '&:hover': {
          bgcolor: theme.palette.secondary.dark,
          transform: 'scale(1.15)',
          boxShadow: '0 0 8px rgba(0, 0, 0, 0.4)',
        }
      };
    }
    
    return baseStyles;
  };

  return (
    <Box>
      {/* Tabs - full width background 
      <Box sx={{ 
        bgcolor: 'rgba(0,0,0,0.02)',
        borderBottom: '1px solid',
        borderColor: theme.palette.divider
      }}>
        {/* Tabs content with padding 
        <Box sx={{ px: contentPadding }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="fullWidth"
          >
            <Tab 
              label="Overview - All Questions" 
              icon={<CheckCircleIcon />} 
              iconPosition="start"
            />
            <Tab 
              label={
                <Badge badgeContent={markedQuestions.length} color="secondary" sx={{ '& .MuiBadge-badge': { right: -15 } }}>
                  Marked Questions
                </Badge>
              } 
              icon={<BookmarkIcon />} 
              iconPosition="start"
              disabled={markedQuestions.length === 0}
            />
            <Tab 
              label="Tips & Strategies" 
              icon={<TipsAndUpdatesIcon />} 
              iconPosition="start"
            />
          </Tabs>
        </Box>
      </Box>
      
      {/* Tab panels with content padding 
      <TabPanel value={tabValue} index={0} contentPadding={contentPadding}>
        <Grid container spacing={1}>
          {[...Array(totalItems)].map((_, index) => {
            const isAnswered = !!answeredMap[index];
            const isMarked = markedQuestions.includes(index);
            
            return (
              <Grid key={index}>
                <Button 
                  variant={getButtonVariant(index)}
                  color={getButtonColor(index)}
                  onClick={() => onNavigate(index)}
                  sx={getButtonStyles(index)}
                >
                  {index + 1}
                  {isMarked && (
                    <BookmarkIcon sx={{ 
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      fontSize: '1rem',
                      color: theme.palette.secondary.main
                    }} />
                  )}
                </Button>
              </Grid>
            );
          })}
        </Grid>
      </TabPanel>
      
      <TabPanel value={tabValue} index={1} contentPadding={contentPadding}>
        {markedQuestions.length > 0 ? (
          <Grid container spacing={1}>
            {markedQuestions.map(index => {
              return (
                <Grid key={index}>
                  <Button 
                    variant={getButtonVariant(index)}
                    color={getButtonColor(index)}
                    onClick={() => onNavigate(index)}
                    sx={getButtonStyles(index)}
                  >
                    {index + 1}
                    <BookmarkIcon sx={{ 
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      fontSize: '1rem',
                      color: theme.palette.secondary.main
                    }} />
                  </Button>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <BookmarkIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body1" color="text.secondary">
              No questions marked for review yet
            </Typography>
          </Box>
        )}
      </TabPanel>
      
      <TabPanel value={tabValue} index={2} contentPadding={contentPadding}>
        <Box>
          <Typography variant="h6" gutterBottom>
            SAT Test-Taking Strategies
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon>
                <TimerIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Time Management" 
                secondary="Spend about 1 minute per question. If you're stuck, mark the question and move on."
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <LightbulbIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Process of Elimination" 
                secondary="Cross out obviously wrong answers to improve your odds when guessing."
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <SchoolIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Read Carefully" 
                secondary="On reading questions, make sure you understand what the question is asking before selecting an answer."
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <HelpOutlineIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Use Test Layout" 
                secondary="Mark difficult questions and come back to them. The test is not sequential in difficulty - easier questions may follow harder ones."
              />
            </ListItem>
          </List>
        </Box>
      </TabPanel>
    </Box>
  );
};

export default QuestionNavigator;

*/