import { NextRequest, NextResponse } from "next/server";
import redis from "@/app/lib/redis";
import { RefundRecord } from "@/app/api/refund/request/route";

const REFUNDS_KEY = "proshot:refunds";
const ADMIN_PASSWORD_KEY = "proshot:admin_password";

async function getAdminPassword(): Promise<string> {
  try {
    const password = await redis.get<string>(ADMIN_PASSWORD_KEY);
    if (password) return password;
  } catch {}
  return process.env.ADMIN_PASSWORD || "proshot1234";
}

async function getRefunds(): Promise<RefundRecord[]> {
  try {
    const data = await redis.get<RefundRecord[]>(REFUNDS_KEY);
    return data || [];
  } catch {
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
    const { refundId, action, adminPassword, rejectReason } = body;

    // 1. Validate admin password
    const currentPassword = await getAdminPassword();
    if (adminPassword !== currentPassword) {
      return NextResponse.json(
        { error: "관리자 비밀번호가 일치하지 않습니다." },
        { status: 401 }
      );
    }

    if (!refundId || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "올바르지 않은 요청입니다." },
        { status: 400 }
      );
    }

    const refunds = await getRefunds();
    const index = refunds.findIndex((r) => r.id === refundId);

    if (index === -1) {
      return NextResponse.json(
        { error: "해당 환불 신청건을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const record = refunds[index];

    if (action === "approve") {
      // Execute Toss Payments cancellation API using secretKey and orderId/cancel
      const secretKey = process.env.TOSS_SECRET_KEY || "test_sk_DnyRpQWGrNzpaAn6oJ7grKwv1M9E";
      const basicToken = Buffer.from(`${secretKey}:`).toString("base64");

      const tossRes = await fetch(
        `https://api.tosspayments.com/v1/payments/orders/${record.orderId}/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${basicToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cancelReason: `대표님 환불 승인: ${record.reason}`,
          }),
        }
      );

      const tossData = await tossRes.json();

      if (!tossRes.ok) {
        console.error("Toss Payment cancellation failed:", tossData);
        return NextResponse.json(
          {
            error: `토스 결제 취소 실패: ${tossData.message || "토스페이먼츠 결제 취소 중 오류가 발생했습니다."} (코드: ${tossData.code || "UNKNOWN"})`,
          },
          { status: 400 }
        );
      }

      record.status = "approved";
      record.refundedAt = new Date().toISOString();
    } else if (action === "reject") {
      record.status = "rejected";
      record.rejectReason = rejectReason || "대표님 검토 결과 환불 요건 미충족";
    }

    refunds[index] = record;
    await saveRefunds(refunds);

    return NextResponse.json({
      success: true,
      message: action === "approve"
        ? `주문번호(${record.orderId}) 토스페이먼츠 결제 취소 승인 완료! 고객 카드/간편결제가 자동 환불되었습니다.`
        : "환불 신청이 거절 처리되었습니다.",
      refund: record,
    });
  } catch (error: unknown) {
    console.error("Refund approval error:", error);
    return NextResponse.json(
      { error: "환불 상태 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
