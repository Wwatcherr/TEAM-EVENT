"use client";

import { useUser } from "@/lib/user-context";

export default function Header() {
  const { name, clearName } = useUser();

  const initials = name
    ? name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white"
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
          </div>
          <span className="text-base font-bold text-slate-900">TeamUp</span>
        </div>

        <button
          onClick={clearName}
          className="group flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-200"
          title="Changer de prénom"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-300 text-[11px] font-bold text-slate-700">
            {initials}
          </span>
          {name}
        </button>
      </div>
    </header>
  );
}
