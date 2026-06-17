"use client";

const EMOJIS = [
  "📅", "🎉", "🍻", "🍕", "🎂", "🏖️", "🎯", "⚽",
  "🎮", "🎵", "🎬", "☕", "🍷", "🏆", "🚀", "💼",
  "🧑‍🤝‍🧑", "🎓", "🛠️", "🏕️", "🎄", "🥳", "📍", "❓",
];

export default function EmojiPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (emoji: string) => void;
}) {
  return (
    <div className="grid grid-cols-8 gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onChange(emoji)}
          className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg transition ${
            value === emoji
              ? "bg-accent-light ring-2 ring-accent"
              : "hover:bg-slate-200"
          }`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
