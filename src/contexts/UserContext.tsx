"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, User } from "firebase/auth";
import { auth, db, googleProvider } from "@/lib/firebase";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import type { UserProfile } from "@/types/models";
import { calculateUserLevel, calculateXPForNextLevel, calculateUserRank } from "@/lib/userStats";

interface UserContextValue {
  firebaseUser: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const Ctx = createContext<UserContextValue | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setFirebaseUser(u);
      if (!u) {
        setProfile(null);
        setLoading(false);
        return;
      }
      const ref = doc(db, "users", u.uid);
      const snap = await getDoc(ref);
      const now = Date.now();
      if (!snap.exists()) {
        const newProfile: UserProfile = {
          uid: u.uid,
          email: (u.email || "").toLowerCase(),
          displayName: u.displayName || null,
          role: null,
          districtId: null,
          schoolId: null,
          classroomIds: [],
          createdAt: now,
          lastLoginAt: now,
          
          // Gamification defaults
          level: 1,
          xp: 0,
          totalPoints: 0,
          currentStreak: 0,
          longestStreak: 0,
          
          // Personalization defaults
          selectedAvatar: "🦊", // Default fox avatar
          selectedTheme: "cosmic", // Default theme
          unlockedAvatars: ["🦊"], // Start with fox unlocked
          unlockedThemes: ["cosmic"], // Start with cosmic theme
          
          // Achievement defaults
          achievements: [],
          achievementProgress: {},
          
          // Practice stats defaults
          questionsCompleted: 0,
          totalTimeSpentMs: 0,
          averageScore: 0,
          lastPracticeDate: null,
        };
        await setDoc(ref, newProfile);
        setProfile(newProfile);
      } else {
        const data = snap.data() as Partial<UserProfile>;
        const normalized: UserProfile = {
          uid: u.uid,
          email: (data.email || u.email || "").toLowerCase(),
          displayName: (data.displayName ?? u.displayName) ?? null,
          role: (data.role ?? null) as UserProfile["role"],
          districtId: (data.districtId ?? null) as string | null,
          schoolId: (data.schoolId ?? null) as string | null,
          classroomIds: Array.isArray(data.classroomIds) ? (data.classroomIds as string[]) : [],
          createdAt: (typeof data.createdAt === "number" ? data.createdAt : now),
          lastLoginAt: now,
          
          // Gamification data for Dashboard 2.0
          level: (data.level ?? 1) as number, // User's current level (starts at 1)
          xp: (data.xp ?? 0) as number, // Current experience points
          totalPoints: (data.totalPoints ?? 0) as number, // Total points earned (for rewards store)
          currentStreak: (data.currentStreak ?? 0) as number, // Days of consecutive practice
          longestStreak: (data.longestStreak ?? 0) as number, // Best streak ever achieved
          
          // Personalization
          selectedAvatar: (data.selectedAvatar ?? "🦊") as string, // Emoji avatar like "🦊"
          selectedTheme: (data.selectedTheme ?? "cosmic") as "cosmic" | "ocean" | "forest" | "sunset", // Theme preference
          unlockedAvatars: Array.isArray(data.unlockedAvatars) ? (data.unlockedAvatars as string[]) : [], // Array of unlocked avatar emojis
          unlockedThemes: Array.isArray(data.unlockedThemes) ? (data.unlockedThemes as string[]) : [], // Array of unlocked theme names
          
          // Achievements
          achievements: Array.isArray(data.achievements) ? (data.achievements as string[]) : [], // Array of achievement names
          achievementProgress: (data.achievementProgress ?? {}) as Record<string, number>, // Progress toward achievements
          
          // Practice stats (calculated from Attempts)
          questionsCompleted: (data.questionsCompleted ?? 0) as number, // Total questions answered
          totalTimeSpentMs: (data.totalTimeSpentMs ?? 0) as number, // Total practice time in milliseconds
          averageScore: (data.averageScore ?? 0) as number, // Average percentage score (0-100)
          lastPracticeDate: (data.lastPracticeDate ?? null) as number | null, // Last time user practiced (epoch ms)
        };
        setProfile(normalized);
        try { await updateDoc(ref, { lastLoginAt: serverTimestamp() }); } catch {}
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const signOutUser = async () => {
    await signOut(auth);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!firebaseUser) return;
    const ref = doc(db, "users", firebaseUser.uid);
    const sanitized = Object.fromEntries(
      Object.entries(updates).map(([k, v]) => [k, v === undefined ? null : v])
    );
    await updateDoc(ref, sanitized as any);
    setProfile((prev: UserProfile | null) => (prev ? { ...prev, ...(sanitized as any) } : prev));
  };

  const updateUserStats = async (updates: {
    xpGained?: number;
    pointsGained?: number;
    questionsCompleted?: number;
    timeSpentMs?: number;
    newAchievements?: string[];
  }) => {
    if (!firebaseUser || !profile) return;
    
    const newXP = (profile.xp || 0) + (updates.xpGained || 0);
    const newLevel = calculateUserLevel(newXP);
    
    const profileUpdates: Partial<UserProfile> = {
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

  const value = useMemo<UserContextValue>(
    () => ({ firebaseUser, profile, loading, signInWithGoogle, signOutUser, updateProfile }),
    [firebaseUser, profile, loading]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useUser = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}; 