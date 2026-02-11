import { NextRequest, NextResponse } from "next/server";
import { getAgentByToken, getSessionsForAgent, getSession } from "@/lib/chat-store";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token, sessionId } = body;

        if (!token) {
            return NextResponse.json(
                { error: "ログイントークンが必要です" },
                { status: 401 }
            );
        }

        const agent = await getAgentByToken(token);
        if (!agent) {
            return NextResponse.json(
                { error: "無効なトークンです。正しいAgent IDでログインしてください。" },
                { status: 401 }
            );
        }

        // 特定セッションの詳細を返す
        if (sessionId) {
            const session = await getSession(agent.agentId, sessionId);
            if (!session) {
                return NextResponse.json(
                    { error: "セッションが見つかりません" },
                    { status: 404 }
                );
            }
            return NextResponse.json({ agent, session });
        }

        // 全セッション一覧を返す
        const sessions = await getSessionsForAgent(agent.agentId);

        return NextResponse.json({
            agent,
            sessions: sessions.map((s) => ({
                sessionId: s.sessionId,
                companyLabel: s.companyLabel,
                startedAt: s.startedAt,
                lastMessageAt: s.lastMessageAt,
                messageCount: s.messages.length,
                lastMessage: s.messages.length > 0 ? s.messages[s.messages.length - 1].content : null,
            })),
            totalSessions: sessions.length,
        });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "不明なエラー";
        return NextResponse.json({ error: `サーバーエラー: ${msg}` }, { status: 500 });
    }
}
