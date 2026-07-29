"use client";

import React, { useState, useEffect, useCallback } from "react";
import { RefundRecord } from "@/app/api/refund/request/route";

export default function AdminRefundsPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [refunds, setRefunds] = useState<RefundRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Change password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPwConfirm, setNewPwConfirm] = useState("");
  const [pwModalMsg, setPwModalMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isChangingPw, setIsChangingPw] = useState(false);

  const fetchRefunds = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/refund/request");
      const data = await res.json();
      if (res.ok && data.refunds) {
        setRefunds(data.refunds);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRefunds();
    }
  }, [isAuthenticated, fetchRefunds]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
      } else {
        setMessage({ text: data.error || "비밀번호가 일치하지 않습니다.", type: "error" });
      }
    } catch {
      setMessage({ text: "로그인 처리 중 오류가 발생했습니다.", type: "error" });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwModalMsg(null);

    if (newPw !== newPwConfirm) {
      setPwModalMsg({ text: "새 비밀번호가 일치하지 않습니다.", type: "error" });
      return;
    }

    if (newPw.length < 4) {
      setPwModalMsg({ text: "새 비밀번호는 최소 4자 이상 입력해 주세요.", type: "error" });
      return;
    }

    setIsChangingPw(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: currentPw,
          newPassword: newPw,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "비밀번호 변경 중 오류가 발생했습니다.");
      }

      setPwModalMsg({ text: "비밀번호가 성공적으로 변경되었습니다!", type: "success" });
      setPassword(newPw); // Update active session password
      setTimeout(() => {
        setShowPasswordModal(false);
        setCurrentPw("");
        setNewPw("");
        setNewPwConfirm("");
        setPwModalMsg(null);
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "비밀번호 변경 실패";
      setPwModalMsg({ text: msg, type: "error" });
    } finally {
      setIsChangingPw(false);
    }
  };

  const handleAction = async (refundId: string, action: "approve" | "reject") => {
    const confirmMsg =
      action === "approve"
        ? "이 환불 신청을 승인하고 토스페이먼츠 결제를 취소하시겠습니까?"
        : "이 환불 신청을 거절하시겠습니까?";

    if (!window.confirm(confirmMsg)) return;

    setProcessingId(refundId);
    setMessage(null);

    try {
      const res = await fetch("/api/refund/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          refundId,
          action,
          adminPassword: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "처리 중 오류가 발생했습니다.");
      }

      setMessage({ text: data.message, type: "success" });
      fetchRefunds();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "처리 실패";
      setMessage({ text: msg, type: "error" });
    } finally {
      setProcessingId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-800 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 text-2xl font-bold">
            🔒
          </div>
          <h2 className="text-lg font-bold text-white">대표님 환불 관리자 로그인</h2>
          <p className="text-xs text-slate-400 mt-1">관리자 비밀번호를 입력해 주세요.</p>

          {message && (
            <div className="mt-3 p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-medium">
              {message.text}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-5 space-y-3">
            <input
              type="password"
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              required
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/30"
            >
              로그인
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              🛡️ ProShot 환불 관리자 콘솔
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              고객 환불 신청 내역을 검토하고 [승인] 시 토스 결제를 즉시 취소합니다.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-medium text-indigo-400 hover:bg-slate-800 transition-all flex items-center gap-1.5"
            >
              🔑 비밀번호 변경
            </button>
            <button
              onClick={fetchRefunds}
              className="rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-all"
            >
              🔄 새로고침
            </button>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-medium text-rose-400 hover:bg-slate-800 transition-all"
            >
              로그아웃
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-2xl text-xs font-bold border ${
              message.type === "success"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-rose-500/10 text-rose-400 border-rose-500/30"
            }`}
          >
            {message.text}
          </div>
        )}

        {isLoading ? (
          <div className="py-20 text-center text-xs text-slate-500">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mx-auto mb-3"></div>
            환불 목록을 불러오는 중입니다...
          </div>
        ) : refunds.length === 0 ? (
          <div className="py-20 text-center bg-slate-900/50 rounded-3xl border border-slate-800/80">
            <p className="text-sm font-semibold text-slate-400">접수된 환불 신청 내역이 없습니다.</p>
            <p className="text-xs text-slate-600 mt-1">고객이 환불을 신청하면 이곳에 실시간으로 표시됩니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {refunds.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-5 transition-all hover:border-slate-700"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                        item.status === "pending"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : item.status === "approved"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      }`}
                    >
                      {item.status === "pending"
                        ? "⏳ 검토대기"
                        : item.status === "approved"
                        ? "✅ 환불승인완료"
                        : "❌ 거절됨"}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-200">{item.orderId}</span>
                    <span className="text-[11px] text-slate-500">
                      ({new Date(item.createdAt).toLocaleString("ko-KR")})
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1">
                    <p>
                      <strong className="text-slate-400">신청자 연락처:</strong> {item.email}
                    </p>
                    <p>
                      <strong className="text-slate-400">환불 사유:</strong>{" "}
                      <span className="text-indigo-300 font-semibold">{item.reason}</span>
                    </p>
                    {item.details && (
                      <p className="text-slate-400 text-[11px] bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 mt-1">
                        &quot;{item.details}&quot;
                      </p>
                    )}
                  </div>
                </div>

                {item.status === "pending" && (
                  <div className="flex items-center gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    <button
                      onClick={() => handleAction(item.id, "approve")}
                      disabled={processingId === item.id}
                      className="rounded-2xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 active:scale-95 transition-all shadow-md shadow-indigo-600/30 disabled:opacity-50"
                    >
                      {processingId === item.id ? "처리 중..." : "✓ 환불 승인"}
                    </button>
                    <button
                      onClick={() => handleAction(item.id, "reject")}
                      disabled={processingId === item.id}
                      className="rounded-2xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-all disabled:opacity-50"
                    >
                      거절
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 p-6 shadow-2xl border border-slate-800 text-left">
            <button
              onClick={() => setShowPasswordModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              🔑 비밀번호 변경
            </h3>
            <p className="text-xs text-slate-400 mb-4">관리자 콘솔 접속 비밀번호를 새로 설정합니다.</p>

            {pwModalMsg && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs font-medium ${
                  pwModalMsg.type === "success"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                }`}
              >
                {pwModalMsg.text}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">현재 비밀번호</label>
                <input
                  type="password"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">새 비밀번호</label>
                <input
                  type="password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">새 비밀번호 확인</label>
                <input
                  type="password"
                  value={newPwConfirm}
                  onChange={(e) => setNewPwConfirm(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={isChangingPw}
                  className="w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/30 disabled:opacity-50"
                >
                  {isChangingPw ? "변경 중..." : "비밀번호 변경 저장"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="w-full rounded-xl border border-slate-800 py-2 text-center text-xs font-medium text-slate-400 hover:bg-slate-800 transition-all"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
