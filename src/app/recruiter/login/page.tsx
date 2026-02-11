"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function RecruiterLogin() {
    const router = useRouter();
    const [token, setToken] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!token.trim()) return;
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/company/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: token.trim() }),
            });
            const data = await res.json();

            if (data.success) {
                localStorage.setItem("company-token", token.trim());
                router.push("/recruiter/search");
            } else {
                setError(data.error || "ログインに失敗しました。");
            }
        } catch {
            setError("サーバーに接続できませんでした。");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
            <Navbar />
            <main style={{ maxWidth: 480, margin: "0 auto", padding: "160px 24px 60px" }}>
                <motion.div className="glass-card glow-box" style={{ padding: 40, textAlign: "center" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div style={{ fontSize: "3rem", marginBottom: 20 }}>🏢</div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 8 }}>
                        <span className="gradient-text">企業ログイン</span>
                    </h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: 32, lineHeight: 1.7 }}>
                        企業登録時に発行された<br />
                        <strong>ログイントークン</strong>を入力してください。
                    </p>

                    <div style={{ marginBottom: 20 }}>
                        <input className="input-field" placeholder="ctok-company-xxxxxxxx..."
                            value={token} onChange={(e) => { setToken(e.target.value); setError(""); }}
                            onKeyDown={(e) => { if (e.key === "Enter") handleLogin(); }}
                            style={{ width: "100%", textAlign: "center", fontFamily: "var(--font-mono)", fontSize: "0.9rem" }} />
                    </div>

                    {error && (
                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                            style={{ padding: 12, borderRadius: 10, background: "rgba(239,83,80,0.1)", border: "1px solid rgba(239,83,80,0.2)", color: "var(--danger)", fontSize: "0.8rem", marginBottom: 16 }}>
                            {error}
                        </motion.div>
                    )}

                    <button className="btn-primary" onClick={handleLogin} disabled={!token.trim() || isLoading}
                        style={{ width: "100%", padding: "14px", fontSize: "1rem", opacity: !token.trim() ? 0.5 : 1 }}>
                        {isLoading ? "⏳ 確認中..." : "🔓 ログイン"}
                    </button>

                    <p style={{ marginTop: 32, fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
                        まだアカウントをお持ちでない方は<br />
                        <a href="/recruiter/register" style={{ color: "var(--accent-secondary)" }}>こちらから企業登録</a>
                    </p>
                    <p style={{ marginTop: 16, fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        トークンを忘れた方は<a href="/contact" style={{ color: "var(--text-secondary)", textDecoration: "underline" }}>こちら</a>
                    </p>
                </motion.div>
            </main>
        </div>
    );
}
