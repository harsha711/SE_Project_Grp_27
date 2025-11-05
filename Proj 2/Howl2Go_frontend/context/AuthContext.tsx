"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getUserProfile, logout as logoutUtil } from "@/lib/auth";
import type { UserProfile } from "@/types/user";

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: UserProfile) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile on mount
  useEffect(() => {
    async function loadUser() {
      try {
        const profile = await getUserProfile();
        setUser(profile);
      } catch (error) {
        console.error("Failed to load user:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = (userData: UserProfile) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    logoutUtil();
  };

  const refreshUser = async () => {
    try {
      const profile = await getUserProfile();
      setUser(profile);
    } catch (error) {
      console.error("Failed to refresh user:", error);
      setUser(null);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
