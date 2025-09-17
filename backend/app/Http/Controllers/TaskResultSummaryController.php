<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TaskResultSummaryController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        $from = $request->query('from'); // 例: 2025-09-01
        $to   = $request->query('to');   // 例: 2025-09-30

        $query = DB::table('task_results')
            ->select([
                'task_id',
                DB::raw("SUM(CASE WHEN rating = 'maru'   THEN 1 ELSE 0 END) as maru"),
                DB::raw("SUM(CASE WHEN rating = 'sankaku' THEN 1 ELSE 0 END) as sankaku"),
                DB::raw("SUM(CASE WHEN rating = 'batsu'  THEN 1 ELSE 0 END) as batsu"),
                DB::raw("COUNT(*) as total"),
            ])
            ->where('user_id', $userId);

        if ($from) $query->where('date', '>=', $from);
        if ($to)   $query->where('date', '<=', $to);

        $rows = $query->groupBy('task_id')->get();

        // 達成率など整形（例：maru/total）
        $data = $rows->map(function ($r) {
            $achieved = (int)$r->maru;
            $total    = (int)$r->total;
            $rate     = $total > 0 ? round($achieved / $total, 4) : 0;
            return [
                'task_id'   => (int)$r->task_id,
                'counts'    => [
                    'maru'    => (int)$r->maru,
                    'sankaku' => (int)$r->sankaku,
                    'batsu'   => (int)$r->batsu,
                    'total'   => $total,
                ],
                'achieveRate' => $rate, // 0〜1
            ];
        });

        return response()->json([
            'range' => ['from' => $from, 'to' => $to],
            'summary' => $data,
        ]);
    }
}