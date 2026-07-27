"use client";

import React, { useState, useRef, ChangeEvent, DragEvent, useEffect, useCallback } from "react";
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";

export type StyleType = "corporate" | "studio" | "outdoor";

interface StyleOption {
  value: StyleType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

interface Toast {
  id: number;
  message: string;
  type: "error" | "success";
  leaving?: boolean;
}

// Toss Payments Client Key (Reads from .env.local NEXT_PUBLIC_TOSS_CLIENT_KEY first)
const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";

export default function UploadCard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<StyleType>("corporate");
  const [isDragActive, setIsDragActive] = useState<boolean>(false);

  // API and Result states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  // Free generation limit state (2 free generations)
  const [usesCount, setUsesCount] = useState<number>(0);
  const [showLimitModal, setShowLimitModal] = useState<boolean>(false);

  // Payment modal state (downloads require payment)
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);

  // Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  // Download loading
  const [isDownloading, setIsDownloading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Toast helpers ──
  const showToast = useCallback((message: string, type: "error" | "success" = "error") => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, leaving: true } : t))
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 300);
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, leaving: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const executeDownload = useCallback(async () => {
    if (!generatedImageUrl) return;
    setIsDownloading(true);
    try {
      const res = await fetch(generatedImageUrl);
      const blobData = await res.blob();
      const url = URL.createObjectURL(blobData);
      const a = document.createElement("a");
      a.href = url;
      a.download = "proshot-passport-photo.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("고화질 여권사진이 다운로드되었습니다.", "success");
    } catch {
      showToast("다운로드 중 오류가 발생했습니다. 다시 시도해 주세요.");
      window.open(generatedImageUrl, "_blank");
    } finally {
      setIsDownloading(false);
    }
  }, [generatedImageUrl, showToast]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const uses = localStorage.getItem("proshot_uses");
      if (uses) {
        setUsesCount(parseInt(uses, 10));
      } else {
        localStorage.setItem("proshot_uses", "0");
      }

      const paidStatus = localStorage.getItem("proshot_is_paid");
      if (paidStatus === "true") {
        setIsPaid(true);
      }
    }
  }, []);

  // Trigger auto-download if redirected back after payment
  useEffect(() => {
    if (isPaid && generatedImageUrl) {
      executeDownload();
    }
  }, [isPaid, generatedImageUrl, executeDownload]);

  const styleOptions: StyleOption[] = [
    {
      value: "corporate",
      label: "비즈니스 정장",
      description: "단정하고 전문적인 수트 스타일",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      value: "studio",
      label: "스튜디오",
      description: "클래식하고 깔끔한 실내 조명",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      value: "outdoor",
      label: "야외 자연광",
      description: "화사하고 내추럴한 야외 배경",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
      ),
    },
  ];

  const validateAndProcessFile = (file: File) => {
    const fileName = file.name.toLowerCase();
    if (fileName.endsWith(".heic") || fileName.endsWith(".heif") || file.type.includes("heic") || file.type.includes("heif")) {
      showToast("아이폰 HEIC 파일은 AI 변환이 어렵습니다. JPG 또는 PNG 사진으로 업로드해 주세요!", "error");
      return;
    }

    if (!file.type.startsWith("image/")) {
      showToast("이미지 파일(PNG, JPG, JPEG 등)만 업로드할 수 있습니다.");
      return;
    }

    const maxSize = 8 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast("파일 크기는 최대 8MB 이하여야 합니다.");
      return;
    }

    setSelectedFile(file);

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setBase64Image(reader.result);
      }
    };
    reader.onerror = () => {
      showToast("파일을 읽는 과정에서 오류가 발생했습니다.");
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setBase64Image(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // ── Generate Image API Request (2 free attempts) ──
  const handleGenerate = async () => {
    if (!base64Image) return;

    if (usesCount >= 2) {
      setShowLimitModal(true);
      return;
    }

    setIsLoading(true);
    setGeneratedImageUrl(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageBase64: base64Image,
          style: selectedStyle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "알 수 없는 오류가 발생했습니다.");
      }

      setGeneratedImageUrl(data.imageUrl);
      showToast("여권사진이 성공적으로 생성되었습니다!", "success");

      const newUses = usesCount + 1;
      setUsesCount(newUses);
      localStorage.setItem("proshot_uses", String(newUses));
    } catch (err: unknown) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "사진 생성 과정에서 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
      showToast(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Download Trigger (Requires Payment) ──
  const handleDownloadClick = () => {
    if (!generatedImageUrl) return;

    if (!isPaid) {
      setShowPaymentModal(true);
    } else {
      executeDownload();
    }
  };

  // ── Toss Payments Standard Integration (SDK v2 – uses test_ck_ key) ──
  const handleTossPayment = async () => {
    setIsProcessingPayment(true);
    try {
      const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);
      const payment = tossPayments.payment({ customerKey: ANONYMOUS });
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const origin = window.location.origin;

      await payment.requestPayment({
        method: "CARD",
        amount: {
          currency: "KRW",
          value: 4900,
        },
        orderId,
        orderName: "ProShot 고화질 여권사진 다운로드",
        successUrl: `${origin}/success`,
        failUrl: `${origin}/#upload`,
      });
    } catch (err: unknown) {
      setIsProcessingPayment(false);
      console.error("Toss Payments Error:", err);
      const msg = err instanceof Error ? err.message : "결제 창 호출 실패";
      if (!msg.includes("취소")) {
        showToast(msg);
      }
    }
  };

  const handleRegenerate = () => {
    setGeneratedImageUrl(null);
    handleGenerate();
  };

  const handleChangeStyle = () => {
    setGeneratedImageUrl(null);
  };

  const handleFullReset = () => {
    setGeneratedImageUrl(null);
    handleRemoveImage();
  };

  const getStyleLabel = (style: StyleType): string => {
    const found = styleOptions.find((o) => o.value === style);
    return found ? found.label : style;
  };

  return (
    <div className="w-full max-w-2xl relative">
      {/* ═══ Toast Notifications ═══ */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none w-full max-w-sm px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto w-full flex items-start gap-3 rounded-2xl border px-4 py-3.5 shadow-lg backdrop-blur-sm cursor-pointer transition-all ${
              toast.leaving ? "animate-toast-out" : "animate-toast-in"
            } ${
              toast.type === "error"
                ? "bg-rose-50/95 border-rose-200/60 text-rose-700"
                : "bg-emerald-50/95 border-emerald-200/60 text-emerald-700"
            }`}
            onClick={() => dismissToast(toast.id)}
          >
            {toast.type === "error" ? (
              <svg className="h-5 w-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ) : (
              <svg className="h-5 w-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            )}
            <span className="text-xs font-semibold leading-relaxed">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* ═══ Main Card ═══ */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-200/40 md:p-8 relative overflow-hidden">

        {/* ═══ LOADING STATE ═══ */}
        {isLoading && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md px-6 mb-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-100 p-3">
                  <div className="aspect-[3/4] rounded-xl animate-shimmer"></div>
                  <div className="mt-3 h-3 w-16 rounded-full animate-shimmer"></div>
                </div>
                <div className="rounded-2xl border border-slate-100 p-3">
                  <div className="aspect-[3/4] rounded-xl animate-shimmer"></div>
                  <div className="mt-3 h-3 w-20 rounded-full animate-shimmer"></div>
                </div>
              </div>
            </div>

            <div className="relative flex h-16 w-16 items-center justify-center">
              <span className="absolute h-14 w-14 animate-ping rounded-full bg-indigo-100 opacity-50"></span>
              <span className="relative flex h-9 w-9 animate-spin rounded-full border-[3px] border-indigo-200 border-t-indigo-600"></span>
            </div>
            <p className="mt-5 text-sm font-bold text-slate-800 animate-pulse">
              여권사진을 만드는 중...
            </p>
            <p className="mt-1.5 text-[11px] text-slate-400">
              외교부 규격에 맞춰 정밀 보정하고 있습니다 (약 15초 소요)
            </p>
          </div>
        )}

        {/* ═══ RESULT STATE — Before/After Comparison ═══ */}
        {generatedImageUrl ? (
          <div className="flex flex-col items-center animate-fade-in">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 mb-3">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              여권사진 생성 완료!
            </span>
            <h3 className="text-lg font-bold text-slate-900 md:text-xl">당신의 완벽한 여권사진</h3>
            <p className="mt-1 text-[11px] text-slate-400 max-w-sm text-center">
              스타일: {getStyleLabel(selectedStyle)} · 원본과 비교해 보세요
            </p>

            {/* Before / After Cards */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 w-full max-w-lg animate-slide-up">
              {/* Before */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-2.5 sm:p-3 shadow-sm">
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
                  {previewUrl && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={previewUrl}
                      alt="원본 셀카"
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="mt-2.5 flex items-center gap-1.5 px-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                  <span className="text-xs font-semibold text-slate-500">원본</span>
                </div>
              </div>

              {/* After */}
              <div className="rounded-2xl border border-indigo-100/80 bg-indigo-50/20 p-2.5 sm:p-3 shadow-sm shadow-indigo-100/30">
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border-2 border-indigo-100 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={generatedImageUrl}
                    alt="생성된 여권사진"
                    className="h-full w-full object-cover"
                  />
                  {!isPaid && (
                    <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] flex items-center justify-center">
                      <span className="bg-slate-900/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md">
                        🔒 다운로드 시 결제 필요
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-2.5 flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                    <span className="text-xs font-bold text-indigo-700">여권사진 (완성)</span>
                  </div>
                  {isPaid && (
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                      결제완료
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col gap-3 w-full max-w-lg animate-slide-up" style={{ animationDelay: "0.1s" }}>
              {/* Primary: PNG 다운로드 (결제 필요 시 토스페이먼츠 연동 모달) */}
              <button
                onClick={handleDownloadClick}
                disabled={isDownloading}
                className="group w-full inline-flex items-center justify-center gap-2.5 rounded-2xl bg-indigo-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-600/10 transition-all duration-300 hover:bg-indigo-500 hover:shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-60"
              >
                {isDownloading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                ) : (
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                )}
                <span>{isPaid ? "PNG 고화질 다운로드" : "다운로드하기 (₩4,900)"}</span>
              </button>

              {/* Secondary row */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleRegenerate}
                  className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-xs font-bold text-slate-600 transition-all duration-300 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98]"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                  </svg>
                  <span>다시 생성</span>
                </button>
                <button
                  onClick={handleChangeStyle}
                  className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-xs font-bold text-slate-600 transition-all duration-300 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98]"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                  </svg>
                  <span>스타일 바꾸기</span>
                </button>
              </div>

              <button
                onClick={handleFullReset}
                className="text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-colors py-1 text-center"
              >
                새로운 사진으로 시작하기 →
              </button>
            </div>
          </div>
        ) : (
          /* ═══ UPLOAD & CONFIGURATION UI ═══ */
          <>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">셀카 업로드 및 스타일 선택</h3>
              <p className="mt-1.5 text-xs text-slate-500">
                귀가 잘 보이고 정면을 바라보는 정직한 각도의 사진이 가장 잘 나옵니다. (최대 8MB)
              </p>
            </div>

            {/* Free Limit Counter Indicator */}
            <div className="mb-6 flex items-center justify-between rounded-2xl bg-slate-50 border border-slate-200/50 px-4 py-3 text-xs">
              <span className="text-slate-600 font-medium">
                무료 생성 남은 횟수: <strong className="text-indigo-600">{Math.max(0, 2 - usesCount)}회</strong> / 2회
              </span>
              <span className="text-[10px] text-slate-400">다운로드 시 결제 필요</span>
            </div>

            {/* File Upload Zone */}
            <div className="mb-6">
              {!previewUrl ? (
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={triggerFileInput}
                  className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center cursor-pointer transition-all duration-300 ${
                    isDragActive
                      ? "border-indigo-600 bg-indigo-50/30"
                      : "border-slate-300 hover:border-indigo-500 hover:bg-slate-50/50"
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-600">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-slate-700">
                    클릭하여 사진을 선택하거나 드래그 앤 드롭
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    PNG, JPG, JPEG 형식만 지원 (최대 8MB)
                  </p>
                </div>
              ) : (
                <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-200/50 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                      <span className="text-xs font-semibold text-slate-600 truncate max-w-[200px] md:max-w-xs">
                        {selectedFile?.name}
                      </span>
                    </div>
                    <button
                      onClick={handleRemoveImage}
                      className="inline-flex items-center justify-center rounded-lg bg-white px-2 py-1 text-xs font-semibold text-rose-600 border border-slate-200 hover:bg-rose-50 hover:border-rose-100 transition-all active:scale-95"
                    >
                      삭제하기
                    </button>
                  </div>
                  <div className="flex justify-center">
                    <div className="relative h-44 w-44 overflow-hidden rounded-xl border border-slate-200 shadow-inner bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl}
                        alt="Selfie Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Style Picker */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                원하는 프로필 스타일 선택
              </label>
              <div className="grid gap-3.5 sm:grid-cols-3">
                {styleOptions.map((option) => {
                  const isSelected = selectedStyle === option.value;
                  return (
                    <div
                      key={option.value}
                      onClick={() => setSelectedStyle(option.value)}
                      className={`relative flex flex-col justify-between rounded-2xl border p-4 text-left cursor-pointer transition-all duration-300 ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/10 shadow-[0_4px_16px_rgba(79,70,229,0.06)]"
                          : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/20"
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute top-3.5 right-3.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white text-[10px]">
                          ✓
                        </span>
                      )}
                      <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                        isSelected ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500"
                      }`}>
                        {option.icon}
                      </div>
                      <div>
                        <h4 className={`text-sm font-bold ${isSelected ? "text-indigo-900" : "text-slate-800"}`}>
                          {option.label}
                        </h4>
                        <p className="mt-1 text-[11px] text-slate-400 leading-normal">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                onClick={handleGenerate}
                disabled={!base64Image}
                className={`w-full group inline-flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold text-white transition-all duration-300 ${
                  base64Image
                    ? "bg-indigo-600 shadow-lg shadow-indigo-600/10 hover:bg-indigo-500 hover:shadow-indigo-500/20 active:scale-[0.98]"
                    : "bg-slate-200 cursor-not-allowed text-slate-400"
                }`}
              >
                <span>여권사진 생성하기</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>

      {/* ═══ Free Limit Reached Modal ═══ */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 animate-scale-in text-center">
            <button
              onClick={() => setShowLimitModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h3 className="text-lg font-bold text-slate-900">무료 체험 2회를 모두 사용하셨습니다</h3>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed px-2">
              ProShot의 무료 생성 기회(2회)를 모두 사용하셨습니다. 추가 생성을 이용하시려면 정식 버전을 이용해 주세요.
            </p>

            <div className="mt-6">
              <button
                onClick={() => {
                  setShowLimitModal(false);
                  setShowPaymentModal(true);
                }}
                className="w-full rounded-2xl bg-indigo-600 py-3.5 text-center text-xs font-bold text-white hover:bg-indigo-500 active:scale-95 transition-all shadow-md"
              >
                토스페이먼츠로 결제하기 (₩4,900)
              </button>
              <button
                onClick={() => setShowLimitModal(false)}
                className="mt-2.5 w-full rounded-2xl border border-slate-200 py-3 text-center text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Payment Required Modal (Real Toss Payments Integration) ═══ */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 animate-scale-in text-center">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </div>

            <h3 className="text-lg font-bold text-slate-900">고화질 여권사진 다운로드</h3>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed px-2">
              외교부 공식 규격(3.5x4.5cm) 300 DPI 초고화질 인화용 및 온라인 여권 신청용 파일 다운로드는 결제 후 이용 가능합니다.
            </p>

            <div className="mt-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 p-4 text-left">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                <span>ProShot 여권사진 인화용 패키지</span>
                <span className="text-indigo-600 text-base">₩4,900</span>
              </div>
              <ul className="mt-2 space-y-1 text-[11px] text-slate-500">
                <li>✓ 외교부 규격 비율 자동 준수</li>
                <li>✓ 300 DPI 초고화질 PNG 다운로드</li>
                <li>✓ 민원센터 규격 미승인 시 100% 환불 보장</li>
                <li>✓ 신용카드 / 카카오페이 / 토스페이 지원</li>
              </ul>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={handleTossPayment}
                disabled={isProcessingPayment}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 text-center text-xs font-bold text-white hover:bg-indigo-500 active:scale-95 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-75"
              >
                {isProcessingPayment ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                    <span>토스페이먼츠 연동 중...</span>
                  </>
                ) : (
                  <span>₩4,900 토스페이먼츠로 결제하기</span>
                )}
              </button>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-full rounded-2xl border border-slate-200 py-3 text-center text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all"
              >
                나중에 하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
