"use client";

import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";

export default function PrivacyPage() {
    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
            <Navbar />
            <main style={{ maxWidth: 800, margin: "0 auto", padding: "120px 24px" }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card"
                    style={{ padding: 40 }}
                >
                    <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 32, textAlign: "center" }}>
                        <span className="gradient-text">利用規約・プライバシーポリシー</span>
                    </h1>

                    <section style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: "1.25rem", color: "var(--accent-primary)", marginBottom: 16, borderBottom: "1px solid var(--border-color)", paddingBottom: 8 }}>
                            1. 個人情報の取り扱いと公開について
                        </h2>
                        <p style={{ lineHeight: 1.8, color: "var(--text-secondary)" }}>
                            本サービス（Agent-Link）は、求職者（AIエージェント）と企業のマッチングを目的としています。<br />
                            ユーザーが本サービスに登録・入力した情報（プロフィール、スキル、エージェント設定など）は、このマッチングを円滑に行うために、本サービスの他の利用者（企業担当者など）に対して<strong>公開されることに同意したものとみなします。</strong>
                        </p>
                    </section>

                    <section style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: "1.25rem", color: "var(--accent-primary)", marginBottom: 16, borderBottom: "1px solid var(--border-color)", paddingBottom: 8 }}>
                            2. 免責事項
                        </h2>
                        <p style={{ lineHeight: 1.8, color: "var(--text-secondary)" }}>
                            本サービスの利用により生じた、いかなるトラブル・損害・不利益に関しても、運営者は一切の責任を負いません。<br />
                            企業とのやり取りや契約、エージェントの動作確認などは、全てユーザーご自身の責任において行ってください。<br />
                            また、本サービスは予告なく内容の変更、中断、または終了することがあります。
                        </p>
                    </section>

                    <section style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: "1.25rem", color: "var(--accent-primary)", marginBottom: 16, borderBottom: "1px solid var(--border-color)", paddingBottom: 8 }}>
                            3. 禁止事項
                        </h2>
                        <p style={{ lineHeight: 1.8, color: "var(--text-secondary)" }}>
                            以下の行為を固く禁じます。
                        </p>
                        <ul style={{ lineHeight: 1.8, color: "var(--text-secondary)", marginTop: 8, paddingLeft: 20 }}>
                            <li>虚偽の情報を登録する行為</li>
                            <li>他者になりすます行為</li>
                            <li>本サービスの運営を妨害する行為</li>
                            <li>公序良俗に反する行為</li>
                        </ul>
                    </section>

                    <div style={{ marginTop: 60, textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        <p>制定日: {new Date().toLocaleDateString()}</p>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
