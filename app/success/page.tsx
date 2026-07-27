"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import RefundModal from "../components/RefundModal";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [orderIdVal, setOrderIdVal] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);

  useEffect(() => {
    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");

    if (orderId) setOrderIdVal(orderId);

    // Get saved image URL from localStorage
    const savedImg = localStorage.getItem("proshot_generated_image");
    if (savedImg) setImageUrl(savedImg);

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
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "결제 승인 처리 오류";
        setStatus("error");
        setErrorMsg(msg);
      }
    }

    confirmPayment();
  }, [searchParams]);

  const handleDownload = async () => {
    if (!imageUrl) return;
    setIsDownloading(true);
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `proshot_passport_photo_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(imageUrl, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl text-center border border-slate-100 animate-fade-in">
        {status === "loading" && (
          <div className="flex flex-col items-center py-6">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
            <h2 className="text-lg font-bold text-slate-800">결제를 승인하고 있습니다...</h2>
            <p className="text-xs text-slate-400 mt-2">잠시만 기다려 주세요.</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center animate-scale-in">
            <div className="h-14 w-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>

            <h2 className="text-xl font-extrabold text-slate-900">결제가 완료되었습니다! 🎉</h2>
            <p className="text-xs text-slate-500 mt-1">
              외교부 규격 300 DPI 초고화질 여권사진이 준비되었습니다.
            </p>

            {/* Photo preview */}
            {imageUrl && (
              <div className="mt-5 w-48 mx-auto rounded-2xl overflow-hidden border-2 border-indigo-100 shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="결제 완료 여권사진" className="w-full aspect-[3/4] object-cover" />
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-6 w-full flex flex-col gap-3">
              {imageUrl && (
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 text-center text-xs font-bold text-white hover:bg-indigo-500 active:scale-95 transition-all shadow-lg shadow-indigo-600/25 disabled:opacity-70"
                >
                  {isDownloading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                      <span>다운로드 준비 중...</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                      <span>300 DPI 초고화질 사진 저장하기</span>
                    </>
                  )}
                </button>
              )}

              <button
                onClick={() => router.push("/#upload")}
                className="w-full rounded-2xl border border-slate-200 py-3 text-center text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all"
              >
                메인 페이지로 이동
              </button>
            </div>

            {/* Refund & Guarantee Info */}
            <div className="mt-6 pt-4 border-t border-slate-100 text-left text-[11px] text-slate-400 space-y-1">
              <p>• 주문번호: <span className="font-mono text-slate-600 font-bold">{orderIdVal || "주문완료"}</span></p>
              <div className="flex items-center justify-between pt-1">
                <span>• 규격 미승인 시 100% 전액 환불 보장</span>
                <button
                  onClick={() => setShowRefundModal(true)}
                  className="font-bold text-indigo-600 hover:underline"
                >
                  환불 신청 →
                </button>
              </div>
            </div>

            <RefundModal
              isOpen={showRefundModal}
              onClose={() => setShowRefundModal(false)}
              defaultOrderId={orderIdVal}
            />
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
