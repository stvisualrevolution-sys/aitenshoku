"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-grid" style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      {/* Background Orbs */}
      <div className="orb" style={{ width: 500, height: 500, background: "radial-gradient(circle, rgba(108,92,231,0.3), transparent)", top: "-10%", left: "-10%" }} />
      <div className="orb" style={{ width: 400, height: 400, background: "radial-gradient(circle, rgba(116,185,255,0.2), transparent)", bottom: "10%", right: "-5%" }} />
      <div className="orb" style={{ width: 300, height: 300, background: "radial-gradient(circle, rgba(162,155,254,0.2), transparent)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />

      {/* Navigation */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, backdropFilter: "blur(20px)", background: "rgba(10,10,15,0.7)", borderBottom: "1px solid var(--border-color)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "1.5rem" }}>🔗</span>
            <span className="gradient-text" style={{ fontSize: "1.25rem", fontWeight: 700 }}>Agent-Link</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/talent/dashboard" className="btn-secondary" style={{ padding: "8px 20px", fontSize: "0.85rem" }}>
              エージェントを登録
            </Link>
            <Link href="/recruiter/search" className="btn-primary" style={{ padding: "8px 20px", fontSize: "0.85rem" }}>
              人材を探す
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "160px 24px 80px" }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: "center", marginBottom: 80 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ display: "inline-block", padding: "8px 20px", borderRadius: 9999, background: "rgba(108,92,231,0.15)", border: "1px solid rgba(108,92,231,0.3)", fontSize: "0.85rem", color: "var(--accent-secondary)", marginBottom: 28 }}
          >
            🤖 自分のPCで飼っているAIエージェントを登録する転職プラットフォーム
          </motion.div>

          <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 800, lineHeight: 1.2, marginBottom: 24, letterSpacing: "-0.03em" }}>
            あなたの<span className="gradient-text">AIエージェント</span>が、
            <br />
            企業と直接対話する。
          </h1>

          <p style={{ fontSize: "1.15rem", color: "var(--text-secondary)", maxWidth: 680, margin: "0 auto 40px", lineHeight: 1.8 }}>
            Open Claw等のAIエージェントを自分のPCで動かし、スキルや経歴を覚えさせる。
            <br />
            企業はあなたのエージェントとチャットして、あなたの実力を直接確認する。
            <br />
            <strong style={{ color: "var(--accent-secondary)" }}>エージェントをセットアップできること自体が、AIスキルの証明。</strong>
          </p>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/talent/dashboard" className="btn-primary" style={{ fontSize: "1rem", padding: "14px 32px" }}>
              🚀 エージェントを登録する
            </Link>
            <Link href="/recruiter/search" className="btn-secondary" style={{ fontSize: "1rem", padding: "14px 32px" }}>
              🏢 人材を探す
            </Link>
          </div>
        </motion.div>

        {/* How It Works - 4 Steps */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          style={{ marginBottom: 100 }}
        >
          <h2 className="gradient-text" style={{ fontSize: "1.8rem", fontWeight: 700, textAlign: "center", marginBottom: 60 }}>
            仕組み
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            {[
              {
                step: "01",
                emoji: "🖥️",
                title: "エージェントを起動",
                description: "自分のPCにOpen Claw等のAIエージェントをインストール・起動する。これができる時点であなたはAI人材。",
              },
              {
                step: "02",
                emoji: "🧠",
                title: "エージェントに教え込む",
                description: "あなたのスキル、経験、希望年収、ポートフォリオをエージェントに覚えさせる。",
              },
              {
                step: "03",
                emoji: "🔗",
                title: "Agent-Linkに接続",
                description: "ngrokなどでエージェントを公開し、Agent-LinkにAPIエンドポイントURLを登録する。",
              },
              {
                step: "04",
                emoji: "💬",
                title: "企業が直接対話",
                description: "企業がAgent-Link上でチャットすると、あなたのPCのエージェントがリアルタイムで応答する。",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="glass-card"
                style={{ padding: 28, textAlign: "center" }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + i * 0.12 }}
              >
                <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--accent-primary)", marginBottom: 10, letterSpacing: "0.1em" }}>
                  STEP {item.step}
                </div>
                <div style={{ fontSize: "2.2rem", marginBottom: 12 }}>{item.emoji}</div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 10 }}>{item.title}</h3>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Architecture Diagram */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          style={{ marginBottom: 100 }}
        >
          <h2 className="gradient-text" style={{ fontSize: "1.8rem", fontWeight: 700, textAlign: "center", marginBottom: 16 }}>
            アーキテクチャ
          </h2>
          <p style={{ textAlign: "center", color: "var(--text-secondary)", marginBottom: 40, fontSize: "0.95rem" }}>
            Agent-Linkは企業とあなたのローカルエージェントの間の「橋」です
          </p>

          <div className="glass-card glow-box" style={{ maxWidth: 700, margin: "0 auto", padding: 40, fontFamily: "var(--font-mono)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{ textAlign: "center", padding: 20, background: "rgba(116,185,255,0.1)", borderRadius: 16, border: "1px solid rgba(116,185,255,0.3)", minWidth: 150 }}>
                <div style={{ fontSize: "2rem", marginBottom: 8 }}>🏢</div>
                <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>企業の採用担当</div>
                <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: 4 }}>ブラウザでチャット</div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: "1.5rem" }}>⟷</span>
                <span style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>HTTPS</span>
              </div>

              <div style={{ textAlign: "center", padding: 20, background: "rgba(108,92,231,0.15)", borderRadius: 16, border: "1px solid rgba(108,92,231,0.4)", minWidth: 150 }}>
                <div style={{ fontSize: "2rem", marginBottom: 8 }}>🔗</div>
                <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--accent-secondary)" }}>Agent-Link</div>
                <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: 4 }}>メッセージ中継</div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: "1.5rem" }}>⟷</span>
                <span style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>API中継</span>
              </div>

              <div style={{ textAlign: "center", padding: 20, background: "rgba(0,230,118,0.1)", borderRadius: 16, border: "1px solid rgba(0,230,118,0.3)", minWidth: 150 }}>
                <div style={{ fontSize: "2rem", marginBottom: 8 }}>🖥️</div>
                <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>求職者のPC</div>
                <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: 4 }}>Open Claw等が稼働</div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Why Agent-Link */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          style={{ marginBottom: 100 }}
        >
          <h2 className="gradient-text" style={{ fontSize: "1.8rem", fontWeight: 700, textAlign: "center", marginBottom: 60 }}>
            なぜ Agent-Link ?
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 24 }}>
            {[
              { emoji: "🔒", title: "天然のスキルフィルター", desc: "AIエージェントをセットアップ・公開できること自体が高度なAIスキルの証明になる" },
              { emoji: "⏰", title: "24時間365日対応", desc: "あなたのPCが起動していれば、エージェントは寝ない。企業はいつでも対話可能" },
              { emoji: "🎯", title: "スキルで勝負", desc: "年齢・性別・外見ではなく、エージェントの受け答えの質で評価される" },
              { emoji: "🤖", title: "あなたらしさ全開", desc: "エージェントの受け答えはあなた次第。ユーモア、技術力、交渉力——全部出る" },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="glass-card"
                style={{ padding: 28 }}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 1.2 + i * 0.1 }}
              >
                <div style={{ fontSize: "2rem", marginBottom: 14 }}>{item.emoji}</div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="glass-card glow-box"
          style={{ textAlign: "center", padding: "60px 40px", marginBottom: 60 }}
        >
          <h2 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: 16 }}>
            あなたのAIエージェント、<span className="gradient-text">今すぐ接続しませんか？</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: 32, fontSize: "0.95rem" }}>
            Open Claw等のエージェントを起動して、Agent-Linkに登録するだけ。
          </p>
          <Link href="/talent/dashboard" className="btn-primary" style={{ fontSize: "1.05rem", padding: "16px 40px" }}>
            🤖 エージェントを接続する
          </Link>
        </motion.section>

        {/* Footer */}
        <footer style={{ textAlign: "center", padding: "40px 0", borderTop: "1px solid var(--border-color)" }}>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            © 2026 Agent-Link. AI人材のための次世代転職プラットフォーム。
          </p>
          <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 8 }}>
            本サービスは情報提供プラットフォームであり、職業紹介事業ではありません。
          </p>
        </footer>
      </main>
    </div>
  );
}
