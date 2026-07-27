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

function getRefunds(): RefundRecord[] {
  try {
    if (!fs.existsSync(dataFilePath)) {
      fs.mkdirSync(path.dirname(dataFilePath), { recursive: true });
      fs.writeFileSync(dataFilePath, "[]", "utf-8");
      return [];
    }
    const content = fs.readFileSync(dataFilePath, "utf-8");
    return JSON.parse(content || "[]");
  } catch (err) {
    console.error("Error reading refunds data:", err);
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
    const { orderId, email, reason, details } = body;

    if (!orderId || !email || !reason) {
      return NextResponse.json(
        { error: "주문번호, 이메일, 환불 사유를 모두 입력해 주세요." },
        { status: 400 }
      );
    }

    const refunds = getRefunds();

    // Check duplicate pending or approved requests
    const existing = refunds.find(
      (r) => r.orderId.trim() === orderId.trim() && r.status !== "rejected"
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

    const newRecord: RefundRecord = {
      id: `ref_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      orderId: orderId.trim(),
      email: email.trim(),
      reason: reason.trim(),
      details: (details || "").trim(),
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    refunds.unshift(newRecord);
    saveRefunds(refunds);

    return NextResponse.json({
      success: true,
      message: "환불 신청이 성공적으로 접수되었습니다. 관리자 검토 후 24시간 이내 결과가 안내됩니다.",
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
  const refunds = getRefunds();
  return NextResponse.json({ refunds });
}
