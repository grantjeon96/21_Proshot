import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const configPath = path.join(process.cwd(), "data", "admin-config.json");

function getAdminPassword(): string {
  try {
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, "utf-8");
      const data = JSON.parse(content);
      if (data && data.password) return data.password;
    }
  } catch (e) {
    console.error("Error reading admin config:", e);
  }
  return process.env.ADMIN_PASSWORD || "proshot1234";
}

function saveAdminPassword(password: string) {
  const dir = path.dirname(configPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(configPath, JSON.stringify({ password }, null, 2), "utf-8");
}

// POST: Verify password
export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const currentPassword = getAdminPassword();

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
    const existingPassword = getAdminPassword();

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

    saveAdminPassword(newPassword);
    return NextResponse.json({
      success: true,
      message: "비밀번호가 성공적으로 변경되었습니다. 다음 로그인부터 적용됩니다.",
    });
  } catch {
    return NextResponse.json({ error: "비밀번호 변경 실패" }, { status: 500 });
  }
}
