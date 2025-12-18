'use client';
import { useState } from 'react';

export default function RegisterPage() {
  const [user, setUser] = useState('');
  const [pwd, setPwd] = useState('');
  const [pwd2, setPwd2] = useState('');

  /* 实时提示文字 */
  const [userTip, setUserTip] = useState('');
  const [pwdTip, setPwdTip] = useState('');

  /* 红字错误 */
  const [userErr, setUserErr] = useState('');
  const [pwdErr, setPwdErr] = useState('');
  const [pwd2Err, setPwd2Err] = useState('');

  /* 失焦时给出实时提示 */
  const onUserFocus = () =>
    setUserTip('4-20 位字符，不得由纯数字组成');
  const onPwdFocus = () =>
    setPwdTip('6-12 位字符，由数字、字母组成');

  const onUserBlur = () => setUserTip('');
  const onPwdBlur = () => setPwdTip('');

  /* 前端校验 */
  const validate = () => {
    let ok = true;
    // 用户名
    if (!user.trim()) {
      setUserErr('用户名不得为空');
      ok = false;
    } else if (!/^(?!\d+$).{4,20}$/.test(user)) {
      setUserErr('用户名不符合要求');
      ok = false;
    } else {
      setUserErr('');
    }
    // 密码校验
    if (!pwd) {
      setPwdErr('密码不得为空');
      ok = false;
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,12}$/.test(pwd)) {
      setPwdErr('密码不符合要求');
      ok = false;
    } else {
      setPwdErr('');
    }
    // 确认密码
    if (!pwd2) {
      setPwd2Err('请确认密码');
      ok = false;
    } else if (pwd !== pwd2) {
      setPwd2Err('确认密码与密码不同');
      ok = false;
    } else {
      setPwd2Err('');
    }
    return ok;
  };

  const register = async () => {
    if (!validate()) return;          // 校验失败直接返回
    const res = await fetch('http://8.134.159.152:3355/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password: pwd }),
    });

    const data = await res.json(); // 解析 JSON 响应

    if (data.ok) {
      alert('注册成功');
      window.location.href = '/auth/login';
    } else {
      alert('注册失败：' + (data.msg || '未知错误'));
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-80 border p-6 rounded">
        <h1 className="text-xl mb-4">注册</h1>
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); register(); }}>
          {/* 用户名 */}
          <div>
            <input
              className="w-full border px-3 py-2"
              placeholder="用户名"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              onFocus={onUserFocus}
              onBlur={onUserBlur}
            />
            {userTip && <p className="text-xs text-gray-500 mt-1">{userTip}</p>}
            {userErr && <p className="text-xs text-red-600 mt-1">{userErr}</p>}
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

          {/* 确认密码 */}
          <div>
            <input
              className="w-full border px-3 py-2"
              placeholder="确认密码"
              type="password"
              value={pwd2}
              onChange={(e) => setPwd2(e.target.value)}
            />
            {pwd2Err && <p className="text-xs text-red-600 mt-1">{pwd2Err}</p>}
          </div>

          <button type="submit" className="w-full bg-green-600 text-white py-2 rounded">
            注册
          </button>
        </form>
        <p className="text-sm text-center mt-4">
          已有账号？<a href="/auth/login" className="text-blue-600">去登录</a>
        </p>
      </div>
    </div>
  );
}