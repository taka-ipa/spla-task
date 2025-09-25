"use client";
import { auth } from "@/lib/firebase";
import axios from "axios";

export default function TestFirebase() {
  async function handleTest() {
    const user = auth.currentUser;
    if (!user) {
      alert("まだFirebaseログインしてないよ！");
      return;
    }

    const idToken = await user.getIdToken(true);
    console.log("IDトークン:", idToken);

    await axios.post("http://localhost:8000/api/auth/firebase-login", null, {
      headers: { Authorization: `Bearer ${idToken}` },
      withCredentials: true,
    });

    const res = await axios.get("http://localhost:8000/api/user", {
      withCredentials: true,
    });
    console.log("ユーザー情報:", res.data);
  }

  return (
    <div className="p-4">
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleTest}
      >
        Firebaseテスト実行
      </button>
    </div>
  );
}
