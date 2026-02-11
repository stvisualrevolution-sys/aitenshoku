import { NextRequest, NextResponse } from "next/server";
import { getAllAgents, updateAgentPing } from "@/lib/chat-store";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { skillFilter, maxSalary, onlineOnly, query } = body;

        let agents = await getAllAgents();

        // スキルフィルタ
        if (skillFilter && Array.isArray(skillFilter) && skillFilter.length > 0) {
            const filterLower = skillFilter.map((s: string) => s.toLowerCase());
            agents = agents.filter((a) =>
                filterLower.some((f: string) => a.skills.some((s) => s.includes(f)))
            );
        }

        // 年収上限フィルタ（企業視点: この予算で雇える人）
        if (maxSalary && typeof maxSalary === "number") {
            agents = agents.filter((a) =>
                a.minimumSalary === null || a.minimumSalary <= maxSalary
            );
        }

        // テキスト検索（名前、タイトル、bio）
        if (query && typeof query === "string" && query.trim()) {
            const q = query.toLowerCase();
            agents = agents.filter((a) =>
                a.agentName.toLowerCase().includes(q) ||
                a.ownerName.toLowerCase().includes(q) ||
                a.title.toLowerCase().includes(q) ||
                (a.bio && a.bio.toLowerCase().includes(q)) ||
                a.skills.some((s) => s.includes(q))
            );
        }

        // Ping全エージェント（並列、タイムアウト5秒）
        const pingPromises = agents.map(async (agent) => {
            try {
                const startTime = Date.now();
                const res = await fetch(agent.endpointUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: "ping", session_id: "health-check" }),
                    signal: AbortSignal.timeout(5000),
                });
                const responseMs = Date.now() - startTime;
                const ok = res.ok;
                await updateAgentPing(agent.agentId, ok, ok ? responseMs : null);
                return { ...agent, isOnline: ok, lastPingMs: ok ? responseMs : null };
            } catch {
                await updateAgentPing(agent.agentId, false, null);
                return { ...agent, isOnline: false, lastPingMs: null };
            }
        });

        let results = await Promise.all(pingPromises);

        // オンラインフィルタ
        if (onlineOnly) {
            results = results.filter((a) => a.isOnline);
        }

        // ソート: オンライン優先 → 応答速度順
        results.sort((a, b) => {
            if (a.isOnline !== b.isOnline) return a.isOnline ? -1 : 1;
            const aMs = a.avgResponseMs ?? 99999;
            const bMs = b.avgResponseMs ?? 99999;
            return aMs - bMs;
        });

        // loginTokenを除外して返す
        const safeResults = results.map(({ loginToken: _lt, ...rest }) => rest);

        return NextResponse.json({
            agents: safeResults,
            total: safeResults.length,
        });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "不明なエラー";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
