// テスト用モックエージェントサーバー
// 使い方: node mock-agent-server.js
// これを起動して ngrok http 8080 で公開し、Agent-Linkで接続テストできます

const http = require("http");

const PORT = 8080;

// エージェントのプロフィール（ここをカスタマイズ）
const profile = {
    name: "テスト太郎",
    title: "フルスタックAIエンジニア",
    skills: ["Python", "TypeScript", "LangChain", "Next.js", "Docker"],
    experience: 5,
    salaryMin: 700,
    salaryIdeal: 900,
    salaryMax: 1200,
    portfolio: "https://github.com/example",
    bio: "LLMを活用したプロダクト開発が得意です。",
};

function generateResponse(message) {
    const msg = message.toLowerCase();

    if (msg.includes("こんにちは") || msg.includes("はじめまして") || msg.includes("接続テスト")) {
        return `こんにちは！${profile.name}のAIエージェントです。スキルや経歴、希望年収など何でも聞いてください！`;
    }

    if (msg.includes("スキル") || msg.includes("技術") || msg.includes("できる") || msg.includes("経験")) {
        return `${profile.name}は${profile.skills.join("、")}のスキルを持っています。業界経験は${profile.experience}年です。${profile.bio}`;
    }

    if (msg.includes("年収") || msg.includes("給与") || msg.includes("報酬") || msg.includes("いくら")) {
        return `希望年収は${profile.salaryIdeal}万円です。最低ラインは${profile.salaryMin}万円、上限は${profile.salaryMax}万円程度で考えています。`;
    }

    if (msg.includes("ポートフォリオ") || msg.includes("実績") || msg.includes("成果物")) {
        return `ポートフォリオはこちらです: ${profile.portfolio}`;
    }

    if (msg.includes("いつ") || msg.includes("入社") || msg.includes("開始")) {
        return "現在の状況では、1ヶ月後から入社可能です。";
    }

    if (msg.includes("チーム") || msg.includes("協力")) {
        return `${profile.name}はチーム開発の経験が豊富です。アジャイル/スクラム開発を中心に、5〜10人規模のチームでリードエンジニアを務めた経験があります。`;
    }

    return `ご質問ありがとうございます。${profile.name}は${profile.title}として${profile.experience}年の経験があります。具体的にスキル、年収、ポートフォリオなどについて質問していただければ、詳しくお答えします！`;
}

const server = http.createServer((req, res) => {
    // CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.method === "POST") {
        let body = "";
        req.on("data", (chunk) => { body += chunk; });
        req.on("end", () => {
            try {
                const data = JSON.parse(body);
                const response = generateResponse(data.message || "");

                console.log(`📨 受信: "${data.message}"`);
                console.log(`📤 応答: "${response}"`);
                console.log("---");

                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ response }));
            } catch (e) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "リクエスト形式エラー" }));
            }
        });
    } else {
        res.writeHead(405, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "POSTのみ対応" }));
    }
});

server.listen(PORT, () => {
    console.log(`\n🤖 モックエージェントサーバーが起動しました！`);
    console.log(`📡 http://localhost:${PORT}`);
    console.log(`\n次のステップ:`);
    console.log(`  1. 別のターミナルで: ngrok http ${PORT}`);
    console.log(`  2. ngrokのURLをAgent-Linkの求職者ダッシュボードに登録`);
    console.log(`  3. 接続テストを実行して確認！\n`);
});
