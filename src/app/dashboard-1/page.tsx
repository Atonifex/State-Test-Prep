"use client";

import React from "react";
import Link from "next/link";
import { useAssessment } from "@/contexts/AssessmentContext";
import { BookOpen, PenTool, FileText, Target, Clock, TrendingUp, Award, Users } from "lucide-react";

export default function EnglishIIDashboard() {
  const { selection, setSelection } = useAssessment();

  const practiceTypes = [
    {
      id: "practice-test",
      title: "Practice Test",
      description: "Full-length practice tests with real EOC questions",
      icon: Target,
      color: "from-blue-500 to-blue-600",
      hoverColor: "hover:from-blue-600 hover:to-blue-700",
      bgAccent: "bg-blue-50",
      textColor: "text-blue-700",
      stats: "35 Questions • 90 min",
      difficulty: "Mixed Difficulty"
    },
    {
      id: "grammar-practice",
      title: "Grammar Practice",
      description: "Master grammar rules, punctuation, and sentence structure",
      icon: PenTool,
      color: "from-green-500 to-green-600",
      hoverColor: "hover:from-green-600 hover:to-green-700",
      bgAccent: "bg-green-50",
      textColor: "text-green-700",
      stats: "15+ Topics • Adaptive",
      difficulty: "Easy to Hard"
    },
    {
      id: "reading-comprehension",
      title: "Reading Comprehension",
      description: "Analyze literature, poetry, and informational texts",
      icon: BookOpen,
      color: "from-purple-500 to-purple-600",
      hoverColor: "hover:from-purple-600 hover:to-purple-700",
      bgAccent: "bg-purple-50",
      textColor: "text-purple-700",
      stats: "20+ Passages • Various Genres",
      difficulty: "Progressive"
    },
    {
      id: "essay-practice",
      title: "Essay Practice",
      description: "Develop writing skills with guided prompts and feedback",
      icon: FileText,
      color: "from-orange-500 to-orange-600",
      hoverColor: "hover:from-orange-600 hover:to-orange-700",
      bgAccent: "bg-orange-50",
      textColor: "text-orange-700",
      stats: "10+ Prompts • 500 words",
      difficulty: "Scaffolded"
    }
  ];

  const quickStats = [
    { label: "Questions Completed", value: "247", icon: Target, color: "text-blue-600" },
    { label: "Time Practiced", value: "12.5h", icon: Clock, color: "text-green-600" },
    { label: "Avg. Score", value: "78%", icon: TrendingUp, color: "text-purple-600" },
    { label: "Streak", value: "5 days", icon: Award, color: "text-orange-600" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border mb-4">
            <span className="text-sm text-gray-600">
              {selection.state} • {selection.testId} • {selection.subject}
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            English II <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">EOC Prep</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Master the South Carolina English II End-of-Course exam with targeted practice and real-time feedback
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Practice Types Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {practiceTypes.map((type, index) => {
            const Icon = type.icon;
            return (
              <Link
                key={type.id}
                href={`/practice/${encodeURIComponent(type.id)}`}
                onClick={() => setSelection({ standardId: type.id })}
                className="group block"
              >
                <div className="relative bg-white rounded-2xl p-8 shadow-lg border hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${type.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      <div className={`p-4 rounded-2xl bg-gradient-to-br ${type.color} shadow-lg`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${type.bgAccent} ${type.textColor}`}>
                          {type.difficulty}
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-gray-700 transition-colors">
                      {type.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {type.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Users className="w-4 h-4" />
                        {type.stats}
                      </div>
                      <div className={`flex items-center gap-2 text-sm font-medium ${type.textColor} group-hover:translate-x-1 transition-transform`}>
                        Start Practice
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Decorative Elements */}
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-xl"></div>
                  <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-tr from-white/10 to-transparent rounded-full blur-2xl"></div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
            <Link href="/progress" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              View All →
            </Link>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Completed Practice Test #3</p>
                <p className="text-sm text-gray-600">Score: 82% • 2 hours ago</p>
              </div>
              <div className="text-green-600 font-medium">+15 pts</div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Reading Comprehension Session</p>
                <p className="text-sm text-gray-600">15 questions • Yesterday</p>
              </div>
              <div className="text-blue-600 font-medium">+8 pts</div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <PenTool className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Grammar Practice - Punctuation</p>
                <p className="text-sm text-gray-600">Perfect score! • 2 days ago</p>
              </div>
              <div className="text-purple-600 font-medium">+12 pts</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 