'use client'

import { useEffect } from 'react'
import axios from 'axios'

export default function Home() {
  useEffect(() => {
    axios
      .get('http://127.0.0.1:8000/api/user', {
        withCredentials: true,
      })
      .then((res) => {
        console.log('✅ ユーザー情報取得成功:', res.data)
      })
      .catch((err) => {
        console.error('❌ ユーザー取得失敗:', err)
      })
  }, [])

  return <div>Sanctum動作チェック中…</div>
}
