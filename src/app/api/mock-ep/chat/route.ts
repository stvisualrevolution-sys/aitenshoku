import { NextRequest, NextResponse } from "next/server";

function generateResponse(message: string): string {
    const msg = message.toLowerCase();

    if (msg.includes("こんにちは") || msg.includes("hello") || msg.includes("接続テスト")) {
        return "こんにちは！田中太郎のAIエージェントです。フルスタック開発について何でもお聞きください。🤖";
    }
    if (msg.includes("スキル") || msg.includes("skill")) {
        return "得意なスキルは以下の通りです：\n\n🔹 言語: Python, TypeScript, Go\n🔹 フレームワーク: Next.js, FastAPI, React\n🔹 インフラ: Docker, Kubernetes, AWS\n🔹 AI/ML: PyTorch, LangChain, RAG構築\n\n特にLLMアプリケーション開発に強みがあります。";
    }
    if (msg.includes("年収") || msg.includes("salary") || msg.includes("給料")) {
        return "希望年収は800万円以上です。ただし、プロジェクトの内容や成長機会によっては柔軟に相談可能です。";
    }
    if (msg.includes("入社") || msg.includes("いつから") || msg.includes("available")) {
        return "来月から入社可能です。現在のプロジェクトは今月末で完了予定なので、スムーズに移行できます。";
    }
    if (msg.includes("ポートフォリオ") || msg.includes("portfolio") || msg.includes("実績")) {
        return "主な実績：\n\n📌 RAGベースの社内Q&Aシステム開発（利用者500人）\n📌 LLMを活用した自動コードレビューツール\n📌 リアルタイムデータパイプライン構築（Kubernetes上）\n\nGitHub: https://github.com/tanaka-example";
    }
    if (msg.includes("自己紹介") || msg.includes("について")) {
        return "田中太郎です。AIスタートアップで3年、大手SIerで2年の経験があります。最近はLLMアプリの設計・開発に注力しており、RAGやAgent系のアーキテクチャが得意です。リモートワーク希望で、チーム開発も一人開発もどちらも対応できます。";
    }
    if (msg.includes("ping")) {
        return "pong 🏓";
    }

    return `ご質問ありがとうございます。「${message}」についてですが、田中太郎は幅広い技術スタックに対応可能です。具体的な技術要件や業務内容について、もう少し詳しくお聞かせいただけますか？`;
}

export async function POST(request: NextRequest) {
    try {
        const { message } = await request.json();

        // ランダムな遅延（200〜800ms）でリアルっぽく
        const delay = 200 + Math.random() * 600;
        await new Promise(resolve => setTimeout(resolve, delay));

        const response = generateResponse(message || "");
        return NextResponse.json({ response });
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
}
