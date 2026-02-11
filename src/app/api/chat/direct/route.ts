import { NextRequest, NextResponse } from "next/server";
import { addMessage } from "@/lib/chat-store"; // Supabase版

export async function POST(request: NextRequest) {
    try {
        const { agentId, sessionId, content } = await request.json();

        if (!agentId || !sessionId || !content) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 求職者(Talent)からのメッセージとして保存
        await addMessage(agentId, sessionId, "talent", content);

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
