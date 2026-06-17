"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface UserContextType {
  name: string | null;
  setName: (name: string) => void;
  clearName: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY = "team-events-username";

export function UserProvider({ children }: { children: ReactNode }) {
  const [name, setNameState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEY);
  });

  const setName = (newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    localStorage.setItem(STORAGE_KEY, trimmed);
    setNameState(trimmed);
  };

  const clearName = () => {
    localStorage.removeItem(STORAGE_KEY);
    setNameState(null);
  };

  return (
    <UserContext.Provider value={{ name, setName, clearName }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
