import { NextRequest, NextResponse } from "next/server";
import { verifyAdminPassword } from "@/lib/company-store";

export async function POST(request: NextRequest) {
    try {
        const { password } = await request.json();

        if (verifyAdminPassword(password)) {
            // 簡易的なトークンとしてパスワードをそのまま返す（本来はJWT等を使うべきだがプロトタイプなので）
            // クライアント側でこのトークン（パスワード）を保存してAPIリクエスト時に送る
            return NextResponse.json({ success: true, token: "admin-session-token" });
        } else {
            return NextResponse.json({ success: false, error: "パスワードが間違っています" }, { status: 401 });
        }
    } catch {
        return NextResponse.json({ success: false, error: "エラーが発生しました" }, { status: 500 });
    }
}
