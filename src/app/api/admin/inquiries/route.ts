import { NextRequest, NextResponse } from "next/server";
import { getAllInquiries, updateInquiryStatus } from "@/lib/inquiry-store";

export async function GET(request: NextRequest) {
    // 簡易認証
    const authHeader = request.headers.get("Authorization");
    if (authHeader !== "Bearer admin-session-token") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const inquiries = await getAllInquiries();
    return NextResponse.json({ inquiries });
}

export async function POST(request: NextRequest) {
    // 簡易認証
    const authHeader = request.headers.get("Authorization");
    if (authHeader !== "Bearer admin-session-token") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id, status } = await request.json();
        const success = await updateInquiryStatus(id, status);
        return NextResponse.json({ success });
    } catch {
        return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
}
