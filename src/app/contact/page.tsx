"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";

export default function ContactPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [category, setCategory] = useState("token_lost");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, category, message }),
            });
            const data = await res.json();

            if (data.success) {
                setSuccess(true);
            } else {
                setError(data.error || "送信に失敗しました");
            }
        } catch {
            setError("サーバーエラーが発生しました");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
                <Navbar />
                <main style={{ maxWidth: 600, margin: "0 auto", padding: "120px 24px" }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card glow-box"
                        style={{ padding: 40, textAlign: "center" }}
                    >
                        <div style={{ fontSize: "3rem", marginBottom: 16 }}>✅</div>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 16 }}>送信完了</h2>
                        <p style={{ color: "var(--text-secondary)", marginBottom: 32 }}>
                            お問い合わせを受け付けました。<br />
                            管理者が確認次第、ご連絡いたします。
                        </p>
                        <button onClick={() => router.push("/")} className="btn-primary" style={{ padding: "12px 32px" }}>
                            トップへ戻る
                        </button>
                    </motion.div>
                </main>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
            <Navbar />
            <main style={{ maxWidth: 600, margin: "0 auto", padding: "120px 24px" }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card"
                    style={{ padding: 40 }}
                >
                    <h1 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: 8, textAlign: "center" }}>
                        <span className="gradient-text">お問い合わせ</span>
                    </h1>
                    <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: 32 }}>
                        ログインできない場合や、アカウント削除のご依頼など
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div>
                            <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>お名前 *</label>
                            <input className="input-field" required value={name} onChange={e => setName(e.target.value)} style={{ width: "100%" }} placeholder="山田 太郎" />
                        </div>
                        <div>
                            <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>メールアドレス *</label>
                            <input type="email" className="input-field" required value={email} onChange={e => setEmail(e.target.value)} style={{ width: "100%" }} placeholder="you@example.com" />
                        </div>
                        <div>
                            <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>お問い合わせ種別 *</label>
                            <select className="input-field" value={category} onChange={e => setCategory(e.target.value)} style={{ width: "100%", appearance: "auto" }}>
                                <option value="token_lost">トークンを忘れた/紛失した</option>
                                <option value="account_delete">退会・アカウント削除依頼</option>
                                <option value="other">その他</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>メッセージ本文 *</label>
                            <textarea className="input-field" required value={message} onChange={e => setMessage(e.target.value)} style={{ width: "100%", minHeight: 120, resize: "vertical" }} placeholder="状況を詳しくご記入ください。" />
                        </div>

                        {error && <div style={{ color: "var(--danger)", fontSize: "0.85rem", padding: 10, background: "rgba(239,83,80,0.1)", borderRadius: 8 }}>{error}</div>}

                        <button type="submit" className="btn-primary" disabled={loading} style={{ padding: "14px", marginTop: 8 }}>
                            {loading ? "送信中..." : "送信する"}
                        </button>
                    </form>
                </motion.div>
            </main>
        </div>
    );
}
