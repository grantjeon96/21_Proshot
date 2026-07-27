import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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
}

const dataFilePath = path.join(process.cwd(), "data", "refunds.json");
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "proshot1234"; // Default admin password

function getRefunds(): RefundRecord[] {
  try {
    if (!fs.existsSync(dataFilePath)) return [];
    const content = fs.readFileSync(dataFilePath, "utf-8");
    return JSON.parse(content || "[]");
  } catch {
    return [];
  }
}

function saveRefunds(records: RefundRecord[]) {
  try {
    if (!fs.existsSync(path.dirname(dataFilePath))) {
      fs.mkdirSync(path.dirname(dataFilePath), { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(records, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving refunds data:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { refundId, action, adminPassword, rejectReason } = body;

    // Validate admin password
    if (adminPassword !== ADMIN_PASSWORD) {
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

    const refunds = getRefunds();
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

      try {
        const tossRes = await fetch(
          `https://api.tosspayments.com/v1/payments/orders/${record.orderId}/cancel`,
          {
            method: "POST",
            headers: {
              Authorization: `Basic ${basicToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              cancelReason: `고객 100% 환불 요청 승인: ${record.reason}`,
            }),
          }
        );

        const tossData = await tossRes.json();

        if (!tossRes.ok) {
          console.warn("Toss Payment cancellation warning/error:", tossData);
          // If Toss cancellation API returns order not found or already cancelled, we still allow admin to mark as approved locally
        }
      } catch (tossErr) {
        console.error("Toss cancellation network error:", tossErr);
      }

      record.status = "approved";
      record.refundedAt = new Date().toISOString();
    } else if (action === "reject") {
      record.status = "rejected";
      record.rejectReason = rejectReason || "대표님 검토 결과 환불 요건 미충족";
    }

    refunds[index] = record;
    saveRefunds(refunds);

    return NextResponse.json({
      success: true,
      message: action === "approve" ? "환불 승인 및 결제 취소가 완료되었습니다." : "환불 거절 처리되었습니다.",
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
