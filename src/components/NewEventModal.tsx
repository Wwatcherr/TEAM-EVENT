"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/lib/user-context";
import EmojiPicker from "@/components/EmojiPicker";

export default function NewEventModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const { name } = useUser();
  const [icon, setIcon] = useState("📅");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [deadlineTime, setDeadlineTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const reset = () => {
    setIcon("📅");
    setTitle("");
    setDescription("");
    setLocation("");
    setDate("");
    setTime("");
    setDeadlineDate("");
    setDeadlineTime("");
    setError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) {
      setError("Le titre et la date sont obligatoires.");
      return;
    }
    setSubmitting(true);
    setError("");

    const isoDate = new Date(`${date}T${time || "09:00"}:00`).toISOString();
    const isoDeadline = deadlineDate
      ? new Date(`${deadlineDate}T${deadlineTime || "23:59"}:00`).toISOString()
      : null;

    const { error: insertError } = await supabase.from("events").insert({
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      icon,
      event_date: isoDate,
      rsvp_deadline: isoDeadline,
      created_by: name,
    });

    setSubmitting(false);

    if (insertError) {
      setError("Erreur lors de la création. Réessayez.");
      return;
    }

    reset();
    onCreated();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-md animate-fade-in overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Nouvel événement</h2>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-500">
              Icône
            </label>
            <EmojiPicker value={icon} onChange={setIcon} />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-500">
              Titre
            </label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex : Afterwork de l'équipe"
              maxLength={80}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-light"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-light"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                Heure
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-light"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-500">
              Lieu
            </label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex : Salle de réunion B2"
              maxLength={100}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-light"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-500">
              Description (optionnel)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Détails à partager avec l'équipe"
              maxLength={500}
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-light"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-500">
              Date limite pour répondre (optionnel)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-light"
              />
              <input
                type="time"
                value={deadlineTime}
                onChange={(e) => setDeadlineTime(e.target.value)}
                disabled={!deadlineDate}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-light disabled:opacity-40"
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-400">
              Passé ce délai, les réponses seront verrouillées.
            </p>
          </div>

          {error && <p className="text-xs font-medium text-rose-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
          >
            {submitting ? "Création..." : "Créer l'événement"}
          </button>
        </form>
      </div>
    </div>
  );
}
