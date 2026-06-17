"use client";

import { useState } from "react";
import { useUser } from "@/lib/user-context";
import { useAppLock } from "@/lib/use-app-lock";

export default function NameGate() {
  const { setName } = useUser();
  const { status, unlock } = useAppLock();

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [submittingPassword, setSubmittingPassword] = useState(false);

  const [nameValue, setNameValue] = useState("");

  if (status === "checking") {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200"
          style={{ borderTopColor: "var(--accent)" }}
        />
      </div>
    );
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setSubmittingPassword(true);
    setPasswordError("");
    const result = await unlock(password);
    setSubmittingPassword(false);
    if (!result.ok) setPasswordError(result.error || "Mot de passe incorrect.");
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameValue.trim().length < 2) return;
    setName(nameValue);
  };

  const locked = status === "locked";

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent shadow-accent shadow-lg">
            {locked ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 11c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zM12 11v6m6-6V9a6 6 0 10-12 0v2m-1 0h14a1 1 0 011 1v8a1 1 0 01-1 1H5a1 1 0 01-1-1v-8a1 1 0 011-1z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">TeamUp</h1>
          <p className="mt-2 text-sm text-slate-500">
            {locked
              ? "Entrez le mot de passe de l'équipe pour continuer"
              : "Entrez votre prénom pour rejoindre l'équipe"}
          </p>
        </div>

        {locked ? (
          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <input
              autoFocus
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe de l'équipe"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-light"
            />
            {passwordError && (
              <p className="text-xs font-medium text-rose-500">
                {passwordError}
              </p>
            )}
            <button
              type="submit"
              disabled={!password || submittingPassword}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submittingPassword ? "Vérification..." : "Déverrouiller"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleNameSubmit} className="space-y-3">
            <input
              autoFocus
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              placeholder="Votre prénom"
              maxLength={30}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-light"
            />
            <button
              type="submit"
              disabled={nameValue.trim().length < 2}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continuer
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
