"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAssessment } from "@/contexts/AssessmentContext";
import { useUser } from "@/contexts/UserContext";
import { 
  BookOpen, PenTool, FileText, Target, Clock, TrendingUp, Award, Users, 
  Crown, Star, Flame, Trophy, ChevronRight, Settings, Camera, Palette,
  BarChart3, PieChart, Activity, Zap, Gift, Heart, Shield, Sparkles
} from "lucide-react";
import { calculateUserLevel, calculateXPForNextLevel } from "@/lib/userStats";

export default function GamifiedDashboard() {
  const { selection } = useAssessment();
  const { profile, updateProfile } = useUser();
  const [selectedAvatar, setSelectedAvatar] = useState("🦊");
  const [selectedTheme, setSelectedTheme] = useState<keyof typeof themes>("cosmic");

  const userData = {
    name: profile?.displayName || "Student",
    level: profile?.level || 1,
    xp: profile?.xp || 0,
    xpToNext: calculateXPForNextLevel(profile?.xp || 0),
    streak: profile?.currentStreak || 0,
    totalPoints: profile?.totalPoints || 0,
    rank: 1, // Calculate from leaderboard
    classSize: 28, // Get from classroom data
    achievements: profile?.achievements || ["Speed Reader", "Grammar Master", "Essay Expert", "Streak Champion"]
  };

  const themes = {
    cosmic: { primary: "from-purple-500 to-pink-500", bg: "from-purple-50 to-pink-50", accent: "purple" },
    ocean: { primary: "from-blue-500 to-cyan-500", bg: "from-blue-50 to-cyan-50", accent: "blue" },
    forest: { primary: "from-green-500 to-emerald-500", bg: "from-green-50 to-emerald-50", accent: "green" },
    sunset: { primary: "from-orange-500 to-red-500", bg: "from-orange-50 to-red-50", accent: "orange" }
  } as const;

  const avatarOptions = ["🦊", "🐨", "🦝", "🐸", "🦄", "🐙", "🦋", "🐲"];
  const currentTheme = themes[selectedTheme];

  const practiceTypes = [
    {
      id: "practice-test",
      title: "Practice Test",
      description: "Full EOC simulation",
      icon: Target,
      progress: 68,
      bestScore: "87%",
      lastAttempt: "2 hours ago",
      xpReward: 50
    },
    {
      id: "grammar-practice",
      title: "Grammar Mastery",
      description: "Rules & structure",
      icon: PenTool,
      progress: 85,
      bestScore: "94%",
      lastAttempt: "Yesterday",
      xpReward: 25
    },
    {
      id: "reading-comprehension",
      title: "Reading Analysis",
      description: "Literature & texts",
      icon: BookOpen,
      progress: 72,
      bestScore: "91%",
      lastAttempt: "3 days ago",
      xpReward: 35
    },
    {
      id: "essay-practice",
      title: "Essay Writing",
      description: "Creative expression",
      icon: FileText,
      progress: 45,
      bestScore: "78%",
      lastAttempt: "1 week ago",
      xpReward: 40
    }
  ];

  const leaderboard = [
    { rank: 1, name: "Alex Rodriguez", avatar: "🦄", points: 18650, streak: 12 },
    { rank: 2, name: "Emma Thompson", avatar: "🦋", points: 16890, streak: 9 },
    { rank: 3, name: "Sarah Chen", avatar: "🦊", points: 15420, streak: 8, isUser: true },
    { rank: 4, name: "Marcus Johnson", avatar: "🐲", points: 14750, streak: 6 },
    { rank: 5, name: "Lily Zhang", avatar: "🐙", points: 13980, streak: 15 }
  ];

  const weeklyData = [
    { day: "Mon", score: 75, time: 45 },
    { day: "Tue", score: 82, time: 38 },
    { day: "Wed", score: 78, time: 52 },
    { day: "Thu", score: 88, time: 41 },
    { day: "Fri", score: 85, time: 47 },
    { day: "Sat", score: 91, time: 35 },
    { day: "Sun", score: 87, time: 42 }
  ];

  const skillBreakdown = [
    { skill: "Grammar", score: 94, color: "bg-green-500" },
    { skill: "Reading", score: 87, color: "bg-blue-500" },
    { skill: "Writing", score: 78, color: "bg-purple-500" },
    { skill: "Analysis", score: 82, color: "bg-orange-500" }
  ];

  const rewards = [
    { item: "Galaxy Avatar", cost: 500, type: "avatar", icon: "🌌", unlocked: true },
    { item: "Neon Theme", cost: 750, type: "theme", icon: "✨", unlocked: false },
    { item: "Crown Badge", cost: 300, type: "badge", icon: "👑", unlocked: true },
    { item: "Rainbow Trail", cost: 1000, type: "effect", icon: "🌈", unlocked: false }
  ];

  const updateUserStats = async (updates: {
    xpGained?: number;
    pointsGained?: number;
    questionsCompleted?: number;
    timeSpentMs?: number;
    newAchievements?: string[];
  }) => {
    if (!profile) return;
    
    const newXP = (profile.xp || 0) + (updates.xpGained || 0);
    const newLevel = calculateUserLevel(newXP);
    
    const profileUpdates: Partial<any> = { // Assuming UserProfile type is not directly available here, using 'any' for now
      xp: newXP,
      level: newLevel,
      totalPoints: (profile.totalPoints || 0) + (updates.pointsGained || 0),
      questionsCompleted: (profile.questionsCompleted || 0) + (updates.questionsCompleted || 0),
      totalTimeSpentMs: (profile.totalTimeSpentMs || 0) + (updates.timeSpentMs || 0),
      lastPracticeDate: Date.now(),
      ...(updates.newAchievements && {
        achievements: [...(profile.achievements || []), ...updates.newAchievements]
      })
    };
    
    await updateProfile(profileUpdates);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentTheme.bg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* User Profile Header */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border mb-8 overflow-hidden relative">
          <div className={`absolute inset-0 bg-gradient-to-r ${currentTheme.primary} opacity-10`}></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-4xl border-4 border-white shadow-lg">
                  {selectedAvatar}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-r ${currentTheme.primary} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                  {userData.level}
                </div>
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{userData.name}</h1>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="font-semibold text-orange-600">{userData.streak} day streak</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    <span className="font-semibold text-yellow-600">Rank #{userData.rank}</span>
                  </div>
                </div>
                
                {/* XP Progress Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>{userData.xp} XP</span>
                    <span>{userData.xpToNext} XP to Level {userData.level + 1}</span>
                  </div>
                  <div className="w-64 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${currentTheme.primary} transition-all duration-500`}
                      style={{ width: `${(userData.xp / userData.xpToNext) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-2xl font-bold text-gray-900">{userData.totalPoints.toLocaleString()}</span>
                <span className="text-gray-600">points</span>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                <Settings className="w-4 h-4" />
                <span className="text-sm font-medium">Customize</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Left Column - Practice & Stats */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Practice Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {practiceTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <Link key={type.id} href={`/practice/${type.id}`} className="group block">
                    <div className="bg-white rounded-2xl p-6 shadow-lg border hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${currentTheme.primary} shadow-lg`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Best Score</div>
                          <div className="font-bold text-green-600">{type.bestScore}</div>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{type.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{type.description}</p>
                      
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{type.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full">
                          <div 
                            className={`h-full bg-gradient-to-r ${currentTheme.primary} rounded-full transition-all duration-500`}
                            style={{ width: `${type.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{type.lastAttempt}</span>
                        <div className="flex items-center gap-1 text-yellow-600">
                          <Zap className="w-4 h-4" />
                          <span className="font-semibold">+{type.xpReward} XP</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Weekly Performance Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Weekly Performance</h2>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-600">Last 7 days</span>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {weeklyData.map((day, index) => (
                  <div key={day.day} className="text-center">
                    <div className="text-xs text-gray-600 mb-2">{day.day}</div>
                    <div className="relative h-24 bg-gray-100 rounded-lg overflow-hidden">
                      <div 
                        className={`absolute bottom-0 w-full bg-gradient-to-t ${currentTheme.primary} transition-all duration-500`}
                        style={{ height: `${day.score}%` }}
                      ></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-semibold text-gray-700">{day.score}%</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{day.time}m</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skill Breakdown */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Skill Mastery</h2>
              <div className="space-y-4">
                {skillBreakdown.map((skill) => (
                  <div key={skill.skill}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900">{skill.skill}</span>
                      <span className="font-bold text-gray-700">{skill.score}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${skill.color} transition-all duration-500`}
                        style={{ width: `${skill.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Social & Rewards */}
          <div className="space-y-8">
            
            {/* Class Leaderboard */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Class Leaderboard</h2>
                <Trophy className="w-6 h-6 text-yellow-500" />
              </div>
              
              <div className="space-y-3">
                {leaderboard.map((student) => (
                  <div key={student.rank} className={`flex items-center gap-3 p-3 rounded-xl ${student.isUser ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200' : 'bg-gray-50'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      student.rank === 1 ? 'bg-yellow-500' : 
                      student.rank === 2 ? 'bg-gray-400' : 
                      student.rank === 3 ? 'bg-orange-600' : 'bg-gray-300'
                    }`}>
                      {student.rank}
                    </div>
                    <div className="text-2xl">{student.avatar}</div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{student.name}</div>
                      <div className="text-xs text-gray-600">{student.points.toLocaleString()} pts</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-semibold">{student.streak}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Achievements</h2>
              <div className="space-y-3">
                {userData.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{achievement}</div>
                      <div className="text-xs text-gray-600">Unlocked recently</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reward Store */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Reward Store</h2>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="font-bold text-gray-900">{userData.totalPoints}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                {rewards.map((reward, index) => (
                  <div key={index} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                    reward.unlocked 
                      ? 'bg-green-50 border-green-200' 
                      : userData.totalPoints >= reward.cost 
                        ? 'bg-blue-50 border-blue-200 hover:bg-blue-100 cursor-pointer' 
                        : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}>
                    <div className="text-2xl">{reward.icon}</div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{reward.item}</div>
                      <div className="text-xs text-gray-600">{reward.type}</div>
                    </div>
                    <div className="text-right">
                      {reward.unlocked ? (
                        <span className="text-green-600 font-semibold text-sm">Owned</span>
                      ) : (
                        <div>
                          <div className="font-bold text-gray-900">{reward.cost}</div>
                          <div className="text-xs text-gray-600">points</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 