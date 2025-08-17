/*Need to create a component that grades the full test and displays the results

import React, { useState, useContext, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Button } from '@mui/material';
import { UserContext, TestAttempt, categories, SkillName } from '../UserAndProfile/UserContext';

const readingWritingTable: {rawScore: number; scaledScore: number}[] = [
    { rawScore: 0, scaledScore: 200 },
    { rawScore: 1, scaledScore: 200 },
    { rawScore: 2, scaledScore: 200 },
    { rawScore: 3, scaledScore: 200 },
    { rawScore: 4, scaledScore: 200 },
    { rawScore: 5, scaledScore: 210 },
    { rawScore: 6, scaledScore: 220 },
    { rawScore: 7, scaledScore: 230 },
    { rawScore: 8, scaledScore: 240 },
    { rawScore: 9, scaledScore: 250 },
    { rawScore: 10, scaledScore: 260 },
    { rawScore: 11, scaledScore: 280 },
    { rawScore: 12, scaledScore: 300 },
    { rawScore: 13, scaledScore: 330 },
    { rawScore: 14, scaledScore: 350 },
    { rawScore: 15, scaledScore: 360 },
    { rawScore: 16, scaledScore: 380 },
    { rawScore: 17, scaledScore: 380 },
    { rawScore: 18, scaledScore: 390 },
    { rawScore: 19, scaledScore: 410 },
    { rawScore: 20, scaledScore: 420 },
    { rawScore: 21, scaledScore: 420 },
    { rawScore: 22, scaledScore: 430 },
    { rawScore: 23, scaledScore: 440 },
    { rawScore: 24, scaledScore: 460 },
    { rawScore: 25, scaledScore: 470 },
    { rawScore: 26, scaledScore: 470 },
    { rawScore: 27, scaledScore: 480 },
    { rawScore: 28, scaledScore: 490 },
    { rawScore: 29, scaledScore: 500 },
    { rawScore: 30, scaledScore: 510 },
    { rawScore: 31, scaledScore: 520 },
    { rawScore: 32, scaledScore: 530 },
    { rawScore: 33, scaledScore: 550 },
    { rawScore: 34, scaledScore: 550 },
    { rawScore: 35, scaledScore: 560 },
    { rawScore: 36, scaledScore: 570 },
    { rawScore: 37, scaledScore: 580 },
    { rawScore: 38, scaledScore: 600 },
    { rawScore: 39, scaledScore: 600 },
    { rawScore: 40, scaledScore: 610 },
    { rawScore: 41, scaledScore: 620 },
    { rawScore: 42, scaledScore: 630 },
    { rawScore: 43, scaledScore: 650 },
    { rawScore: 44, scaledScore: 660 },
    { rawScore: 45, scaledScore: 670 },
    { rawScore: 46, scaledScore: 700 },
    { rawScore: 47, scaledScore: 710 },
    { rawScore: 48, scaledScore: 720 },
    { rawScore: 49, scaledScore: 730 },
    { rawScore: 50, scaledScore: 740 },
    { rawScore: 51, scaledScore: 770 },
    { rawScore: 52, scaledScore: 780 },
    { rawScore: 53, scaledScore: 790 },
    { rawScore: 54, scaledScore: 800 }
  ];


  const mathTable: {rawScore: number; scaledScore: number}[] = [
    { rawScore: 0, scaledScore: 200 },
    { rawScore: 1, scaledScore: 200 },
    { rawScore: 2, scaledScore: 200 },
    { rawScore: 3, scaledScore: 200 },
    { rawScore: 4, scaledScore: 210 },
    { rawScore: 5, scaledScore: 210 },
    { rawScore: 6, scaledScore: 220 },
    { rawScore: 7, scaledScore: 240 },
    { rawScore: 8, scaledScore: 280 },
    { rawScore: 9, scaledScore: 300 },
    { rawScore: 10, scaledScore: 310 },
    { rawScore: 11, scaledScore: 330 },
    { rawScore: 12, scaledScore: 340 },
    { rawScore: 13, scaledScore: 350 },
    { rawScore: 14, scaledScore: 350 },
    { rawScore: 15, scaledScore: 370 },
    { rawScore: 16, scaledScore: 380 },
    { rawScore: 17, scaledScore: 390 },
    { rawScore: 18, scaledScore: 390 },
    { rawScore: 19, scaledScore: 410 },
    { rawScore: 20, scaledScore: 420 },
    { rawScore: 21, scaledScore: 440 },
    { rawScore: 22, scaledScore: 450 },
    { rawScore: 23, scaledScore: 460 },
    { rawScore: 24, scaledScore: 480 },
    { rawScore: 25, scaledScore: 500 },
    { rawScore: 26, scaledScore: 510 },
    { rawScore: 27, scaledScore: 520 },
    { rawScore: 28, scaledScore: 540 },
    { rawScore: 29, scaledScore: 560 },
    { rawScore: 30, scaledScore: 570 },
    { rawScore: 31, scaledScore: 580 },
    { rawScore: 32, scaledScore: 590 },
    { rawScore: 33, scaledScore: 610 },
    { rawScore: 34, scaledScore: 630 },
    { rawScore: 35, scaledScore: 640 },
    { rawScore: 36, scaledScore: 660 },
    { rawScore: 37, scaledScore: 700 },
    { rawScore: 38, scaledScore: 720 },
    { rawScore: 39, scaledScore: 740 },
    { rawScore: 40, scaledScore: 750 },
    { rawScore: 41, scaledScore: 780 },
    { rawScore: 42, scaledScore: 790 },
    { rawScore: 43, scaledScore: 790 },
    { rawScore: 44, scaledScore: 800 }
];

// Get Max Raw Scores from tables
const maxRwRawScore = readingWritingTable[readingWritingTable.length - 1].rawScore;
const maxMathRawScore = mathTable[mathTable.length - 1].rawScore;

// Helper: Round to nearest 10
const roundToNearest10 = (score: number): number => {
    return Math.round(score / 10) * 10;
};

// Helper: Convert Raw R/W score to Scaled Score (handles bounds)
const convertRawReadingWritingToScaledScore = (rawScore: number): number => {
    // Ensure rawScore is within bounds [0, maxRwRawScore]
    const boundedRawScore = Math.max(0, Math.min(Math.round(rawScore), maxRwRawScore));
    const match = readingWritingTable.find(row => row.rawScore === boundedRawScore);
    return match ? match.scaledScore : 200; // Fallback to min score
};

// Helper: Convert Raw Math score to Scaled Score (handles bounds)
const convertRawMathToScaledScore = (rawScore: number): number => {
    // Ensure rawScore is within bounds [0, maxMathRawScore]
    const boundedRawScore = Math.max(0, Math.min(Math.round(rawScore), maxMathRawScore));
    const match = mathTable.find(row => row.rawScore === boundedRawScore);
    return match ? match.scaledScore : 200; // Fallback to min score
};

// Helper function to check if a skill belongs to Reading/Writing
const isReadingWritingSkill = (skill: SkillName): boolean => {
    // Type assertion needed because categories values are readonly arrays
    return (categories["Reading and Writing"] as readonly SkillName[]).includes(skill);
};

// Helper function to check if a skill belongs to Math
const isMathSkill = (skill: SkillName): boolean => {
    // Type assertion needed because categories values are readonly arrays
    return (categories["Math"] as readonly SkillName[]).includes(skill);
};

export function GradeFullTest(testAttempt: TestAttempt) {
    // If no test is provided or invalid type, return default values
    if (!testAttempt || testAttempt.testType !== 'full' || !testAttempt.sections || testAttempt.sections.length < 4) {
        console.warn("GradeFullTest called with invalid or non-full test attempt:", testAttempt);
        return { readingWritingScore: 200, mathScore: 200, totalScore: 400 };
    }

    // Calculate Reading/Writing raw score (sections 0 and 1)
    const rawReadingWritingScore = testAttempt.sections
        .slice(0, 2) // Get first two sections
        .flatMap(section => section.questions) // Combine all questions
        .reduce((count, question) => count + (question.isCorrect ? 1 : 0), 0);

    // Calculate Math raw score (sections 2 and 3)
    const rawMathScore = testAttempt.sections
        .slice(2, 4) // Get last two sections
        .flatMap(section => section.questions)
        .reduce((count, question) => count + (question.isCorrect ? 1 : 0), 0);

    // Convert using helper functions
    const readingWritingScore = convertRawReadingWritingToScaledScore(rawReadingWritingScore);
    const mathScore = convertRawMathToScaledScore(rawMathScore);

    // Round final scores for Full Test as well
    const finalRwScore = roundToNearest10(readingWritingScore);
    const finalMathScore = roundToNearest10(mathScore);

    return {
        readingWritingScore: finalRwScore,
        mathScore: finalMathScore,
        totalScore: finalRwScore + finalMathScore // Sum of rounded scores
    };
}

// --- NEW FUNCTION: GradeDiagnosticTest ---

export function GradeDiagnosticTest(testAttempt: TestAttempt) {

    // If no test attempt is provided, or invalid type return default zero scores
    if (!testAttempt || testAttempt.testType !== 'diagnostic' || !testAttempt.sections || testAttempt.sections.length === 0 || testAttempt.sections[0].questions.length === 0) {
        console.warn("GradeDiagnosticTest called with invalid, non-diagnostic, or empty test attempt:", testAttempt);
        return {
            readingWritingScore: 200, mathScore: 200, totalScore: 400,
            diagnosticReadingWritingScores: { lower: 200, upper: 200 },
            diagnosticMathScores: { lower: 200, upper: 200 },
            diagnosticTotalScores: { lower: 400, upper: 400 }
        };
    }

    const diagnosticSection = testAttempt.sections[0];
    let rawRwDiag = 0;
    let rawMathDiag = 0;
    let numRwDiag = 0;
    let numMathDiag = 0;

    // Calculate diagnostic raw scores and counts
    diagnosticSection.questions.forEach(question => {
        const skill = question.skill as SkillName;
        if (isReadingWritingSkill(skill)) {
            numRwDiag++;
            if (question.isCorrect) rawRwDiag++;
        } else if (isMathSkill(skill)) {
            numMathDiag++;
            if (question.isCorrect) rawMathDiag++;
        } else {
            console.warn(`Question skill "${skill}" not found in categories.`);
            // Decide how to handle uncategorized questions (ignore? count somewhere?)
            // For now, they are ignored in score calculation.
        }
    });

    // Avoid division by zero if a category has no questions
    if (numRwDiag === 0 || numMathDiag === 0) {
         console.warn("Diagnostic test missing questions for R/W or Math category. Returning zero scores.");
         // Return zero scores or handle as appropriate
         return {
            readingWritingScore: 200, mathScore: 200, totalScore: 400,
            diagnosticReadingWritingScores: { lower: 200, upper: 200 },
            diagnosticMathScores: { lower: 200, upper: 200 },
            diagnosticTotalScores: { lower: 400, upper: 400 }
         };
    }


    // --- Calculate Central Estimated Score ---
    const estimatedFullRwRaw = (rawRwDiag / numRwDiag) * maxRwRawScore;
    const estimatedFullMathRaw = (rawMathDiag / numMathDiag) * maxMathRawScore;

    const centralRwScaled = convertRawReadingWritingToScaledScore(estimatedFullRwRaw);
    const centralMathScaled = convertRawMathToScaledScore(estimatedFullMathRaw);

    // Round the central scores
    const finalReadingWritingScore = roundToNearest10(centralRwScaled);
    const finalMathScore = roundToNearest10(centralMathScaled);
    const finalTotalScore = finalReadingWritingScore + finalMathScore; // Sum of rounded


    // --- Calculate Score Ranges ---
    // Define uncertainty in terms of *full test* raw score points
    const k_full = 4
; // e.g., +/- 4 raw points uncertainty on the extrapolated full score

    // Calculate adjusted *extrapolated* raw scores (clamped between 0 and maxRawScore)
    const lowerExtrapolatedRwRaw = Math.max(0, estimatedFullRwRaw - k_full);
    const upperExtrapolatedRwRaw = Math.min(maxRwRawScore, estimatedFullRwRaw + k_full);
    const lowerExtrapolatedMathRaw = Math.max(0, estimatedFullMathRaw - k_full);
    const upperExtrapolatedMathRaw = Math.min(maxMathRawScore, estimatedFullMathRaw + k_full);

    // Convert these adjusted extrapolated scores
    const rwLowerScaled = convertRawReadingWritingToScaledScore(lowerExtrapolatedRwRaw);
    const rwUpperScaled = convertRawReadingWritingToScaledScore(upperExtrapolatedRwRaw);
    const mathLowerScaled = convertRawMathToScaledScore(lowerExtrapolatedMathRaw);
    const mathUpperScaled = convertRawMathToScaledScore(upperExtrapolatedMathRaw);

    // Round the range bounds
    const finalRwLower = roundToNearest10(rwLowerScaled);
    const finalRwUpper = roundToNearest10(rwUpperScaled);
    const finalMathLower = roundToNearest10(mathLowerScaled);
    const finalMathUpper = roundToNearest10(mathUpperScaled);

    // Ensure lower <= upper after rounding
    const finalRwRange = { lower: Math.min(finalRwLower, finalRwUpper), upper: Math.max(finalRwLower, finalRwUpper) };
    const finalMathRange = { lower: Math.min(finalMathLower, finalMathUpper), upper: Math.max(finalMathLower, finalMathUpper) };

    // Calculate total range by summing rounded bounds
    const totalLower = finalRwRange.lower + finalMathRange.lower;
    const totalUpper = finalRwRange.upper + finalMathRange.upper;
    const finalTotalRange = { lower: totalLower, upper: totalUpper };


    return {
        readingWritingScore: finalReadingWritingScore,
        mathScore: finalMathScore,
        totalScore: finalTotalScore,
        diagnosticReadingWritingScores: finalRwRange,
        diagnosticMathScores: finalMathRange,
        diagnosticTotalScores: finalTotalRange
    };
}

*/