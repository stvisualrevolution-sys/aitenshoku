"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function RecruiterRegister() {
    const router = useRouter();
    const [companyName, setCompanyName] = useState("");
    const [contactName, setContactName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [industry, setIndustry] = useState("");
    const [errors, setErrors] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{ success: boolean } | null>(null);

    const handleRegister = async () => {
        setIsLoading(true);
        setErrors([]);

        try {
            const res = await fetch("/api/company/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ companyName, contactName, email, phoneNumber, industry }),
            });
            const data = await res.json();

            if (data.success) {
                setResult({ success: true });
            } else {
                setErrors(data.errors || ["登録に失敗しました。"]);
            }
        } catch {
            setErrors(["サーバーに接続できませんでした。"]);
        } finally {
            setIsLoading(false);
        }
    };



    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
            <Navbar />
            <main style={{ maxWidth: 520, margin: "0 auto", padding: "120px 24px 60px" }}>
                {!result ? (
                    <motion.div className="glass-card glow-box" style={{ padding: 40 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div style={{ textAlign: "center", marginBottom: 32 }}>
                            <div style={{ fontSize: "3rem", marginBottom: 16 }}>🏢</div>
                            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 8 }}>
                                <span className="gradient-text">企業アカウント登録</span>
                            </h1>
                            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.7 }}>
                                エージェント検索・チャット機能を利用するには<br />企業アカウントの登録が必要です。
                            </p>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div>
                                <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>企業名 *</label>
                                <input className="input-field" placeholder="株式会社〇〇" value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)} style={{ width: "100%" }} />
                            </div>
                            <div>
                                <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>担当者名 *</label>
                                <input className="input-field" placeholder="山田太郎" value={contactName}
                                    onChange={(e) => setContactName(e.target.value)} style={{ width: "100%" }} />
                            </div>
                            <div>
                                <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>電話番号 *</label>
                                <input className="input-field" placeholder="03-1234-5678" value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)} style={{ width: "100%" }} />
                            </div>
                            <div>
                                <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>メールアドレス *</label>
                                <input className="input-field" type="email" placeholder="recruit@example.co.jp" value={email}
                                    onChange={(e) => setEmail(e.target.value)} style={{ width: "100%" }} />
                            </div>
                            <div>
                                <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>業種</label>
                                <select className="input-field" value={industry} onChange={(e) => setIndustry(e.target.value)}
                                    style={{ width: "100%", appearance: "auto" }}>
                                    <option value="">選択してください</option>
                                    <option value="IT・通信">IT・通信</option>
                                    <option value="金融・保険">金融・保険</option>
                                    <option value="製造業">製造業</option>
                                    <option value="コンサルティング">コンサルティング</option>
                                    <option value="ヘルスケア">ヘルスケア</option>
                                    <option value="教育">教育</option>
                                    <option value="スタートアップ">スタートアップ</option>
                                    <option value="その他">その他</option>
                                </select>
                            </div>

                            {errors.length > 0 && (
                                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                                    style={{ padding: 12, borderRadius: 10, background: "rgba(239,83,80,0.1)", border: "1px solid rgba(239,83,80,0.2)" }}>
                                    {errors.map((e, i) => (
                                        <div key={i} style={{ fontSize: "0.8rem", color: "var(--danger)", lineHeight: 1.6 }}>{e}</div>
                                    ))}
                                </motion.div>
                            )}

                            <button className="btn-primary" onClick={handleRegister}
                                disabled={!companyName.trim() || !contactName.trim() || !email.trim() || !phoneNumber.trim() || isLoading}
                                style={{ width: "100%", padding: "14px", fontSize: "1rem", opacity: (!companyName.trim() || !contactName.trim() || !email.trim() || !phoneNumber.trim()) ? 0.5 : 1 }}>
                                {isLoading ? "⏳ 登録中..." : "🏢 アカウントを作成"}
                            </button>
                        </div>

                        <p style={{ marginTop: 24, textAlign: "center", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            既にアカウントをお持ちの方は
                            <a href="/recruiter/login" style={{ color: "var(--accent-secondary)", marginLeft: 4 }}>ログイン</a>
                        </p>
                    </motion.div>
                ) : (
                    <motion.div className="glass-card glow-box" style={{ padding: 40, textAlign: "center" }} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                        <div style={{ fontSize: "3rem", marginBottom: 16 }}>⏳</div>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 16 }}>審査待ちです</h2>
                        <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 32 }}>
                            企業アカウントの登録リクエストを受け付けました。<br />
                            現在、管理者による審査を行っております。<br /><br />
                            承認されましたら、ご登録いただいたメールアドレス（{email}）宛に<br />
                            <strong>ログイントークン</strong>をお送りします。<br />
                            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>※通常1〜2営業日以内にご連絡いたします。</span>
                        </p>
                        <button
                            onClick={() => router.push("/")}
                            className="btn-primary"
                            style={{ padding: "12px 32px" }}
                        >
                            トップへ戻る
                        </button>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
