"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, User } from "firebase/auth";
import { auth, db, googleProvider } from "@/lib/firebase";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import type { UserProfile } from "@/types/models";

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