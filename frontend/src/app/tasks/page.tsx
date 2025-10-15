"use client";
import { useEffect, useState } from "react";
import { listTasks, createTask, deleteTask } from "@/lib/apiTasks";
import type { Task } from "@/types/task";

export default function TasksPage() {
  const [items, setItems] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [err, setErr] = useState<string|null>(null);

  const load = async () => {
    try { setItems(await listTasks()); } 
    catch (e:any) { setErr(e?.response?.data?.message ?? "取得失敗"); }
  };

  useEffect(() => { load(); }, []);

  const add = async () => {
    try {
      const t = await createTask({ title });
      setItems((prev) => [t, ...prev]);
      setTitle("");
    } catch (e:any) {
      setErr(e?.response?.data?.message ?? "作成失敗");
    }
  };

  const remove = async (id:number) => {
    const prev = items;
    setItems(prev.filter(x => x.id !== id)); // optimistic
    try { await deleteTask(id); }
    catch {
      setItems(prev); // rollback
    }
  };

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">課題</h1>
      <div className="flex gap-2">
        <input className="border p-2 rounded-2xl flex-1" value={title} onChange={e=>setTitle(e.target.value)} placeholder="課題名" />
        <button onClick={add} className="px-4 py-2 rounded-2xl border">追加</button>
      </div>
      {err && <p className="text-red-600 text-sm">{err}</p>}
      <ul className="space-y-2">
        {items.map(t => (
          <li key={t.id} className="border rounded-2xl px-3 py-2 flex justify-between">
            <span>{t.title}</span>
            <button onClick={()=>remove(t.id)} className="text-sm underline">削除</button>
          </li>
        ))}
      </ul>
    </main>
  );
}
