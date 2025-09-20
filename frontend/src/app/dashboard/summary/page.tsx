'use client';
import { useEffect, useState } from 'react';
import { getTaskResultsSummary } from '@/lib/api';
import type { TaskResultsSummaryResponse } from '@/types/summary';
import SummaryCharts from '@/components/SummaryCharts';

export default function SummaryPage() {
  const [data, setData] = useState<TaskResultsSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const fetcher = async () => {
      try {
        setLoading(true);
        const res = await getTaskResultsSummary({
          // とりあえず当月例。あとでDatePickerと連動
          from: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            .toISOString()
            .slice(0, 10),
          to: new Date().toISOString().slice(0, 10),
        });
        setData(res);
      } catch (e: any) {
        setErr(e?.message ?? 'failed to fetch');
      } finally {
        setLoading(false);
      }
    };
    fetcher();
  }, []);

  if (loading) return <div className="p-4">読み込み中…</div>;
  if (err) return <div className="p-4 text-red-600">エラー: {err}</div>;
  if (!data) return <div className="p-4">データなし</div>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">集計（{data.range.from ?? '—'} 〜 {data.range.to ?? '—'}）</h1>

      <div className="grid md:grid-cols-2 gap-4">
        {data.summary.map((item) => {
          const ratePct = Math.round(item.achieveRate * 100);
          return (
            <div key={item.task_id} className="rounded-2xl shadow p-4 border bg-white">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold">Task #{item.task_id}</div>
                <div className="text-sm text-gray-500">{item.counts.total}件</div>
              </div>

              {/* 簡易バー（あとでRecharts差し替え） */}
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
            </div>
          );
        })}
      </div>

      {/* グラフ表示 */}
      <SummaryCharts data={data} />
    </div>
  );
}