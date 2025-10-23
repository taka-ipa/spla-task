"use client";

import { useEffect, useState } from "react";
import { listTasks } from "@/lib/apiTasks"; // ← 正規化済みfetch
import type { Task } from "@/types/task";
import TaskForm from "@/components/tasks/TaskForm";
import TaskList from "@/components/tasks/TaskList";
import { toast } from "sonner";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const rows = await listTasks(); // paginate/非paginate 両対応
      setTasks(rows);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "タスクの取得に失敗しました");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">課題一覧</h1>

      {/* 新規作成（作成成功で先頭に追加＋トースト） */}
      <TaskForm
        onCreated={(t) => {
          setTasks((prev) => (prev ? [t, ...prev] : [t]));
          toast.success("タスクを追加しました 🎉");
        }}
      />

      {loading ? (
        <div className="p-6 text-center text-gray-500">読み込み中…</div>
      ) : (
        <TaskList
          initial={tasks ?? []}
          onUpdated={(t) => {
            setTasks((prev) => prev?.map((x) => (x.id === t.id ? t : x)) ?? [t]);
            toast.success("タスクを更新しました");
          }}
          onDeleted={(id) => {
            setTasks((prev) => prev?.filter((x) => x.id !== id) ?? []);
            toast.success("タスクを削除しました");
          }}
        />
      )}
    </div>
  );
}
