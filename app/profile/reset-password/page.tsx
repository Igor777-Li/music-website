'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const router = useRouter();

  /* 密码相关 */
  const [pwd, setPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  /* 提示与报错 */
  const [pwdTip, setPwdTip] = useState('');
  const [pwdErr, setPwdErr] = useState('');
  const [newPwdErr, setNewPwdErr] = useState('');
  const [confirmErr, setConfirmErr] = useState('');

  /* 聚焦 / 失焦 */
  const onPwdFocus = () => setPwdTip('6-12 位字符，由数字、字母组成');
  const onPwdBlur  = () => setPwdTip('');

  /* 前端校验 */
  const validate = () => {
    let ok = true;

    /* 当前密码 */
    if (!pwd) {
      setPwdErr('请输入当前密码');
      ok = false;
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,12}$/.test(pwd)) {
      setPwdErr('密码格式不符');
      ok = false;
    } else {
      setPwdErr('');
    }

    /* 新密码 */
    if (!newPwd) {
      setNewPwdErr('请输入新密码');
      ok = false;
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,12}$/.test(newPwd)) {
      setNewPwdErr('新密码格式不符');
      ok = false;
    } else {
      setNewPwdErr('');
    }

    /* 确认密码 */
    if (!confirmPwd) {
      setConfirmErr('请再次输入新密码');
      ok = false;
    } else if (newPwd !== confirmPwd) {
      setConfirmErr('两次新密码不一致');
      ok = false;
    } else {
      setConfirmErr('');
    }

    return ok;
  };

  /* 提交 */
  const handleSubmit = async () => {
    if (!validate()) return;

    const token = document.cookie
      .split('; ')
      .find((r) => r.startsWith('spotify_access_token='))
      ?.split('=')[1];

    const res = await fetch('http://8.134.159.152:3355/password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({password: pwd, newPassword: newPwd }),
    });

    const data = await res.json();
    if (data.ok) {
      alert('密码已重置');
      /* 1. 先通知服务端登出 */
      await fetch('http://8.134.159.152:3355/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      /* 2. 清本地 cookie 并跳到登录页 */
      document.cookie = 'spotify_access_token=; path=/; max-age=0';
      window.location.href = '/auth/login';
    } else {
      alert('修改失败：' + (data.msg || '未知错误'));
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-80 border p-6 rounded text-white">
        <h1 className="text-xl mb-4">修改密码</h1>

        <div className="space-y-3">
          {/* 当前密码 */}
          <div>
            <input
              type="password"
              className="w-full border px-3 py-2 rounded"
              placeholder="当前密码"
              value={pwd}
              onChange={(e) => {
                setPwd(e.target.value)
                if (pwdErr) setPwdErr('');
              }}
              onFocus={onPwdFocus}
              onBlur={onPwdBlur}
            />
            {pwdTip && <p className="text-xs text-gray-400 mt-1">{pwdTip}</p>}
            {pwdErr && <p className="text-xs text-red-500 mt-1">{pwdErr}</p>}
          </div>

          {/* 新密码 */}
          <div>
            <input
              type="password"
              className="w-full border px-3 py-2 rounded"
              placeholder="新密码"
              value={newPwd}
              onChange={(e) => {
                setNewPwd(e.target.value);
                if (newPwdErr) setNewPwdErr('');
              }}
            />
            {newPwdErr && <p className="text-xs text-red-500 mt-1">{newPwdErr}</p>}
          </div>

          {/* 确认新密码 */}
          <div>
            <input
              type="password"
              className="w-full border px-3 py-2 rounded"
              placeholder="确认新密码"
              value={confirmPwd}
              onChange={(e) => {
                setConfirmPwd(e.target.value);
                if (confirmErr) setConfirmErr('');
              }}
            />
            {confirmErr && <p className="text-xs text-red-500 mt-1">{confirmErr}</p>}
          </div>

          {/* 按钮 */}
          <button
            onClick={handleSubmit}
            className="w-full bg-green-600 text-white py-2 rounded"
          >
            确认修改
          </button>

          <p className="text-sm text-center mt-4">
            <span
              className="text-blue-400 cursor-pointer"
              onClick={() => router.back()}
            >
              返回
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}