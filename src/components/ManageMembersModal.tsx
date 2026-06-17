"use client";

import { useEffect, useState } from "react";
import { supabase, MemberRow, normalizeName } from "@/lib/supabase";

export default function ManageMembersModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchMembers = async () => {
    const { data } = await supabase
      .from("members")
      .select("*")
      .order("name", { ascending: true });
    if (data) setMembers(data);
    setLoading(false);
  };

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchMembers();
  }, [open]);

  if (!open) return null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (trimmed.length < 2) return;

    const exists = members.some(
      (m) => normalizeName(m.name) === normalizeName(trimmed)
    );
    if (exists) {
      setError("Ce prénom est déjà dans la liste.");
      return;
    }

    setSubmitting(true);
    setError("");
    const { error: insertError } = await supabase
      .from("members")
      .insert({ name: trimmed });
    setSubmitting(false);

    if (insertError) {
      setError("Erreur lors de l'ajout. Réessayez.");
      return;
    }

    setNewName("");
    fetchMembers();
  };

  const handleRemove = async (member: MemberRow) => {
    if (!confirm(`Retirer ${member.name} de la liste de l'équipe ?`)) return;
    await supabase.from("members").delete().eq("id", member.id);
    fetchMembers();
  };

  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-md animate-fade-in overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            Membres de l&apos;équipe
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleAdd} className="mb-4 flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Ajouter un prénom"
            maxLength={30}
            className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-light"
          />
          <button
            type="submit"
            disabled={newName.trim().length < 2 || submitting}
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-40"
          >
            Ajouter
          </button>
        </form>

        {error && (
          <p className="mb-3 text-xs font-medium text-rose-500">{error}</p>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <div
              className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200"
              style={{ borderTopColor: "var(--accent)" }}
            />
          </div>
        ) : (
          <div className="space-y-1.5">
            {members.length === 0 && (
              <p className="py-4 text-center text-sm text-slate-400">
                Aucun membre pour l&apos;instant.
              </p>
            )}
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5"
              >
                <span className="text-sm font-medium text-slate-700">
                  {member.name}
                </span>
                <button
                  onClick={() => handleRemove(member)}
                  className="text-xs font-medium text-slate-400 transition hover:text-rose-500"
                >
                  Retirer
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
