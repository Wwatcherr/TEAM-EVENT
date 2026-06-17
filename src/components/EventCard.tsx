"use client";

import { useMemo, useState } from "react";
import { format, isPast } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase, EventRow, ResponseRow, ResponseStatus } from "@/lib/supabase";
import { useUser } from "@/lib/user-context";

const STATUS_CONFIG: Record<
  ResponseStatus,
  { label: string; activeClass: string; dot: string }
> = {
  yes: {
    label: "Présent",
    activeClass: "bg-emerald-500 text-white shadow-emerald-200",
    dot: "bg-emerald-500",
  },
  maybe: {
    label: "Peut-être",
    activeClass: "bg-amber-500 text-white shadow-amber-200",
    dot: "bg-amber-500",
  },
  no: {
    label: "Absent",
    activeClass: "bg-rose-500 text-white shadow-rose-200",
    dot: "bg-rose-500",
  },
};

export default function EventCard({
  event,
  responses,
  onChanged,
  onDeleted,
}: {
  event: EventRow;
  responses: ResponseRow[];
  onChanged: () => void;
  onDeleted: () => void;
}) {
  const { name } = useUser();
  const [updating, setUpdating] = useState(false);

  const myResponse = responses.find((r) => r.participant_name === name);
  const past = isPast(new Date(event.event_date));
  const deadlinePassed = event.rsvp_deadline
    ? isPast(new Date(event.rsvp_deadline))
    : false;
  const responsesLocked = deadlinePassed || past;

  const grouped = useMemo(() => {
    const g: Record<ResponseStatus, ResponseRow[]> = {
      yes: [],
      maybe: [],
      no: [],
    };
    responses.forEach((r) => g[r.status].push(r));
    return g;
  }, [responses]);

  const handleRespond = async (status: ResponseStatus) => {
    if (!name || updating || responsesLocked) return;
    setUpdating(true);

    if (myResponse?.status === status) {
      await supabase
        .from("responses")
        .delete()
        .eq("event_id", event.id)
        .eq("participant_name", name);
    } else {
      await supabase.from("responses").upsert(
        {
          event_id: event.id,
          participant_name: name,
          status,
        },
        { onConflict: "event_id,participant_name" }
      );
    }

    setUpdating(false);
    onChanged();
  };

  const handleDelete = async () => {
    if (!confirm("Supprimer cet événement ?")) return;
    await supabase.from("events").delete().eq("id", event.id);
    onDeleted();
  };

  const dateLabel = format(new Date(event.event_date), "EEEE d MMMM", {
    locale: fr,
  });
  const timeLabel = format(new Date(event.event_date), "HH:mm");

  const deadlineLabel = event.rsvp_deadline
    ? format(new Date(event.rsvp_deadline), "d MMMM 'à' HH:mm", { locale: fr })
    : null;

  return (
    <div
      className={`animate-fade-in rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition ${
        past ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-light text-2xl">
            {event.icon || "📅"}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {event.title}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 capitalize">
              {dateLabel} · {timeLabel}
              {event.location && ` · ${event.location}`}
            </p>
          </div>
        </div>

        {event.created_by === name && (
          <button
            onClick={handleDelete}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-300 transition hover:bg-rose-50 hover:text-rose-500"
            title="Supprimer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {event.description && (
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          {event.description}
        </p>
      )}

      {deadlineLabel && (
        <p
          className={`mt-3 text-xs font-medium ${
            deadlinePassed ? "text-rose-500" : "text-slate-400"
          }`}
        >
          {deadlinePassed
            ? "Date limite de réponse dépassée"
            : `À répondre avant le ${deadlineLabel}`}
        </p>
      )}

      <div className="mt-4 flex gap-2">
        {(Object.keys(STATUS_CONFIG) as ResponseStatus[]).map((status) => {
          const cfg = STATUS_CONFIG[status];
          const active = myResponse?.status === status;
          return (
            <button
              key={status}
              disabled={updating || responsesLocked}
              onClick={() => handleRespond(status)}
              title={
                responsesLocked
                  ? "Les réponses sont fermées pour cet événement"
                  : undefined
              }
              className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${
                active
                  ? cfg.activeClass
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {cfg.label}
            </button>
          );
        })}
      </div>

      {responses.length > 0 && (
        <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
          {(Object.keys(STATUS_CONFIG) as ResponseStatus[]).map((status) =>
            grouped[status].length > 0 ? (
              <div key={status} className="flex items-start gap-2 text-xs">
                <span
                  className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${STATUS_CONFIG[status].dot}`}
                />
                <span className="text-slate-500">
                  <span className="font-medium text-slate-700">
                    {STATUS_CONFIG[status].label} ({grouped[status].length})
                  </span>{" "}
                  — {grouped[status].map((r) => r.participant_name).join(", ")}
                </span>
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
