"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");

    if (!paymentKey || !orderId || !amount) {
      setStatus("error");
      setErrorMsg("결제 정보가 올바르지 않습니다.");
      return;
    }

    async function confirmPayment() {
      try {
        const res = await fetch("/api/payment/confirm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: Number(amount),
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "결제 승인 중 오류가 발생했습니다.");
        }

        // Store paid status locally
        localStorage.setItem("proshot_is_paid", "true");
        setStatus("success");

        // Redirect back to main upload section after short delay
        setTimeout(() => {
          router.push("/#upload");
        }, 1500);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "결제 승인 처리 오류";
        setStatus("error");
        setErrorMsg(msg);
      }
    }

    confirmPayment();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl text-center border border-slate-100">
        {status === "loading" && (
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
            <h2 className="text-lg font-bold text-slate-800">결제를 승인하고 있습니다...</h2>
            <p className="text-xs text-slate-400 mt-2">잠시만 기다려 주세요.</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center animate-fade-in">
            <div className="h-14 w-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900">결제가 완료되었습니다!</h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              고화질 다운로드 권한이 승인되었습니다.<br />잠시 후 메인 페이지로 이동하여 파일이 다운로드됩니다.
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center animate-fade-in">
            <div className="h-14 w-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900">결제 실패</h2>
            <p className="text-xs text-rose-500 mt-2 font-medium">{errorMsg}</p>
            <button
              onClick={() => router.push("/#upload")}
              className="mt-6 w-full rounded-2xl bg-slate-900 py-3 text-xs font-bold text-white hover:bg-slate-800 transition-all"
            >
              메인으로 돌아가기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
