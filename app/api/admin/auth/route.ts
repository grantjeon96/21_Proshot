import { NextRequest, NextResponse } from "next/server";
import redis from "@/app/lib/redis";

const ADMIN_PASSWORD_KEY = "proshot:admin_password";
const DEFAULT_PASSWORD = "proshot1234";

async function getAdminPassword(): Promise<string> {
  try {
    const password = await redis.get<string>(ADMIN_PASSWORD_KEY);
    if (password) return password;
  } catch (e) {
    console.error("Error reading admin password from Redis:", e);
  }
  return process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;
}

async function saveAdminPassword(password: string) {
  try {
    await redis.set(ADMIN_PASSWORD_KEY, password);
  } catch (e) {
    console.error("Error saving admin password to Redis:", e);
    throw e;
  }
}

// POST: Verify password
export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const currentPassword = await getAdminPassword();

    if (password === currentPassword) {
      return NextResponse.json({ success: true, message: "인증에 성공했습니다." });
    }

    return NextResponse.json(
      { error: "비밀번호가 일치하지 않습니다." },
      { status: 401 }
    );
  } catch {
    return NextResponse.json({ error: "인증 처리 실패" }, { status: 500 });
  }
}

// PUT: Change password
export async function PUT(req: NextRequest) {
  try {
    const { currentPassword, newPassword } = await req.json();
    const existingPassword = await getAdminPassword();

    if (currentPassword !== existingPassword) {
      return NextResponse.json(
        { error: "현재 비밀번호가 일치하지 않습니다." },
        { status: 401 }
      );
    }

    if (!newPassword || newPassword.length < 4) {
      return NextResponse.json(
        { error: "새 비밀번호는 최소 4자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    await saveAdminPassword(newPassword);
    return NextResponse.json({
      success: true,
      message: "비밀번호가 성공적으로 변경되었습니다. 다음 로그인부터 적용됩니다.",
    });
  } catch {
    return NextResponse.json({ error: "비밀번호 변경 실패" }, { status: 500 });
  }
}
