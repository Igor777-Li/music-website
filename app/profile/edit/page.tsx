"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  username: string;
  bio: string;
  email: string;
  avatarUrl: string;
};

export default function EditProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState<User>({
    username: "",
    bio: "",
    email: "",
    avatarUrl: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  /* ---------- 初始回填 ---------- */
  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((r) => r.startsWith("spotify_access_token="))
      ?.split("=")[1];

    fetch("http://8.134.159.152:3355/user", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((u) => setForm({ username: u.username || "", bio: u.bio || "", email: u.email || "", avatarUrl: u.avatarUrl || "" }))
      .catch(() => router.replace("/"));
  }, [router]);

  /* ---------- 头像上传 ---------- */
  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const token = document.cookie
      .split("; ")
      .find((r) => r.startsWith("spotify_access_token="))
      ?.split("=")[1];

    const fd = new FormData();
    fd.append("avatar", file);

    const res = await fetch("http://8.134.159.152:3355/avatar", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: fd,
    });

    const data = await res.json();
    setUploading(false);
    if (data.ok) {
      setForm({ ...form, avatarUrl: data.url });
    } else {
      alert("上传失败：" + (data.msg || "未知错误"));
    }
  };

  /* ---------- 保存资料 ---------- */
  const handleSave = async () => {
    if (!form.username.trim()) return alert("用户名不能为空");

    const token = document.cookie
      .split("; ")
      .find((r) => r.startsWith("spotify_access_token="))
      ?.split("=")[1];

    const res = await fetch("http://8.134.159.152:3355/user", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (data.ok) {
      router.replace("/profile");
    } else {
      alert("保存失败：" + (data.msg || "未知错误"));
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto text-white">
      <h1 className="text-2xl font-semibold mb-6">编辑资料</h1>

      <div className="space-y-4">
        {/* 头像上传 */}
        <div>
          <label className="block text-sm mb-1">头像</label>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="px-3 py-1 rounded bg-blue-600 text-sm disabled:opacity-50"
            >
              {uploading ? "上传中…" : "上传"}
            </button>
            {form.avatarUrl && (
              <img
                src={form.avatarUrl}
                alt="avatar"
                className="w-16 h-16 rounded object-cover"
              />
            )}
          </div>
        </div>

        {/* 用户名 */}
        <div>
          <label className="block text-sm mb-1">用户名</label>
          <input
            className="w-full border border-white/20 bg-white/5 px-3 py-2 rounded"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
        </div>

        {/* 邮箱 */}
        <div>
          <label className="block text-sm mb-1">邮箱</label>
          <input
            type="email"
            className="w-full border border-white/20 bg-white/5 px-3 py-2 rounded"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        {/* 个性签名 */}
        <div>
          <label className="block text-sm mb-1">个性签名</label>
          <textarea
            className="w-full border border-white/20 bg-white/5 px-3 py-2 rounded"
            rows={3}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
        </div>

        {/* 按钮 */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
          >
            保存
          </button>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded bg-white/10 hover:bg-white/20"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}