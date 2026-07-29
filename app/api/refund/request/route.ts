import { NextRequest, NextResponse } from "next/server";
import redis from "@/app/lib/redis";

export interface RefundRecord {
  id: string;
  orderId: string;
  email: string;
  reason: string;
  details: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  refundedAt?: string;
  rejectReason?: string;
  // Toss verified payment details
  tossVerified?: boolean;
  amount?: number;
  method?: string;
  paymentKey?: string;
  tossApprovedAt?: string;
}

const REFUNDS_KEY = "proshot:refunds";

async function getRefunds(): Promise<RefundRecord[]> {
  try {
    const data = await redis.get<RefundRecord[]>(REFUNDS_KEY);
    return data || [];
  } catch (err) {
    console.error("Error reading refunds from Redis:", err);
    return [];
  }
}

async function saveRefunds(records: RefundRecord[]) {
  try {
    await redis.set(REFUNDS_KEY, records);
  } catch (err) {
    console.error("Error saving refunds to Redis:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, email, reason, details } = body;

    if (!orderId || !email || !reason) {
      return NextResponse.json(
        { error: "주문번호, 이메일, 환불 사유를 모두 입력해 주세요." },
        { status: 400 }
      );
    }

    const cleanOrderId = orderId.trim();
    const secretKey = process.env.TOSS_SECRET_KEY || "test_sk_DnyRpQWGrNzpaAn6oJ7grKwv1M9E";
    const basicToken = Buffer.from(`${secretKey}:`).toString("base64");

    // 1. Verify orderId against Toss Payments API
    let tossData: {
      status?: string;
      totalAmount?: number;
      method?: string;
      paymentKey?: string;
      approvedAt?: string;
      message?: string;
      code?: string;
    } | null = null;

    try {
      const tossCheckRes = await fetch(
        `https://api.tosspayments.com/v1/payments/orders/${cleanOrderId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Basic ${basicToken}`,
          },
        }
      );

      if (!tossCheckRes.ok) {
        const errData = await tossCheckRes.json();
        console.warn("Toss payment verification failed:", errData);

        return NextResponse.json(
          {
            error: `입력하신 주문번호(${cleanOrderId})는 토스페이먼츠에 결제 내역이 존재하지 않는 가짜/유효하지 않은 주문번호입니다. 결제 완료 화면이나 이메일의 실제 주문번호를 확인해 주세요.`,
          },
          { status: 400 }
        );
      }

      tossData = await tossCheckRes.json();
    } catch (checkErr) {
      console.error("Failed to reach Toss Payments API:", checkErr);
      return NextResponse.json(
        { error: "토스 결제 내역 검증 중 네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." },
        { status: 500 }
      );
    }

    if (!tossData || tossData.status === "CANCELED") {
      return NextResponse.json(
        { error: "해당 주문번호의 결제건은 이미 결제 취소(환불)가 완료된 상태입니다." },
        { status: 400 }
      );
    }

    if (tossData.status !== "DONE") {
      return NextResponse.json(
        { error: `해당 주문번호는 정상 결제 완료(DONE) 상태가 아닙니다. (현재 상태: ${tossData.status || "미완료"})` },
        { status: 400 }
      );
    }

    // 2. Check duplicate pending or approved requests
    const refunds = await getRefunds();
    const existing = refunds.find(
      (r) => r.orderId.trim() === cleanOrderId && r.status !== "rejected"
    );

    if (existing) {
      if (existing.status === "approved") {
        return NextResponse.json(
          { error: "해당 주문번호는 이미 환불 승인 처리가 완료되었습니다." },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "해당 주문번호로 이미 환불 신청이 접수되어 관리자 검토 중입니다." },
        { status: 400 }
      );
    }

    // 3. Create verified refund record
    const newRecord: RefundRecord = {
      id: `ref_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      orderId: cleanOrderId,
      email: email.trim(),
      reason: reason.trim(),
      details: (details || "").trim(),
      status: "pending",
      createdAt: new Date().toISOString(),
      tossVerified: true,
      amount: tossData.totalAmount || 4900,
      method: tossData.method || "카드",
      paymentKey: tossData.paymentKey,
      tossApprovedAt: tossData.approvedAt,
    };

    refunds.unshift(newRecord);
    await saveRefunds(refunds);

    return NextResponse.json({
      success: true,
      message: "실제 토스 결제 내역 확인 완료! 환불 신청이 성공적으로 접수되었습니다. 대표님 검토 후 24시간 이내 결제가 자동 취소됩니다.",
      refund: newRecord,
    });
  } catch (error: unknown) {
    console.error("Refund request error:", error);
    return NextResponse.json(
      { error: "환불 신청 접수 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function GET() {
  const refunds = await getRefunds();
  return NextResponse.json({ refunds });
}
