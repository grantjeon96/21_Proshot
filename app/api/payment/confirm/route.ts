import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { paymentKey, orderId, amount } = await req.json();

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json(
        { error: "결제 승인 정보가 올바르지 않습니다." },
        { status: 400 }
      );
    }

    // Toss Payments Secret Key (Default to official test secret key if env is not set)
    const secretKey = process.env.TOSS_SECRET_KEY || "test_sk_zXL1z4JpXne6wQ24Bnv8W392qopA";
    const basicToken = Buffer.from(`${secretKey}:`).toString("base64");

    const response = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Toss Payments confirm failed:", data);
      return NextResponse.json(
        { error: data.message || "결제 승인에 실패했습니다." },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, payment: data });
  } catch (error: unknown) {
    console.error("Payment confirm error:", error);
    return NextResponse.json(
      { error: "결제 승인 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
