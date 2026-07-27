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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "proshot1234") {
      setIsAuthenticated(true);
      setMessage(null);
    } else {
      setMessage({ text: "비밀번호가 일치하지 않습니다.", type: "error" });
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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-slate-800 rounded-3xl p-6 shadow-2xl border border-slate-700 text-center">
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
              placeholder="비밀번호 입력 (기본: proshot1234)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
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
    </div>
  );
}
