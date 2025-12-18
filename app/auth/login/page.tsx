"use client";
import { useState } from "react";

export default function LoginPage() {
  const [ident, setIdent]   = useState("");   // 用户名或 UID
  const [pwd, setPwd]       = useState("");

  /* 实时提示 */
  const [identTip, setIdentTip] = useState("");
  const [pwdTip, setPwdTip]     = useState("");

  /* 红字错误 */
  const [identErr, setIdentErr] = useState("");
  const [pwdErr, setPwdErr]     = useState("");

  /* 焦点事件 */
  const onIdentFocus = () => setIdentTip("请输入用户名或 8 位 UID");
  const onPwdFocus   = () => setPwdTip("6-12 位字符，由数字、字母组成");
  const onIdentBlur  = () => setIdentTip("");
  const onPwdBlur    = () => setPwdTip("");

  /* 前端校验 */
  const validate = () => {
    let ok = true;

    // 用户名/UID
    if (!ident.trim()) {
      setIdentErr('用户名或 UID 不得为空');
      ok = false;
    } else if (/^\d{8}$/.test(ident)) {
      // 8 位纯数字 → 合法 UID
      setIdentErr('');
    } else if (/^(?!\d+$).{4,20}$/.test(ident)) {
      // 4-20 位 → 合法用户名
      setIdentErr('');
    } else {
      setIdentErr('请输入正确的用户名或 UID');
      ok = false;
    }

    // 密码
    if (!pwd) {
      setPwdErr("密码不得为空");
      ok = false;
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,12}$/.test(pwd)) {
      setPwdErr("请输入正确的密码");
      ok = false;
    } else {
      setPwdErr("");
    }
    return ok;
  };

  /* 登录请求 */
  const login = async () => {
    if (!validate()) return;

    const isUid = /^\d{8}$/.test(ident.trim());
    const body = isUid
      ? JSON.stringify({ uid: ident.trim(), password: pwd })
      : JSON.stringify({ username: ident.trim(), password: pwd });

    const res = await fetch("http://8.134.159.152:3355/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    const data = await res.json();
    if (data.ok) {
      document.cookie = `spotify_access_token=${data.spotify_token}; path=/; max-age=3600`;
      window.location.href = "/";
    } else {
      alert("登录失败：" + (data.msg || "未知错误"));
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-80 border p-6 rounded">
        <h1 className="text-xl mb-4">登录</h1>

        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); login(); }}>
          {/* 用户名/UID */}
          <div>
            <input
              className="w-full border px-3 py-2"
              placeholder="用户名或 UID"
              value={ident}
              onChange={(e) => setIdent(e.target.value)}
              onFocus={onIdentFocus}
              onBlur={onIdentBlur}
            />
            {identTip && <p className="text-xs text-gray-500 mt-1">{identTip}</p>}
            {identErr && <p className="text-xs text-red-600 mt-1">{identErr}</p>}
          </div>

          {/* 密码 */}
          <div>
            <input
              className="w-full border px-3 py-2"
              placeholder="密码"
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              onFocus={onPwdFocus}
              onBlur={onPwdBlur}
            />
            {pwdTip && <p className="text-xs text-gray-500 mt-1">{pwdTip}</p>}
            {pwdErr && <p className="text-xs text-red-600 mt-1">{pwdErr}</p>}
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
            登录
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          还没账号？
          <a href="/auth/register" className="text-blue-600">去注册</a>
        </p>
      </div>
    </div>
  );
}