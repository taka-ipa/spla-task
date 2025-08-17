"use client";
import { useState } from "react";
import { Task } from "@/types/task";
import api from "@/lib/api";

export default function TaskList({
  initial, onUpdated, onDeleted,
}: { initial: Task[]; onUpdated: (t: Task)=>void; onDeleted:(id:number)=>void; }) {
  const [items, setItems] = useState<Task[]>(initial);

  const del = async (id: number) => {
    await api.delete(`/api/tasks/${id}`);
    setItems(prev => prev.filter(t => t.id !== id));
    onDeleted(id);
  };

  const toggleActive = async (t: Task) => {
    const res = await api.put<Task>(`/api/tasks/${t.id}`, { is_active: !t.is_active });
    setItems(prev => prev.map(x => x.id === t.id ? res.data : x));
    onUpdated(res.data);
  };

  return (
    <ul className="mt-4 space-y-2">
      {items.map(t => (
        <li key={t.id} className="p-3 border rounded-2xl bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{t.icon ?? "🙂"}</span>
            <div>
              <div className="font-medium">{t.title}</div>
              {t.notes && <div className="text-sm text-gray-500">{t.notes}</div>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 rounded-xl border" onClick={() => toggleActive(t)}>
              {t.is_active ? "アクティブ" : "非表示"}
            </button>
            <button className="px-3 py-1 rounded-xl border text-red-600" onClick={() => del(t.id)}>
              削除
            </button>
          </div>
        </li>
      ))}
      {items.length === 0 && (
        <li className="text-gray-500 p-6 text-center border rounded-2xl bg-white">まだ課題がありません</li>
      )}
    </ul>
  );
}
