"use client";
import { useState } from "react";
import api from "@/lib/api";
import EmojiPicker from "./EmojiPicker";
import { Task } from "@/types/task";

export default function TaskForm({ onCreated }: { onCreated: (t: Task) => void }) {
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const canSubmit = title.trim().length > 0;

  const submit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    try {
      const res = await api.post<Task>("/api/tasks", {
        title: title.trim(), icon, notes: notes.trim() || null, is_active: true,
      });
      onCreated(res.data);
      setTitle(""); setIcon(null); setNotes("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-2xl shadow-sm bg-white">
      <div className="flex gap-3 items-center">
        <EmojiPicker value={icon ?? undefined} onSelect={setIcon} />
        <input
          className="flex-1 border rounded-xl px-3 py-2"
          placeholder="課題タイトル（例：初弾精度）"
          value={title} onChange={(e)=>setTitle(e.target.value)} maxLength={100}
        />
        <button
          className={`rounded-xl px-4 py-2 ${canSubmit ? "bg-black text-white" : "bg-gray-300 text-gray-600"}`}
          onClick={submit} disabled={!canSubmit || loading}
        >
          {loading ? "保存中..." : "追加"}
        </button>
      </div>
      <textarea
        className="mt-3 w-full border rounded-xl px-3 py-2 min-h-[72px]"
        placeholder="メモ（任意）"
        value={notes} onChange={(e)=>setNotes(e.target.value)}
      />
    </div>
  );
}
