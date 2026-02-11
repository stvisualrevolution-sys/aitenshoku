import { supabase } from "./supabase";

export interface ChatLogEntry {
    id: string;
    role: "company" | "agent" | "system" | "talent";
    content: string;
    timestamp: string;
}

export interface ChatSession {
    sessionId: string;
    agentId: string;
    companyLabel: string;
    startedAt: string;
    lastMessageAt: string;
    messages: ChatLogEntry[];
}

export interface RegisteredAgent {
    agentId: string;
    agentName: string;
    ownerName: string;
    title: string;
    endpointUrl: string;
    registeredAt: string;
    loginToken: string;
    skills: string[];
    minimumSalary: number | null;
    workStyle: string | null;
    bio: string | null;
    portfolio: string | null;
    region: string | null;
    avgResponseMs: number | null;
    lastPingMs: number | null;
    isOnline: boolean;
    lastPingedAt: string | null;
    isDemo: boolean;
    // New Profile Fields
    birthDate: string | null;
    nationality: string | null;
    education: any | null;    // JSONB
    workHistory: any | null;  // JSONB
}

// --- エージェント登録 (Async) ---

export async function registerAgent(agent: RegisteredAgent): Promise<void> {
    const { error } = await supabase
        .from('agents')
        .upsert({
            agent_id: agent.agentId,
            owner_name: agent.ownerName,
            agent_name: agent.agentName,
            title: agent.title,
            endpoint_url: agent.endpointUrl,
            login_token: agent.loginToken,
            skills: agent.skills,
            minimum_salary: agent.minimumSalary,
            work_style: agent.workStyle,
            bio: agent.bio,
            portfolio: agent.portfolio,
            region: agent.region,
            avg_response_ms: agent.avgResponseMs,
            is_online: agent.isOnline,
            last_pinged_at: agent.lastPingedAt,
            registered_at: agent.registeredAt,
            birth_date: agent.birthDate,
            nationality: agent.nationality,
            education: agent.education,
            work_history: agent.workHistory
        }); // isDemoカラムはSQLにないが、今回は簡略化のためomitするかもしくはSQLに追加必要。一旦除外またはmetadataへ。

    if (error) console.error("Error registering agent:", error);
}

export async function getAgentByToken(token: string): Promise<RegisteredAgent | undefined> {
    const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('login_token', token)
        .single();

    if (error || !data) return undefined;
    return mapToAgent(data);
}

export async function getAgentById(agentId: string): Promise<RegisteredAgent | undefined> {
    const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('agent_id', agentId)
        .single();
    if (error || !data) return undefined;
    return mapToAgent(data);
}

export async function getAllAgents(): Promise<RegisteredAgent[]> {
    const { data, error } = await supabase
        .from('agents')
        .select('*');
    if (error || !data) return [];
    return data.map(mapToAgent);
}

export async function updateAgentPing(agentId: string, isOnline: boolean, responseMs: number | null): Promise<void> {
    // 実際にはDB更新頻度が高すぎるので、本番ではキャッシュ層(Redis)を使うべきだが、今回は直接Update
    const updateData: any = {
        is_online: isOnline,
        last_pinged_at: new Date().toISOString()
    };
    if (responseMs !== null) {
        updateData.avg_response_ms = responseMs; // 簡易化: 平均計算は省略して最新値を入れる等の対応
    }

    await supabase.from('agents').update(updateData).eq('agent_id', agentId);
}

// --- チャット履歴 (Async) ---

export async function addMessage(
    agentId: string,
    sessionId: string,
    role: "company" | "agent" | "system" | "talent",
    content: string,
    companyLabel?: string
): Promise<void> {
    // セッション存在確認・作成
    const { data: session } = await supabase.from('chat_sessions').select('session_id').eq('session_id', sessionId).single();

    if (!session) {
        await supabase.from('chat_sessions').insert({
            session_id: sessionId,
            company_id: "unknown", // 本来はcompanyIdが必要だが、既存I/F互換のため
            agent_id: agentId,
            company_label: companyLabel || "企業",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
    } else {
        await supabase.from('chat_sessions').update({ updated_at: new Date().toISOString() }).eq('session_id', sessionId);
    }

    // メッセージ追加
    await supabase.from('chat_messages').insert({
        session_id: sessionId,
        role: role,
        content: content,
        created_at: new Date().toISOString()
    });
}

export async function getSessionsForAgent(agentId: string): Promise<ChatSession[]> {
    const { data: sessions, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('agent_id', agentId)
        .order('updated_at', { ascending: false });

    if (error || !sessions) return [];

    // 各セッションのメッセージを取得
    const result: ChatSession[] = [];
    for (const s of sessions) {
        const { data: messages } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('session_id', s.session_id)
            .order('created_at', { ascending: true });

        result.push({
            sessionId: s.session_id,
            agentId: s.agent_id,
            companyLabel: s.company_label || "企業",
            startedAt: s.created_at,
            lastMessageAt: s.updated_at,
            messages: (messages || []).map(m => ({
                id: m.id,
                role: m.role as any,
                content: m.content,
                timestamp: m.created_at
            }))
        });
    }
    return result;
}

export async function getSession(agentId: string, sessionId: string): Promise<ChatSession | undefined> {
    const { data: session, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single();

    if (error || !session) return undefined;

    const { data: messages } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

    return {
        sessionId: session.session_id,
        agentId: session.agent_id,
        companyLabel: session.company_label || "企業",
        startedAt: session.created_at,
        lastMessageAt: session.updated_at,
        messages: (messages || []).map(m => ({
            id: m.id,
            role: m.role as any,
            content: m.content,
            timestamp: m.created_at
        }))
    };
}

// Helper
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapToAgent(data: any): RegisteredAgent {
    return {
        agentId: data.agent_id,
        agentName: data.agent_name,
        ownerName: data.owner_name,
        title: data.title,
        endpointUrl: data.endpoint_url,
        loginToken: data.login_token,
        registeredAt: data.registered_at,
        skills: data.skills || [],
        minimumSalary: data.minimum_salary,
        workStyle: data.work_style,
        bio: data.bio,
        portfolio: data.portfolio,
        region: data.region,
        avgResponseMs: data.avg_response_ms,
        lastPingMs: null, // DBには持たないので省略
        isOnline: data.is_online,
        lastPingedAt: data.last_pinged_at,
        isDemo: false, // DB管理外
        birthDate: data.birth_date,
        nationality: data.nationality,
        education: data.education,
        workHistory: data.work_history
    };
}
