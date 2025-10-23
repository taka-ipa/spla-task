"use client";

import { useEffect, useMemo, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import SummaryCharts from "@/components/SummaryCharts";

// 既存のAPI（期間指定のサマリー）
import { getTaskResultsSummary } from "@/lib/api";
import type { TaskResultsSummaryResponse } from "@/types/summary";

export default function SummaryPage() {
  const [data, setData] = useState<TaskResultsSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // 今月〜今日（とりあえず）
  const from = useMemo(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
    []
  );
  const to = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await getTaskResultsSummary({ from, to });
        setData(res);
        setErr(null);
      } catch (e: any) {
        setErr(e?.message ?? "failed to fetch");
      } finally {
        setLoading(false);
      }
    })();
  }, [from, to]);

  if (loading) {
    return (
      <div className="p-4">
        <div className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
      </div>
    );
  }

  if (err) {
    return (
      <div className="p-4">
        <Card className="bg-red-50 border-red-200">
          <CardContent>
            <p className="text-red-600 text-sm">エラー: {err}</p>
            <button
              onClick={() => location.reload()}
              className="mt-2 px-3 py-1.5 rounded bg-red-500 text-white text-sm"
            >
              再読み込み
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4">
        <Card>
          <CardContent>
            <p className="text-sm text-gray-500">データがありません</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---- ここから Recharts 用のデータ作成（既存サマリーから達成率%を算出） ----
  const pieData = data.summary.map((item) => ({
    name: `Task #${item.task_id}`,
    value: Math.round((item.achieveRate ?? 0) * 100),
  }));

  const COLORS = ["#60a5fa", "#34d399", "#fbbf24", "#f87171", "#a78bfa", "#fb7185", "#22d3ee"];

  return (
    <div className="max-w-screen-lg mx-auto p-3 sm:p-4 space-y-6">
      <h1 className="text-lg sm:text-xl md:text-2xl font-bold">
        集計（{data.range.from ?? "—"} 〜 {data.range.to ?? "—"}）
      </h1>

      {/* 達成率の円グラフ（Recharts） */}
      <Card className="p-4">
        <CardHeader className="px-0 pb-2">
          <CardTitle className="text-base sm:text-lg">課題ごとの達成率（%）</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  dataKey="value"
                  label={({ name, value }) => `${name} ${value}%`}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* カード一覧（既存の棒表示） */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.summary.map((item) => {
          const ratePct = Math.round((item.achieveRate ?? 0) * 100);
          return (
            <Card key={item.task_id} className="rounded-2xl bg-white p-4 shadow border">
              <CardHeader className="flex items-center justify-between mb-2 px-0">
                <CardTitle className="font-semibold">Task #{item.task_id}</CardTitle>
                <div className="text-sm text-gray-500">{item.counts.total}件</div>
              </CardHeader>
              <CardContent className="px-0">
                <div className="w-full h-2 rounded bg-gray-200 overflow-hidden mb-2">
                  <div
                    className="h-2 bg-blue-500"
                    style={{ width: `${ratePct}%` }}
                    aria-label={`達成率 ${ratePct}%`}
                  />
                </div>
                <div className="text-sm">達成率：{ratePct}%</div>
                <div className="mt-2 text-xs text-gray-600">
                  ○ {item.counts.maru} / △ {item.counts.sankaku} / × {item.counts.batsu}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 既存の複合チャート（SummaryCharts） */}
      <div className="[&_.chart-h]:h-64 sm:[&_.chart-h]:h-80">
        <SummaryCharts data={data} />
      </div>
    </div>
  );
}
