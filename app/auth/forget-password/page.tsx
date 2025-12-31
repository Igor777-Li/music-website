"use client";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [ident, setIdent] = useState(""); // 用户名或 UID
  const [reason, setReason] = useState(""); // 申请理由
  const [identTip, setIdentTip] = useState("");
  const [reasonTip, setReasonTip] = useState("");
  const [identErr, setIdentErr] = useState("");
  const [reasonErr, setReasonErr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{success: boolean, message: string} | null>(null);

  // 焦点事件
  const onIdentFocus = () => setIdentTip("请输入您的用户名或 8 位 UID");
  const onReasonFocus = () => setReasonTip("请简要说明您忘记密码的情况");
  const onIdentBlur = () => setIdentTip("");
  const onReasonBlur = () => setReasonTip("");

  // 前端校验
  const validate = () => {
    let ok = true;

    // 用户名/UID 校验
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

    // 申请理由校验
    if (!reason.trim()) {
      setReasonErr('申请理由不能为空');
      ok = false;
    } else if (reason.trim().length < 5) {
      setReasonErr('申请理由至少需要5个字符');
      ok = false;
    } else {
      setReasonErr('');
    }

    return ok;
  };

  // 提交申请
  const submitApplication = async () => {
    if (!validate()) return;

    setSubmitting(true);
    setSubmitResult(null);

    try {
      const isUid = /^\d{8}$/.test(ident.trim());
      const body = isUid
        ? JSON.stringify({ uid: ident.trim(), reason: reason.trim() })
        : JSON.stringify({ username: ident.trim(), reason: reason.trim() });

      const res = await fetch("http://8.134.159.152:3355/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      const data = await res.json();
      
      if (data.ok) {
        setSubmitResult({
          success: true,
          message: "密码重置申请已提交！管理员审核通过后，您的密码将被重置为 123456ab"
        });
        setIdent("");
        setReason("");
      } else {
        setSubmitResult({
          success: false,
          message: data.msg || "提交失败，请稍后重试"
        });
      }
    } catch (error) {
      setSubmitResult({
        success: false,
        message: "网络错误，请检查网络连接"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-96 border p-6 rounded">
        <h1 className="text-xl mb-2">忘记密码</h1>
        <p className="text-sm text-gray-500 mb-4">
          提交密码重置申请，管理员审核通过后会将您的密码重置为 <strong>123456ab</strong>
        </p>

        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); submitApplication(); }}>
          {/* 用户名/UID */}
          <div>
            <label className="block text-sm font-medium mb-1">用户名或 UID *</label>
            <input
              className="w-full border px-3 py-2 rounded"
              placeholder="请输入用户名或 8 位 UID"
              value={ident}
              onChange={(e) => setIdent(e.target.value)}
              onFocus={onIdentFocus}
              onBlur={onIdentBlur}
              disabled={submitting}
            />
            {identTip && <p className="text-xs text-gray-500 mt-1">{identTip}</p>}
            {identErr && <p className="text-xs text-red-600 mt-1">{identErr}</p>}
          </div>

          {/* 申请理由 */}
          <div>
            <label className="block text-sm font-medium mb-1">申请理由 *</label>
            <textarea
              className="w-full border px-3 py-2 rounded h-32 resize-none"
              placeholder="请简要说明您忘记密码的情况，以便管理员审核"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              onFocus={onReasonFocus}
              onBlur={onReasonBlur}
              disabled={submitting}
            />
            {reasonTip && <p className="text-xs text-gray-500 mt-1">{reasonTip}</p>}
            {reasonErr && <p className="text-xs text-red-600 mt-1">{reasonErr}</p>}
            <p className="text-xs text-gray-500 mt-1">当前长度: {reason.length} 字符</p>
          </div>

          {/* 提交按钮 */}
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={submitting}
          >
            {submitting ? "提交中..." : "提交申请"}
          </button>

          {/* 返回登录链接 */}
          <div className="text-center mt-2">
            <a href="/auth/login" className="text-sm text-blue-600 hover:underline">
              返回登录
            </a>
          </div>

          {/* 提交结果提示 */}
          {submitResult && (
            <div className={`p-3 rounded text-sm mt-2 ${submitResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {submitResult.message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}