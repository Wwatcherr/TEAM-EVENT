"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase, EventRow, ResponseRow } from "@/lib/supabase";
import { useUser } from "@/lib/user-context";
import { useAppLock } from "@/lib/use-app-lock";
import NameGate from "@/components/NameGate";
import Header from "@/components/Header";
import NewEventModal from "@/components/NewEventModal";
import EventCard from "@/components/EventCard";

export default function Home() {
  const { name } = useUser();
  const { status: lockStatus, unlock } = useAppLock();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [responses, setResponses] = useState<ResponseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    const [eventsRes, responsesRes] = await Promise.all([
      supabase.from("events").select("*").order("event_date", { ascending: true }),
      supabase.from("responses").select("*"),
    ]);
    if (eventsRes.data) setEvents(eventsRes.data);
    if (responsesRes.data) setResponses(responsesRes.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!name || lockStatus !== "unlocked") return;
    fetchData();

    const channel = supabase
      .channel("realtime-events")
      .on("postgres_changes", { event: "*", schema: "public", table: "events" }, () =>
        fetchData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "responses" },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [name, lockStatus, fetchData]);

  const { upcoming, past } = useMemo(() => {
    const now = Date.now();
    return {
      upcoming: events.filter(
        (e) => new Date(e.event_date).getTime() >= now - 86400000
      ),
      past: events.filter(
        (e) => new Date(e.event_date).getTime() < now - 86400000
      ),
    };
  }, [events]);

  if (lockStatus !== "unlocked" || !name)
    return <NameGate status={lockStatus} unlock={unlock} />;

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-6">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">
            Événements à venir
          </h1>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow-accent transition"
          >
            <span className="text-base leading-none">+</span> Créer
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200" style={{ borderTopColor: "var(--accent)" }} />
            <p className="mt-3 text-sm">Chargement...</p>
          </div>
        ) : (
          <>
            {upcoming.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white/50 py-14 text-center">
                <p className="text-sm text-slate-500">
                  Aucun événement prévu pour l&apos;instant.
                </p>
                <button
                  onClick={() => setModalOpen(true)}
                  className="mt-3 text-sm font-semibold text-accent hover:underline"
                >
                  Créer le premier événement
                </button>
              </div>
            )}

            <div className="space-y-3">
              {upcoming.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  responses={responses.filter((r) => r.event_id === event.id)}
                  onChanged={fetchData}
                  onDeleted={fetchData}
                />
              ))}
            </div>

            {past.length > 0 && (
              <div className="mt-8">
                <h2 className="mb-3 text-sm font-semibold text-slate-400">
                  Événements passés
                </h2>
                <div className="space-y-3">
                  {past.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      responses={responses.filter((r) => r.event_id === event.id)}
                      onChanged={fetchData}
                      onDeleted={fetchData}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <NewEventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={fetchData}
      />
    </>
  );
}
