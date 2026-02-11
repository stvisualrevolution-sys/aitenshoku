import { NextRequest, NextResponse } from "next/server";

// ヘルスチェック：エージェントが生きているか確認
export async function POST(request: NextRequest) {
    try {
        const { endpointUrl } = await request.json();

        if (!endpointUrl) {
            return NextResponse.json({ error: "endpointUrl は必須です" }, { status: 400 });
        }

        // テストメッセージを送信
        const response = await fetch(endpointUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: "こんにちは。接続テストです。",
                session_id: "health-check",
            }),
            signal: AbortSignal.timeout(10000), // 10秒タイムアウト
        });

        if (!response.ok) {
            return NextResponse.json({
                online: false,
                error: `エージェントがエラーを返しました（ステータス: ${response.status}）`,
            });
        }

        const data = await response.json();

        return NextResponse.json({
            online: true,
            testResponse: data.response || data.message || data.text || "応答あり",
        });
    } catch {
        return NextResponse.json({
            online: false,
            error: "エージェントに接続できませんでした。URL・ネットワークを確認してください。",
        });
    }
}
