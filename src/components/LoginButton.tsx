"use client";

import React from "react";
import { useUser } from "@/contexts/UserContext";

export const LoginButton: React.FC = () => {
  const { firebaseUser, profile, loading, signInWithGoogle, signOutUser } = useUser();

  if (loading) return <div className="text-sm text-gray-500">Loading…</div>;

  if (!firebaseUser) {
    return (
      <button
        onClick={signInWithGoogle}
        className="px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm"
      >
        Sign in with Google
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-700">{profile?.email}</span>
      <button
        onClick={signOutUser}
        className="px-2 py-1 rounded-md border text-sm hover:bg-gray-50"
      >
        Sign out
      </button>
    </div>
  );
}; 