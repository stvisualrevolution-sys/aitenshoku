import { NextRequest, NextResponse } from "next/server";
import { sendInquiry } from "@/lib/inquiry-store";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, category, message } = body;

        if (!name || !email || !category || !message) {
            return NextResponse.json({ success: false, error: "必須項目が入力されていません" }, { status: 400 });
        }

        const success = await sendInquiry({ name, email, category, message });

        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ success: false, error: "送信に失敗しました" }, { status: 500 });
        }
    } catch {
        return NextResponse.json({ success: false, error: "エラーが発生しました" }, { status: 500 });
    }
}
