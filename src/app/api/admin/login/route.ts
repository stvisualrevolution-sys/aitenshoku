import { NextRequest, NextResponse } from "next/server";
import { createAdminToken, isAdminConfigured, verifyAdminPassword } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
    try {
        if (!isAdminConfigured()) {
            console.error("[Admin] ADMIN_PASSWORD is not set; admin login is disabled");
            return NextResponse.json({ success: false, error: "管理者ログインは現在利用できません" }, { status: 503 });
        }

        const { password } = await request.json();

        if (verifyAdminPassword(password)) {
            // 有効期限付きの署名トークンを発行（クライアントはAPIリクエスト時に Bearer で送る）
            return NextResponse.json({ success: true, token: createAdminToken() });
        } else {
            return NextResponse.json({ success: false, error: "パスワードが間違っています" }, { status: 401 });
        }
    } catch {
        return NextResponse.json({ success: false, error: "エラーが発生しました" }, { status: 500 });
    }
}
