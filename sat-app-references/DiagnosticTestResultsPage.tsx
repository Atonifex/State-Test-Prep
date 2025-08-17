/*"use client"

import type React from "react"

import { useState, useContext, useEffect, useMemo } from "react"
import {ThemeProvider, styled, Box, Card, CardContent, Typography, Button, LinearProgress, Tabs, Tab, Chip, Divider, Paper, Stack, Container, useTheme, CardHeader} from "@mui/material"
import {AccessTime as Clock, CheckCircle, BarChart, Psychology as Brain, Bolt as Zap, Lightbulb, Info, Schedule as Clock3, TrackChanges as Target, MenuBook as BookOpen, HelpOutline as HelpCircle, BarChart as BarChart2} from "@mui/icons-material"
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link, useNavigate } from "react-router-dom"
import { UserContext, TestAttempt, SkillFrequency, categories, skillFrequency, SkillName } from "../UserAndProfile/UserContext"
import { TestQuestion, UserAnswerRecord } from "../../types";
import { PromptContext, getStrategyForSkill } from "../PromptContext";
import { SkillPerformance, MissedQuestionDisplayData, getSkillSection } from "./TestResultsUtils";
import CreateStudyPlanModal from "../StudyPlan/CreateStudyPlanModal";

// Custom styled components
const IconWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: `${theme.palette.primary.main}15`,
  borderRadius: "50%",
  padding: theme.spacing(1),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}))



const StyledChip = styled(Chip)<{ difficulty: "Easy" | "Medium" | "Hard" }>(({ difficulty, theme }) => {
  let bgColor = theme.palette.custom.green
  let textColor = "#fff"

  if (difficulty === "Medium") {
    bgColor = theme.palette.custom.amber
    textColor = "#fff"
  } else if (difficulty === "Hard") {
    bgColor = theme.palette.custom.red
  }

  return {
    backgroundColor: bgColor,
    color: textColor,
    fontWeight: 500,
    "&:hover": {
      backgroundColor: bgColor,
    },
  }
})

const BorderLeftCard = styled(Card)<{ bordercolor: string }>(({ bordercolor }) => ({
  borderLeft: `4px solid ${bordercolor}`,
  height: "100%",
}))

const StatsCard = styled(Card)({
  height: "100%",
})

// TabPanel component for the Tabs
function TabPanel(props: {
  children?: React.ReactNode
  index: number
  value: number
}) {
  const { children, value, index, ...other } = props

  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`} {...other}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  )
}

export default function DiagnosticResultsDashboard() {
  const theme = useTheme();
  const navigate = useNavigate();

  const { renderLatexOrText } = useContext(PromptContext)!;
  const { user } = useContext(UserContext);
  const [testAttemptData, setTestAttemptData] = useState<TestAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0)
  const [goalDates, setGoalDates] = useState({
    "review-missed": "May 18, 2023",
    "algebra-practice": "May 20, 2023",
    "reading-improvement": "May 22, 2023",
    "timed-drills": "May 25, 2023",
    "concept-mastery": "May 27, 2023",
    "friend-chat": "May 29, 2023",
  })
  const [questions, setQuestions] = useState<TestQuestion[]>([]);

  const [editingDate, setEditingDate] = useState<string | null>(null)
  const [isCreatePlanModalOpen, setIsCreatePlanModalOpen] = useState(false);

  // Format the test date from the actual test data
  const testDate = testAttemptData ? new Date(testAttemptData.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : "Not available"

  // Extract scores directly from testAttemptData
  const overallScore = testAttemptData?.totalScore || 400;
  const mathScore = testAttemptData?.mathScore || 200; //This is the average of the lower and upper bounds of the math score range.
  const readingWritingScore = testAttemptData?.readingWritingScore || 200; //This is the average of the lower and upper bounds of the reading and writing score range.
  const targetScore = user?.targetScores ?
    (parseInt(user.targetScores.math || '0') + parseInt(user.targetScores.readingWriting || '0')) : 1600;

  // Get score ranges directly
  const mathScoreRange = testAttemptData?.diagnosticMathScores || { lower: 200, upper: 200 };
  const readingScoreRange = testAttemptData?.diagnosticReadingWritingScores || { lower: 200, upper: 200 };

  // Calculate question stats
  const totalQuestions = testAttemptData?.sections.reduce(
    (sum: number, section: any) => sum + (section.questions?.length || 0), 0
  ) || 0;
  const correctQuestions = testAttemptData?.sections.reduce(
    (sum: number, section: any) => sum + (section.questions?.filter((q: any) => q.isCorrect).length || 0), 0
  ) || 0;

  // Format time data
  const totalTimeMs = testAttemptData?.sections.reduce(
    (sum: number, section: any) => sum + (section.elapsedTime || 0), 0
  ) || 0;
  const totalMinutes = Math.floor(totalTimeMs / (1000 * 60));
  const totalSeconds = Math.floor((totalTimeMs % (1000 * 60)) / 1000);
  const totalTime = `${totalMinutes}m ${totalSeconds}s`;

  const avgTimeMs = totalQuestions > 0 ? totalTimeMs / totalQuestions : 0;
  const avgMinutes = Math.floor(avgTimeMs / (1000 * 60));
  const avgSeconds = Math.floor((avgTimeMs % (1000 * 60)) / 1000);
  const avgTimePerQuestion = `${avgMinutes}m ${avgSeconds}s`;

  // Load the most recent diagnostic test data --> 
  useEffect(() => {
    if (user) {
      const diagnosticTests = user.testAttempts?.filter(
        test => test.testType === 'diagnostic' && test.completed
      ) || [];
      
      if (diagnosticTests.length > 0) {
        const sortedTests = [...diagnosticTests].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setTestAttemptData(sortedTests[0]);
      } else {
         setTestAttemptData(null);
      }
      setLoading(false);
    } else {
        setLoading(false);
    }
  }, [user]);

  //Fetch the diagnostic test questions so they can be filtered later for Missed Questions. 
  useEffect(() => {
    const fetchTestQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/satquestions/diagnostic-test.json');
        if (!response.ok) {
          throw new Error('Failed to load diagnostic test questions. Response status: ' + response.status);
        }
        
        const data = await response.json();
        //setQuestions(data.questions); //data.questions is an array of TestQuestion objects
        //Formerly I had the above in place of questionsWithIndex - not sure if questionsWithIndex is right - double check.
        const questionsWithIndex = data.questions.map((q: TestQuestion, index: number) => ({ ...q, index }));
        setQuestions(questionsWithIndex);
        setLoading(false);
      } catch (err) {
        console.error("Error loading diagnostic test questions:", err);
        setError('Error loading diagnostic test questions: ' + (err instanceof Error ? err.message : String(err)));
        setLoading(false);
      }
    };
    fetchTestQuestions();
  }, []);
    

  const isMathSkill = (skill: SkillName): boolean => {
    return categories.Math.includes(skill as any);
  }
  
  // Replace the static skillPerformance array with this dynamic calculation
  const skillPerformance: SkillPerformance[] = useMemo(() => {
    if (!testAttemptData || !testAttemptData.sections || testAttemptData.sections.length === 0) {
      return [];
    }

    const diagnosticSection = testAttemptData.sections[0];
    if (!diagnosticSection || !diagnosticSection.questions) {
      return [];
    }

    // Group questions by skill
    const skillMap: Record<string, {
      section: "Math" | "Reading and Writing",
      correct: number,
      total: number,
      totalTime: number,
      questions: number
    }> = {};

    // Process all questions to build skill statistics
    diagnosticSection.questions.forEach(question => {
      const skill = question.skill;
      const section = getSkillSection(skill);
      
      if (!skillMap[skill]) {
        skillMap[skill] = {
          section,
          correct: 0,
          total: 0,
          totalTime: 0,
          questions: 0
        };
      }
      
      skillMap[skill].total++;
      skillMap[skill].questions++;
      
      if (question.isCorrect) {
        skillMap[skill].correct++;
      }
      
      // Add time spent if available
      if (question.timeSpent) {
        skillMap[skill].totalTime += question.timeSpent;
      }
    });

    // Convert the map to the required SkillPerformance array format
    return Object.entries(skillMap).map(([skill, data]) => {
      // Calculate average time in seconds
      const avgTimeInSeconds = data.questions > 0 ? 
        Math.round(data.totalTime / data.questions / 1000) : 0;
      
      // Estimate target time based on section (simplified approach)
      //Actual time allowed is 95 seconds for Math and 71 for Reading, but this teaches students to go faster.
      const targetTime = data.section === 'Math' ? 80 : 60; 
      
      return {
        skill,
        section: data.section,
        percentCorrect: Math.round((data.correct / data.total) * 100),
        avgTime: avgTimeInSeconds,
        targetTime,
        questionsAttempted: data.total
      };
    }).sort((a, b) => b.percentCorrect - a.percentCorrect); // Sort by performance (high to low)
  }, [testAttemptData]);


  // Replace the static missedQuestions array with this dynamic calculation
  const missedQuestions: MissedQuestionDisplayData[] = useMemo(() => {
    if (!testAttemptData || !testAttemptData.sections || testAttemptData.sections.length === 0 || !testAttemptData.sections[0].questions) {
      return [];
    }

    const diagnosticSection = testAttemptData.sections[0];

    // Filter for incorrect questions
    const incorrectQuestions = diagnosticSection.questions.filter(q => !q.isCorrect);

    // Get the original questions data to access full question text and explanations
    // This assumes you have access to the original questions array
    // If not, you'll need to fetch this data or store it more completely in the test attempt
    const originalQuestions = questions || [];
    
    return incorrectQuestions.map(question => {
      // Find the original question to get full text and explanation
      const originalQuestion = originalQuestions.find((q: TestQuestion) => q.index === question.questionIndex);
      
      // Format time spent in a readable format
      let timeSpentFormatted = "Unknown";
      if (question.timeSpent) {
        const minutes = Math.floor(question.timeSpent / (1000 * 60));
        const seconds = Math.floor((question.timeSpent % (1000 * 60)) / 1000);
        timeSpentFormatted = `${minutes}m ${seconds}s`;
      }
      
      const skill = question.skill;
      const section = getSkillSection(skill);
      
      return {
        ...question,
        timeSpent: timeSpentFormatted,
        skill: question.skill,
        section,
        difficulty: originalQuestion?.difficulty || 'Medium',
        questionPreview: originalQuestion?.question || `Question ${question.questionIndex + 1}`,
        explanation: originalQuestion?.explanation || "Explanation not available",
        strategy: getStrategyForSkill(question.skill) // See helper function below
      };
    });
  }, [testAttemptData, questions]);


  // Calculate prioritized recommended skills based on missed questions - not used as of 4/17 - potentially delete this.
  const recommendedSkills = useMemo((): SkillName[] => {
    if (!testAttemptData || !testAttemptData.sections || testAttemptData.sections.length === 0) {
      return [];
    }

    // Diagnostic only has one section
    const diagnosticSection = testAttemptData.sections[0];
    if (!diagnosticSection || !diagnosticSection.questions) return [];

    // 1. Filter for missed questions
    const missedQuestions = diagnosticSection.questions.filter(q => !q.isCorrect);

    // 2. Extract unique skill names from missed questions
    const missedSkillNames = [...new Set(missedQuestions.map(q => q.skill as SkillName))];

    // 3. Sort missed skills by frequency (descending)
    const sortedSkills = missedSkillNames.sort((skillA, skillB) => {
      const freqA = skillFrequency[skillA] || 0; // Default to 0 if skill somehow not in frequency map
      const freqB = skillFrequency[skillB] || 0;
      return freqB - freqA; // Sort descending (highest frequency first)
    });

    return sortedSkills;
  }, [testAttemptData]); // Recalculate only when testAttemptData changes


  const handleDateEdit = (activityId: string, newDate: string) => {
    setGoalDates((prev) => ({
      ...prev,
      [activityId]: newDate,
    }))
    setEditingDate(null)
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  // Helper function to get color based on percentage
  const getColor = (percent: number) => {
    if (percent >= 85) return theme.palette.custom.green
    if (percent >= 70) return theme.palette.custom.amber // Using amber instead of yellow
    return theme.palette.custom.red
  }

  // Helper function to get time comparison indicator
  const getTimeIndicator = (avgTime: number, targetTime: number) => {
    const diff = avgTime - targetTime
    if (diff <= 0)
      return (
        <Typography component="span" sx={{ color: theme.palette.custom.green }}>
          ✓
        </Typography>
      )
    if (diff <= 15)
      return (
        <Typography component="span" sx={{ color: theme.palette.custom.amber }}>
          ⚠️
        </Typography>
      )
    return (
      <Typography component="span" sx={{ color: theme.palette.custom.red }}>
        ⏱️
      </Typography>
    )
  }

  //NEW on 4/12/2025: Redirects to the /sat page with the skill and difficulty parameters to practice similar questions:
  const handlePracticeSimilarQuestions = (skill: string, difficulty: string) => {
    console.log(`Practicing similar questions for skill: ${skill} and difficulty: ${difficulty}`);
    navigate(`/skill-practice?skill=${skill}&difficulty=${difficulty}`);
  }

  // Add a new handler for the lowest skill practice button
  const handlePracticeLowestSkill = () => {
    if (!hasTestData || skillPerformance.length === 0) {
      console.error("Cannot practice lowest skill: No test data or skill performance array is empty.");
      return; // Should not happen if hasTestData is true, but good safety check
    }

    const lowestSkill = skillPerformance[skillPerformance.length - 1]; //***Double check this works correctly on 4/15/2025 
    const subjectPath = lowestSkill.section === 'Math' ? 'math' : 'reading-and-writing';
    const skillName = lowestSkill.skill;
    const difficulty = 'Medium'; // Defaulting to Medium difficulty

    // Ensure skillName is encoded for the URL
    const encodedSkillName = encodeURIComponent(skillName);

    const targetUrl = `/skill-practice?skill=${encodedSkillName}&difficulty=${difficulty}`; ///${subjectPath}
    console.log(`Navigating to practice lowest skill: ${targetUrl}`); // For debugging
    navigate(targetUrl);
  };

  // Add this check at the beginning of your component
  const hasTestData = testAttemptData && 
                     testAttemptData.sections && 
                     testAttemptData.sections.length > 0 &&
                     skillPerformance.length > 0;

  // --- Navigation Handlers ---

  const handleStartReview = () => {
    if (!testAttemptData) return;
    navigate('/review-missed-questions', {
      state: {
        action: 'startRecentReview',
        testId: testAttemptData.id
      }
    });
  };

  const handleReviewSpecificQuestion = (questionIndex: number) => {
    if (!testAttemptData) return;
    navigate('/review-missed-questions', {
      state: {
        action: 'reviewSpecific',
        testId: testAttemptData.id,
        targetQuestionIndex: questionIndex // Pass the original index
      }
    });
  };

  //Not necessary becauase the "View All Missed Questions" now just uses the handleStartReview as of 4/22/2025.
  const handleViewAllMissed = () => {
    if (!testAttemptData) return;
    navigate('/review-missed-questions', {
      state: {
        action: 'viewRecent',
        testId: testAttemptData.id
      }
    });
  }; 

  // --- Modal Handlers ---
  const handleOpenCreatePlanModal = () => {
    console.log("Opening Create Study Plan Modal from Results Page");
    setIsCreatePlanModalOpen(true);
  };

  const handleCloseCreatePlanModal = () => {
    setIsCreatePlanModalOpen(false);
  };

  if (loading) {
    return <Container sx={{ mt: 4 }}><Typography>Loading test results...</Typography></Container>;
  }

  if (error) {
    return <Container sx={{ mt: 4 }}><Typography color="error">Error loading results: {error}</Typography></Container>;
  }

  if (!testAttemptData) {
    return <Container sx={{ mt: 4 }}><Typography>No diagnostic test results found.</Typography></Container>;
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* Header 
          <Box sx={{ mb: 3, mt: 10, borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: { md: "center" }, 
              justifyContent: { md: "space-between" }, gap: 2}}>
              
              <Button variant="contained" color="primary" startIcon={<ArrowBackIcon />} onClick={() => navigate('/sat')}
                  sx={{ mr: 3, mb: {xs: 0, md: 3}, mt: {xs: 0, md: 1} }}>Back to Dashboard
              </Button>
              <Box sx={{my: 1}}>
                <Typography variant="h4" component="h1" fontWeight="bold">
                  SAT Diagnostic Results
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Test completed on {testDate}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: {xs: 1, md: 0} }}>
                <Box sx={{ textAlign: "center", minWidth: "60px" }}>
                  <Typography variant="body2" color="text.secondary">
                    Math
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {mathScore}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "center", minWidth: "120px" }}>
                  <Typography variant="body2" color="text.secondary">
                    Reading and Writing
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {readingWritingScore}
                  </Typography>
                </Box>
                <Typography color="text.secondary">=</Typography>
                <Box sx={{ textAlign: "center", minWidth: "60px", mr: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Total Estimated Score
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {overallScore}
                  </Typography>
                </Box>
                {/*4/22/2025: I originally had this to show target score, but it's cleaner without it.
                targetScore && targetScore > 0 ? (
                  <>
                    <Typography color="text.secondary">→</Typography>
                    <Box sx={{ textAlign: "center", minWidth: "80px" }}>
                      <Typography variant="body2" color="text.secondary">
                        Target Score
                      </Typography>
                      <Typography variant="h5" fontWeight="bold" color="primary">
                        {targetScore}
                      </Typography>
                    </Box>
                  </>
                ) : null
                
              </Box>
            </Box>
          </Box>

          {/* Quick Stats Cards 
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
            {/* Card 1 - Section Scores 
            <Box sx={{width: {xs: "100%", // Full width on mobile
                sm: "calc(50% - 8px)", // 2 per row on small screens
                md: "calc(25% - 12px)" // 4 per row on medium and larger screens
              } 
            }}>
              <StatsCard sx={{ height: "100%" }}>
                <CardContent sx={{p: 2, pb: 2, height: "100%", display: "flex", alignItems: "center", gap: 1.5}}>
                  <IconWrapper>
                    <BarChart sx={{ color: "primary.main" }} />
                  </IconWrapper>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Section Score Range
                    </Typography>
                    <Box sx={{ display: "flex", gap: 0.5, alignItems: "baseline", mt: 0.5 }}>
                      <Typography variant="body1" fontWeight="bold">
                        {mathScoreRange.lower}-{mathScoreRange.upper}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Math
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 0.5, alignItems: "baseline", mt: 0.5 }}>
                      <Typography variant="body1" fontWeight="bold">
                        {readingScoreRange.lower}-{readingScoreRange.upper}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Reading
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </StatsCard>
            </Box>

            {/* Card 2 - Overall Score 
            <Box sx={{width: {xs: "100%", sm: "calc(50% - 8px)", md: "calc(25% - 12px)" }}}>
              <StatsCard sx={{ height: "100%" }}>
                <CardContent sx={{p: 2, pb: 2, height: "100%",display: "flex", alignItems: "center", gap: 1.5}}>
                  <IconWrapper>
                    <Target sx={{ color: "primary.main" }} />
                  </IconWrapper>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Overall Score
                    </Typography>
                    
                    <Box sx={{ display: "flex", gap: 0.5, alignItems: "baseline", mt: 0.5 }}>
                      <Typography variant="h6" fontWeight="bold">{overallScore}</Typography>
                    </Box>
                    
                    {targetScore && targetScore > 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        vs. {targetScore}
                      </Typography>
                    ) : null}
                  </Box>
                </CardContent>
              </StatsCard>
            </Box>

            {/* Card 3 - Total Time 
            <Box sx={{width: {xs: "100%", sm: "calc(50% - 8px)", md: "calc(25% - 12px)"}}}>
              <StatsCard sx={{ height: "100%" }}>
                <CardContent sx={{p: 2, pb: 2, height: "100%", display: "flex", alignItems: "center", gap: 1.5}}>
                  <IconWrapper>
                    <Clock3 sx={{ color: "primary.main" }} />
                  </IconWrapper>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Time
                    </Typography>
                    <Box sx={{ display: "flex", gap: 0.5, alignItems: "baseline", mt: 0.5 }}>
                      <Typography variant="h6" fontWeight="bold">
                        {totalTime}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {totalQuestions} Questions
                    </Typography>
                  </Box>
                </CardContent>
              </StatsCard>
            </Box>

            {/* Card 4 - Avg Time 
            <Box sx={{width: {xs: "100%", sm: "calc(50% - 8px)", md: "calc(25% - 12px)"}}}>
              <StatsCard sx={{ height: "100%" }}>
                <CardContent sx={{p: 2, pb: 2, height: "100%", display: "flex", alignItems: "center", gap: 1.5}}>
                  
                  <IconWrapper>
                    <Clock sx={{ color: "primary.main" }} />
                  </IconWrapper>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Avg. Time / Q
                    </Typography>
                    <Box sx={{ display: "flex", gap: 0.5, alignItems: "baseline", mt: 0.5 }}>
                      <Typography variant="h6" fontWeight="bold">
                        {avgTimePerQuestion}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Across Test
                    </Typography>
                  </Box>
                </CardContent>
              </StatsCard>
            </Box>
          </Box>

          {/* AI Summary *******IMPLEMENT THIS LATER IN MAY! 
          <Card
            sx={{
              mb: 3,
              bgcolor: `${theme.palette.primary.main}08`,
              borderColor: `${theme.palette.primary.main}20`,
            }}
          >
            <CardContent sx={{ pt: 3 }}>
              <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                <IconWrapper>
                  <Zap sx={{ color: "primary.main" }} />
                </IconWrapper>
                <Box>
                  <Typography variant="h6" fontWeight="medium" sx={{ mb: 1 }}>
                    Performance Summary
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your diagnostic test shows strong performance in Punctuation and Statistics (90%), but you need to
                    focus on Algebra and Inferences where you scored below 70%. Your timing on Math questions is
                    consistently longer than recommended targets, particularly in Geometry where you're taking 30
                    seconds longer than ideal. With targeted practice on algebraic concepts and reading comprehension
                    strategies, you could improve your overall score by 100+ points.
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Skill Performance Bar View 
          <Card sx={{ mb: 4 }}>
            <CardHeader
              title="Skill Performance"
              subheader="Your accuracy and timing across different question types"
              sx={{ pb: 1 }}
            />
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs value={activeTab} onChange={handleTabChange} aria-label="skill tabs">
                  <Tab label="All Skills" />
                  <Tab label="Math" />
                  <Tab label="Reading and Writing" />
                </Tabs>
              </Box>

              <TabPanel value={activeTab} index={0}>
                <Stack spacing={1.5}>
                  {skillPerformance.map((skill, index) => (
                    <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          width: { xs: 100, sm: 130 },
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={skill.skill}
                      >
                        {skill.skill}
                      </Typography>
                      <Box sx={{flexGrow: 1, height: 24, bgcolor: "grey.100", borderRadius: 1,
                          overflow: "hidden", position: "relative",
                        }}
                      >
                        <Box
                          sx={{
                            height: "100%",
                            width: `${skill.percentCorrect}%`,
                            bgcolor: getColor(skill.percentCorrect),
                            borderRadius: 1,
                          }}
                        />
                        <Box
                          sx={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            px: 1,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ color: "white", fontWeight: "medium", textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
                          >
                            {skill.percentCorrect}%
                          </Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: "medium" }}>
                            {skill.avgTime}s {getTimeIndicator(skill.avgTime, skill.targetTime)}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ width: 24, textAlign: "center" }}>
                        {skill.questionsAttempted}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: theme.palette.custom.green }} />
                    <Typography variant="caption" color="text.secondary">
                      85%+ (Strong)
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: theme.palette.custom.amber }} />
                    <Typography variant="caption" color="text.secondary">
                      70-84% (Good)
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: theme.palette.custom.red }} />
                    <Typography variant="caption" color="text.secondary">
                      Below 70% (Needs Work)
                    </Typography>
                  </Box>
                </Box>
              </TabPanel>

              <TabPanel value={activeTab} index={1}>
                <Stack spacing={1.5}>
                  {skillPerformance
                    .filter((skill) => skill.section === "Math")
                    .map((skill, index) => (
                      <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="body2" sx={{width: { xs: 100, sm: 130 }, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}} title={skill.skill}>
                          {skill.skill}
                        </Typography>
                        <Box
                          sx={{ flexGrow: 1,
                            height: 24,
                            bgcolor: "grey.100",
                            borderRadius: 1,
                            overflow: "hidden",
                            position: "relative",
                          }}
                        >
                          <Box
                            sx={{
                              height: "100%",
                              width: `${skill.percentCorrect}%`,
                              bgcolor: getColor(skill.percentCorrect),
                              borderRadius: 1,
                            }}
                          />
                          <Box
                            sx={{
                              position: "absolute",
                              inset: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              px: 1,
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{ color: "white", fontWeight: "medium", textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
                            >
                              {skill.percentCorrect}%
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: "medium" }}>
                              {skill.avgTime}s {getTimeIndicator(skill.avgTime, skill.targetTime)}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ width: 24, textAlign: "center" }}>
                          {skill.questionsAttempted}
                        </Typography>
                      </Box>
                    ))}
                </Stack>
              </TabPanel>

              <TabPanel value={activeTab} index={2}>
                <Stack spacing={1.5}>
                  {skillPerformance
                    .filter((skill) => skill.section === "Reading and Writing")
                    .map((skill, index) => (
                      <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            width: { xs: 100, sm: 130 },
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={skill.skill}
                        >
                          {skill.skill}
                        </Typography>
                        <Box
                          sx={{
                            flexGrow: 1,
                            height: 24,
                            bgcolor: "grey.100",
                            borderRadius: 1,
                            overflow: "hidden",
                            position: "relative",
                          }}
                        >
                          <Box
                            sx={{
                              height: "100%",
                              width: `${skill.percentCorrect}%`,
                              bgcolor: getColor(skill.percentCorrect),
                              borderRadius: 1,
                            }}
                          />
                          <Box
                            sx={{
                              position: "absolute",
                              inset: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              px: 1,
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{ color: "white", fontWeight: "medium", textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
                            >
                              {skill.percentCorrect}%
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: "medium" }}>
                              {skill.avgTime}s {getTimeIndicator(skill.avgTime, skill.targetTime)}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ width: 24, textAlign: "center" }}>
                          {skill.questionsAttempted}
                        </Typography>
                      </Box>
                    ))}
                </Stack>
              </TabPanel>
            </CardContent>
            <Divider />
            <Box sx={{ px: 2, py: 1, display: "flex", alignItems: "center", gap: 1 }}>
              <Info sx={{ fontSize: 14, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary">
                Numbers on right show questions attempted and average time per question.
              </Typography>
            </Box>
          </Card>

          {/* Next Steps - Fixed to ensure they're on the same row 
          <Box sx={{ mb: 4 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h5" fontWeight="bold">
                Next Steps
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Recommended actions based on your diagnostic results
              </Typography>
            </Box>

            {/* Fixed layout for Next Steps cards to ensure they're in one row 
            <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2 }}>
              {/* Activity 1 
              <Box sx={{ flex: 1 }}>
                <BorderLeftCard bordercolor={theme.palette.primary.main}>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <BookOpen sx={{ color: "primary.main" }} />
                      <Typography variant="subtitle1" fontWeight="medium">
                        Review Missed Questions
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                      Understand why you missed these questions and learn from your mistakes
                    </Typography>
                    <Button variant="contained" size="small" fullWidth onClick={handleStartReview} disabled={!testAttemptData}>
                      Start Review
                    </Button>
                  </CardContent>
                </BorderLeftCard>
              </Box>

              {/* Activity 2 - Dynamic lowest scoring skill 
              {hasTestData && skillPerformance.length > 0 ? (
                <Box sx={{ flex: 1 }}>
                  <BorderLeftCard bordercolor={theme.palette.primary.main}>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <Brain sx={{ color: "primary.main" }} />
                        <Typography variant="subtitle1" fontWeight="medium">
                          Practice {skillPerformance[skillPerformance.length - 1]?.skill}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        Focus on your lowest-scoring skill with targeted practice questions
                      </Typography>
                      <Button variant="contained" size="small" fullWidth
                        onClick={handlePracticeLowestSkill}
                      >
                        Start Practice
                      </Button>
                    </CardContent>
                  </BorderLeftCard>
                </Box>
              ) : (
                <Box sx={{ flex: 1 }}>
                  <BorderLeftCard bordercolor={theme.palette.primary.main}>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <Brain sx={{ color: "primary.main" }} />
                        <Typography variant="subtitle1" fontWeight="medium">
                          Practice Core Skills
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        Start with fundamental skills to build a strong foundation
                      </Typography>
                      <Button variant="contained" size="small" fullWidth component={Link} to="/skill-practice">
                        Start Practice
                      </Button>
                    </CardContent>
                  </BorderLeftCard>
                </Box>
              )}

              {/* Activity 3 
              <Box sx={{ flex: 1 }}>
                <BorderLeftCard bordercolor={theme.palette.primary.main}>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <Target sx={{ color: "primary.main" }} />
                      <Typography variant="subtitle1" fontWeight="medium">
                        Get Personalized Study Plan
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                      Create a customized plan based on your results to reach your target score.
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      fullWidth
                      onClick={handleOpenCreatePlanModal}
                    >
                      Create Plan
                    </Button>
                  </CardContent>
                </BorderLeftCard>
              </Box>
            </Box>
          </Box>

          {/* Missed Questions 
          <Box sx={{ mb: 4 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h5" fontWeight="bold">
                Missed Questions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Review these questions to understand your mistakes and improve your performance
              </Typography>
            </Box>

            <Stack spacing={2}>
              {missedQuestions.map((question, index) => (
                <Card key={`missed-question-${question.questionIndex}`}>
                  <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 2,
                        bgcolor: "grey.50",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {isMathSkill(question.skill as SkillName) ? (
                          <BarChart2 sx={{ color: "primary.main" }} />
                        ) : (
                          <BookOpen sx={{ color: "primary.main" }} />
                        )}
                        {/*<Typography variant="subtitle2">{question.section}</Typography>
                        <Typography color="text.secondary">•</Typography>
                        <Typography color="text.secondary">{question.skill}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <StyledChip label={question.difficulty} difficulty={question.difficulty} size="small" />
                        <Box sx={{ display: "flex", alignItems: "center", color: "text.secondary" }}>
                          <Clock sx={{ fontSize: 16, mr: 0.5 }} />
                          <Typography variant="body2">{question.timeSpent}</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Question
                      </Typography>
                      <Paper sx={{ p: 1.5, bgcolor: "grey.50" }}>
                        <Typography variant="body2">{renderLatexOrText(question.questionPreview)}</Typography>
                      </Paper>
                    </Box>

                    {/* Fixed layout for explanation and strategy to be side by side 
                    <Box sx={{ display: "flex", mb: 2, flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            mb: 0.5,
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <HelpCircle sx={{ fontSize: 16, color: "primary.main" }} />
                          Explanation
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {renderLatexOrText(question.explanation)}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" }, mt: 2 }}>
                      <Button
                        variant="contained"
                        sx={{ flex: 1 }}
                        onClick={() => handleReviewSpecificQuestion(question.questionIndex)}
                        disabled={!testAttemptData}
                      >
                        Review This Question
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => handlePracticeSimilarQuestions(question.skill, question.difficulty || 'Medium')}
                        sx={{ flex: 1 }}
                      >
                        Practice Similar Questions
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>

            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Button variant="outlined" onClick={handleViewAllMissed} disabled={!testAttemptData}>
                View All Missed Questions
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
      <CreateStudyPlanModal
        open={isCreatePlanModalOpen}
        onClose={handleCloseCreatePlanModal}
      />
    </ThemeProvider>
  )
}

*/
