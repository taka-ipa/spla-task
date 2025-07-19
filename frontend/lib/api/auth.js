// lib/api/auth.js
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const login = async (email, password) => {
  const response = await axios.post(
    `${API_URL}/api/login`,
    { email, password },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )

  // 取得したトークンをlocalStorageなどに保存（必要に応じて）
  const token = response.data.token
  localStorage.setItem('token', token)

  return token
}
