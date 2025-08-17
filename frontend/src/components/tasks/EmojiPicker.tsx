"use client";
import { useState } from "react";

const EMOJIS = ["🦑","🎯","🔥","✅","📈","⭐️","💪","📝","⏱️","🎮","🚀","🌊","🛡️","🧠","👀","🏃"];

export default function EmojiPicker({
  value, onSelect,
}: { value?: string | null; onSelect: (e: string) => void; }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button type="button" className="border rounded-xl px-3 py-2"
        onClick={() => setOpen((v) => !v)}>
        {value || "🙂"} <span className="opacity-60">絵文字</span>
      </button>
      {open && (
        <div className="absolute z-10 mt-2 p-2 bg-white border rounded-2xl shadow grid grid-cols-8 gap-2">
          {EMOJIS.map((e) => (
            <button key={e} type="button" className="text-xl hover:scale-110 transition"
              onClick={() => { onSelect(e); setOpen(false); }}>{e}</button>
          ))}
        </div>
      )}
    </div>
  );
}
