'use client'

import { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  })

  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
        withCredentials: true,
      })

      await axios.post(
        'http://localhost:8000/api/register',
        {
          name: form.name,
          email: form.email,
          password: form.password,
        },
        {
          withCredentials: true,
        }
      )

      router.push('/') // 成功したらトップページなどへ遷移
    } catch (err: any) {
      setError('登録に失敗しました')
      console.error('❌ 登録エラー:', err)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">新規登録</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          name="name"
          placeholder="名前"
          value={form.name}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="メールアドレス"
          value={form.email}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="パスワード"
          value={form.password}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          登録
        </button>
        {error && <p className="text-red-600">{error}</p>}
      </form>
    </div>
  )
}
