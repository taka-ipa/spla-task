"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import TaskForm from "@/components/tasks/TaskForm";
import TaskList from "@/components/tasks/TaskList";
import { Paginated, Task } from "@/types/task";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get<Paginated<Task>>("/api/tasks");
      setTasks(res.data.data ?? res.data as unknown as Task[]); // paginate対応
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">課題一覧</h1>
      <TaskForm onCreated={(t)=> setTasks(prev => prev ? [t, ...prev] : [t])} />
      {loading ? (
        <div className="p-6 text-center text-gray-500">読み込み中...</div>
      ) : (
        <TaskList
          initial={tasks ?? []}
          onUpdated={(t)=> setTasks(prev => prev?.map(x => x.id===t.id?t:x) ?? [t])}
          onDeleted={(id)=> setTasks(prev => prev?.filter(x => x.id!==id) ?? [])}
        />
      )}
    </div>
  );
}
