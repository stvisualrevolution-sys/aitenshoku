import { NextRequest, NextResponse } from "next/server";
import { getCompanyByToken } from "@/lib/company-store";
import { supabase } from "@/lib/supabase";
import { ChatLogEntry, getAgentById } from "@/lib/chat-store";

export async function POST(request: NextRequest) {
    try {
        const { companyToken, agentId } = await request.json();

        if (!companyToken || !agentId) {
            return NextResponse.json({ error: "Missing token or agentId" }, { status: 400 });
        }

        const company = await getCompanyByToken(companyToken);
        if (!company) {
            return NextResponse.json({ error: "Invalid company token" }, { status: 401 });
        }

        // 企業IDとエージェントIDでセッションを検索
        // 簡易的に1企業1エージェントにつき1セッションとする
        // (複数セッション持つなら最新を取得)
        const { data: sessions, error } = await supabase
            .from('chat_sessions')
            .select('*')
            .eq('company_id', company.companyId)
            .eq('agent_id', agentId)
            .order('updated_at', { ascending: false })
            .limit(1);

        if (error) throw error;

        if (!sessions || sessions.length === 0) {
            return NextResponse.json({ messages: [], sessionId: null });
        }

        const session = sessions[0];

        // メッセージ取得
        const { data: messages, error: msgError } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('session_id', session.session_id)
            .order('created_at', { ascending: true });

        if (msgError) throw msgError;

        const formattedMessages: ChatLogEntry[] = messages!.map(m => ({
            id: m.id,
            role: m.role as any,
            content: m.content,
            timestamp: m.created_at
        }));

        const agent = await getAgentById(agentId);

        return NextResponse.json({
            sessionId: session.session_id,
            messages: formattedMessages,
            agent
        });

    } catch (e: unknown) {
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
