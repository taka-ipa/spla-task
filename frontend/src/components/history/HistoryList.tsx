'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'

type Rating = 'maru' | 'sankaku' | 'batsu'
type TaskResult = {
  id: number
  date: string       // YYYY-MM-DD
  taskName: string
  rating: Rating
}

const R_LABEL: Record<Rating, string> = { maru: '○', sankaku: '△', batsu: '×' }

// まずは固定のダミー
const DUMMY: TaskResult[] = [
  { id: 1, date: '2025-09-01', taskName: '初弾精度', rating: 'maru' },
  { id: 2, date: '2025-09-02', taskName: '射程感覚', rating: 'sankaku' },
  { id: 3, date: '2025-09-03', taskName: 'スライド', rating: 'batsu' },
]

export default function HistoryList() {
  const [items] = React.useState<TaskResult[]>(DUMMY)

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-3">
      <h2 className="text-xl font-semibold mb-3">評価履歴（リスト表示）</h2>

      {items.map(it => (
        <Card key={it.id}>
          <CardContent className="p-4 space-y-1">
            <div className="text-sm text-muted-foreground">📅 {it.date}</div>
            <div className="font-medium">課題: {it.taskName}</div>
            <div className="text-lg">評価: {R_LABEL[it.rating]}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
