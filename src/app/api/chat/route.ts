import { NextRequest, NextResponse } from "next/server";
import { addMessage } from "@/lib/chat-store";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { endpointUrl, message, sessionId, agentId } = body;

        if (!endpointUrl || !message) {
            return NextResponse.json(
                { error: "endpointUrl と message は必須です" },
                { status: 400 }
            );
        }

        // 企業のメッセージを履歴に保存
        if (agentId && sessionId) {
            await addMessage(agentId, sessionId, "company", message);
        }

        // 求職者のローカルエージェントにリクエストを中継
        const agentResponse = await fetch(endpointUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message,
                session_id: sessionId || "default",
            }),
            signal: AbortSignal.timeout(30000),
        });

        if (!agentResponse.ok) {
            const errorMsg = `エージェントからの応答エラー（ステータス: ${agentResponse.status}）`;
            if (agentId && sessionId) {
                await addMessage(agentId, sessionId, "system", errorMsg);
            }
            return NextResponse.json(
                { error: "エージェントからの応答エラー", detail: `ステータス: ${agentResponse.status}` },
                { status: 502 }
            );
        }

        const agentData = await agentResponse.json();
        const responseText = agentData.response || agentData.message || agentData.text || JSON.stringify(agentData);

        // エージェントの応答を履歴に保存
        if (agentId && sessionId) {
            await addMessage(agentId, sessionId, "agent", responseText);
        }

        return NextResponse.json({ response: responseText });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "不明なエラー";

        if (errorMessage.includes("timeout") || errorMessage.includes("abort")) {
            return NextResponse.json(
                { error: "エージェントが応答しませんでした（タイムアウト30秒）" },
                { status: 504 }
            );
        }

        if (errorMessage.includes("fetch") || errorMessage.includes("ECONNREFUSED") || errorMessage.includes("network")) {
            return NextResponse.json(
                { error: "エージェントに接続できません", detail: "エージェントがオフラインか、エンドポイントURLが正しくない可能性があります。" },
                { status: 503 }
            );
        }

        return NextResponse.json(
            { error: "中継エラー", detail: errorMessage },
            { status: 500 }
        );
    }
}
