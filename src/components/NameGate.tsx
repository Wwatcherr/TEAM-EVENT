"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/lib/user-context";
import { LockStatus } from "@/lib/use-app-lock";
import { supabase, MemberRow, normalizeName } from "@/lib/supabase";

export default function NameGate({
  status,
  unlock,
}: {
  status: LockStatus;
  unlock: (password: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const { setName } = useUser();

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [submittingPassword, setSubmittingPassword] = useState(false);

  const [members, setMembers] = useState<MemberRow[]>([]);
  const [membersLoaded, setMembersLoaded] = useState(false);
  const [selected, setSelected] = useState("");
  const [customName, setCustomName] = useState("");
  const [joining, setJoining] = useState(false);

  const locked = status === "locked";

  useEffect(() => {
    if (locked) return;
    supabase
      .from("members")
      .select("*")
      .order("name", { ascending: true })
      .then(({ data }) => {
        if (data) setMembers(data);
        setMembersLoaded(true);
      });
  }, [locked]);

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

  const isCustom = selected === "__other__";
  const finalName = isCustom ? customName.trim() : selected;
  const canContinue = finalName.length >= 2;

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canContinue || joining) return;
    setJoining(true);

    if (isCustom) {
      // Nouveau membre : on l'ajoute à la liste si son nom (normalisé)
      // n'existe pas déjà, pour éviter les doublons style "Enzo" / "enzo".
      const alreadyExists = members.some(
        (m) => normalizeName(m.name) === normalizeName(finalName)
      );
      if (!alreadyExists) {
        await supabase.from("members").insert({ name: finalName });
      }
    }

    setJoining(false);
    setName(finalName);
  };

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
              : "Sélectionnez votre prénom pour rejoindre l'équipe"}
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
        ) : !membersLoaded ? (
          <div className="flex justify-center py-6">
            <div
              className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200"
              style={{ borderTopColor: "var(--accent)" }}
            />
          </div>
        ) : (
          <form onSubmit={handleNameSubmit} className="space-y-3">
            <select
              autoFocus
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-light"
            >
              <option value="" disabled>
                Choisissez votre prénom
              </option>
              {members.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name}
                </option>
              ))}
              <option value="__other__">Autre / nouveau membre</option>
            </select>

            {isCustom && (
              <input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Votre prénom"
                maxLength={30}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-light"
              />
            )}

            <button
              type="submit"
              disabled={!canContinue || joining}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {joining ? "Connexion..." : "Continuer"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
