"use client";

import React, { useState } from "react";

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultOrderId?: string;
}

export default function RefundModal({ isOpen, onClose, defaultOrderId = "" }: RefundModalProps) {
  const [orderId, setOrderId] = useState(defaultOrderId);
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("민원센터 규격 미승인");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  React.useEffect(() => {
    if (defaultOrderId) setOrderId(defaultOrderId);
    const savedEmail = localStorage.getItem("proshot_customer_email");
    if (savedEmail) setEmail(savedEmail);
  }, [defaultOrderId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) {
      setMessage({ text: "결제 시 발급받으신 주문번호를 입력해 주세요.", type: "error" });
      return;
    }
    if (!email.trim()) {
      setMessage({ text: "안내받으실 이메일 또는 연락처를 입력해 주세요.", type: "error" });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/refund/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderId.trim(),
          email: email.trim(),
          reason,
          details: details.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "환불 신청 처리 중 오류가 발생했습니다.");
      }

      setMessage({ text: data.message || "환불 신청이 정상적으로 접수되었습니다.", type: "success" });
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "환불 신청 접수 실패";
      setMessage({ text: msg, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 animate-scale-in text-left">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 font-bold">
            🛡️
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">100% 규격 승인 환불 신청</h3>
            <p className="text-[11px] text-slate-500">관리자 검토 후 즉시 결제가 취소됩니다.</p>
          </div>
        </div>

        {message && (
          <div
            className={`mt-3 p-3 rounded-2xl text-xs font-medium ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              주문번호 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="예: order_172209... (결제 시 발급된 주문번호)"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              신청자 이메일 / 연락처 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="환불 안내를 받으실 이메일 또는 연락처"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">환불 신청 사유</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="민원센터 규격 미승인">민원센터 여권사진 규격 미승인</option>
              <option value="합성 화질 및 품질 불만족">합성 화질 및 품질 불만족</option>
              <option value="중복 결제 또는 실수 결제">중복 결제 또는 실수 결제</option>
              <option value="기타 사유">기타 사유</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">상세 사유 설명 (선택)</label>
            <textarea
              rows={2}
              placeholder="민원센터 거부 사유나 요청사항을 자유롭게 작성해 주세요."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
            />
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3 text-center text-xs font-bold text-white hover:bg-indigo-500 active:scale-95 transition-all shadow-md shadow-indigo-600/20 disabled:opacity-75"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                  <span>접수 처리 중...</span>
                </>
              ) : (
                <span>100% 환불 신청 접수하기</span>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-2xl border border-slate-200 py-2.5 text-center text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
