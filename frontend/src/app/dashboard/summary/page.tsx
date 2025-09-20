'use client';
import { useEffect, useState } from 'react';
import { getTaskResultsSummary } from '@/lib/api';
import type { TaskResultsSummaryResponse } from '@/types/summary';
import SummaryCharts from '@/components/SummaryCharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

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

  if (loading) {
    return (
      <div className="p-4">
        {/* Skeleton */}
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

  return (
    <div className="max-w-screen-md mx-auto p-3 sm:p-4 space-y-6">
      <h1 className="text-lg sm:text-xl md:text-2xl font-bold">集計（{data.range.from ?? '—'} 〜 {data.range.to ?? '—'}）</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.summary.map((item) => {
          const ratePct = Math.round(item.achieveRate * 100);
          return (
            <Card key={item.task_id} className="rounded-2xl bg-white p-4 shadow border">
              <CardHeader className="flex items-center justify-between mb-2 px-0">
                <CardTitle className="font-semibold">Task #{item.task_id}</CardTitle>
                <div className="text-sm text-gray-500">{item.counts.total}件</div>
              </CardHeader>
              <CardContent className="px-0">
                {/* バーと達成率表示 */}
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

      {/* グラフ表示 */}
      <div className=" [&_.chart-h]:h-64 sm:[&_.chart-h]:h-80 ">
        <SummaryCharts data={data} />
      </div>
    </div>
  );
}