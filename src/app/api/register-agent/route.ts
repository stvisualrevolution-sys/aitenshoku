import { NextRequest, NextResponse } from "next/server";
import { parseManifest } from "@/lib/manifest-parser";
import { registerAgent, type RegisteredAgent } from "@/lib/chat-store";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { yamlContent } = body;

        if (!yamlContent || typeof yamlContent !== "string") {
            return NextResponse.json(
                { success: false, errors: ["YAMLコンテンツが提供されていません。"] },
                { status: 400 }
            );
        }

        // 1. YAMLを解析・バリデーション
        const parseResult = parseManifest(yamlContent);

        if (!parseResult.success || !parseResult.data) {
            return NextResponse.json({
                success: false,
                errors: parseResult.errors,
                warnings: parseResult.warnings,
            }, { status: 422 });
        }

        // 2. 接続テスト（ヘルスチェック）
        const endpoint = parseResult.data.agent_settings.endpoint;
        let healthCheck = { online: false, responseTime: 0, testResponse: "", error: "" };

        try {
            const startTime = Date.now();
            const healthRes = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: "こんにちは。Agent-Linkからの接続テストです。",
                    session_id: "registration-health-check",
                }),
                signal: AbortSignal.timeout(15000),
            });

            const responseTime = Date.now() - startTime;

            if (healthRes.ok) {
                const data = await healthRes.json();
                healthCheck = {
                    online: true,
                    responseTime,
                    testResponse: data.response || data.message || data.text || "応答あり",
                    error: "",
                };
            } else {
                healthCheck = {
                    online: false,
                    responseTime,
                    testResponse: "",
                    error: `エージェントがエラーを返しました（HTTP ${healthRes.status}）`,
                };
            }
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "不明なエラー";
            healthCheck = {
                online: false,
                responseTime: 0,
                testResponse: "",
                error: msg.includes("timeout")
                    ? "エージェントが15秒以内に応答しませんでした"
                    : `エージェントに接続できません: ${msg}`,
            };
        }

        // 3. スキルを統合してフラットなリストに
        const skills: string[] = [];
        const sk = parseResult.data.candidate.skills;
        [sk.languages, sk.frameworks, sk.tools, sk.other].forEach((arr) => {
            if (arr) arr.forEach((s) => skills.push(s.name.toLowerCase()));
        });

        // 4. エージェントをストアに登録
        const agentId = `agent-${Date.now().toString(36)}`;
        const loginToken = `tok-${agentId}-${Math.random().toString(36).slice(2, 10)}`;

        const newAgent: RegisteredAgent = {
            agentId,
            agentName: parseResult.data.agent_settings.name,
            ownerName: parseResult.data.candidate.basic_info.name,
            title: parseResult.data.candidate.basic_info.title || "",
            endpointUrl: parseResult.data.agent_settings.endpoint,
            registeredAt: new Date().toISOString(),
            loginToken,
            skills,
            minimumSalary: parseResult.data.candidate.preferences?.minimum_annual_salary || null,
            workStyle: parseResult.data.candidate.preferences?.preferred_work_style || null,
            bio: parseResult.data.candidate.bio || null,
            portfolio: parseResult.data.candidate.portfolio || null,
            region: parseResult.data.candidate.basic_info.region || null,
            avgResponseMs: healthCheck.online ? healthCheck.responseTime : null,
            lastPingMs: healthCheck.online ? healthCheck.responseTime : null,
            isOnline: healthCheck.online,
            lastPingedAt: new Date().toISOString(),
            isDemo: false,
        };

        await registerAgent(newAgent);

        return NextResponse.json({
            success: true,
            agentId,
            loginToken,
            manifest: parseResult.data,
            healthCheck,
            warnings: parseResult.warnings,
        });

    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "不明なエラー";
        return NextResponse.json(
            { success: false, errors: [`サーバーエラー: ${msg}`] },
            { status: 500 }
        );
    }
}
