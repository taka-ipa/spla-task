'use client';

import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList
} from 'recharts';
import { toCountsPerTask, toRatePerTask } from '@/lib/summaryChart';
import type { TaskResultsSummaryResponse } from '@/types/summary';

type Props = { data: TaskResultsSummaryResponse };

export default function SummaryCharts({ data }: Props) {
  const counts = toCountsPerTask(data);
  const rates  = toRatePerTask(data);

  // モバイルでも見やすいようにコンテナで包む
  return (
    <div className="space-y-6">
      {/* ① タスク別の達成率（横棒） */}
      <div className="rounded-2xl border bg-white p-4 shadow">
        <h2 className="mb-3 font-semibold">タスク別 達成率</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rates} layout="vertical" margin={{ left: 24, right: 24 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="taskId" tickFormatter={(v) => `#${v}`} width={50} />
              <Tooltip formatter={(v: number) => `${v}%`} labelFormatter={(l) => `Task #${l}`} />
              <Bar dataKey="ratePct">
                <LabelList dataKey="ratePct" position="right" formatter={(v: number) => `${v}%`} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-xs text-gray-500">※ maru/total を%化</p>
      </div>

      {/* ② タスク別の○△×（円グラフ：小さめを横並び） */}
      <div className="rounded-2xl border bg-white p-4 shadow">
        <h2 className="mb-3 font-semibold">タスク別 内訳（○△×）</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {counts.map((c) => {
            const pieData = [
              { name: '○', value: c.maru },
              { name: '△', value: c.sankaku },
              { name: '×', value: c.batsu },
            ];
            const total = c.total || 0;
            return (
              <div key={c.taskId} className="flex flex-col items-center rounded-xl border p-3">
                <div className="text-sm mb-1">Task #{c.taskId}</div>
                <div className="w-full h-40">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" outerRadius="80%">
                        {pieData.map((_, i) => <Cell key={i} />)}
                      </Pie>
                      <Tooltip formatter={(v: number, n: string) => [`${v}件`, n]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-xs text-gray-500">計 {total} 件</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}