import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type ResponseStatus = "yes" | "no" | "maybe";

export interface EventRow {
  id: string;
  title: string;
  description: string;
  location: string;
  icon: string;
  event_date: string;
  rsvp_deadline: string | null;
  created_by: string;
  created_at: string;
}

export interface ResponseRow {
  id: string;
  event_id: string;
  participant_name: string;
  status: ResponseStatus;
  comment: string;
  updated_at: string;
}

export interface MemberRow {
  id: string;
  name: string;
  created_at: string;
}

/** Normalise un prénom pour comparaison fiable (casse, espaces, accents conservés) */
export function normalizeName(value: string): string {
  return value.trim().toLowerCase();
}
