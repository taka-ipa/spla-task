'use client'

import { useEffect } from 'react'
import axios from 'axios'

export default function Home() {
  useEffect(() => {
    axios
  .get("http://127.0.0.1:8000/api/tasks", {
    withCredentials: true,
  })
  .then((res) => {
    console.log("✅ 成功:", res.data);
  })
  .catch((err) => {
    console.error("❌ 失敗:", err);
  });
  }, [])

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">課題リスト（仮表示）</h1>
      <p>LaravelのAPIから取得したデータは console に出力されます！</p>
    </main>
  )
}
