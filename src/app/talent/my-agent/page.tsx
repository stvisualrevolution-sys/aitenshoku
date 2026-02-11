"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface SessionSummary {
    sessionId: string;
    companyLabel: string;
    startedAt: string;
    lastMessageAt: string;
    messageCount: number;
    lastMessage: string | null;
}

interface Agent {
    agentId: string;
    agentName: string;
    ownerName: string;
    title: string;
    endpointUrl: string;
    registeredAt: string;
}

interface ChatLogEntry {
    id: string;
    role: "company" | "agent" | "system" | "talent";
    content: string;
    timestamp: string;
}

interface SessionDetail {
    sessionId: string;
    companyLabel: string;
    startedAt: string;
    messages: ChatLogEntry[];
}

export default function MyAgentPage() {
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);
    const [agent, setAgent] = useState<Agent | null>(null);
    const [sessions, setSessions] = useState<SessionSummary[]>([]);
    const [selectedSession, setSelectedSession] = useState<SessionDetail | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Direct Chat Input
    const [directInput, setDirectInput] = useState("");
    const [sending, setSending] = useState(false);

    // 初期ロード
    useEffect(() => {
        const storedToken = localStorage.getItem("agent-link-token");
        if (!storedToken) {
            router.push("/talent/login");
            return;
        }
        setToken(storedToken);
        fetchDashboard(storedToken);
    }, [router]);

    useEffect(() => {
        if (selectedSession && bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [selectedSession]);

    const fetchDashboard = async (t: string) => {
        setLoading(true);
        try {
            const res = await fetch("/api/chat-history", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: t }),
            });
            const data = await res.json();
            if (res.ok) {
                setAgent(data.agent);
                setSessions(data.sessions || []);
            } else {
                setError(data.error || "データの取得に失敗しました。");
                localStorage.removeItem("agent-link-token");
                setTimeout(() => router.push("/talent/login"), 2000);
            }
        } catch {
            setError("サーバーに接続できませんでした。");
        } finally {
            setLoading(false);
        }
    };

    const fetchSessionDetail = async (sessionId: string) => {
        if (!token) return;
        try {
            const res = await fetch("/api/chat-history", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, sessionId }),
            });
            const data = await res.json();
            if (res.ok && data.session) {
                setSelectedSession(data.session);
            }
        } catch {
            /* silent */
        }
    };

    const handleDirectSend = async () => {
        if (!directInput.trim() || !selectedSession || !agent || !token) return;
        setSending(true);
        try {
            const res = await fetch("/api/chat/direct", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    agentId: agent.agentId,
                    sessionId: selectedSession.sessionId,
                    content: directInput.trim()
                })
            });

            if (res.ok) {
                // UI更新
                const newMessage: ChatLogEntry = {
                    id: Math.random().toString(),
                    role: "talent",
                    content: directInput.trim(),
                    timestamp: new Date().toISOString()
                };
                setSelectedSession(prev => prev ? {
                    ...prev,
                    messages: [...prev.messages, newMessage]
                } : null);
                setDirectInput("");
            } else {
                alert("送信に失敗しました");
            }
        } catch {
            alert("エラーが発生しました");
        } finally {
            setSending(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("agent-link-token");
        router.push("/talent/login");
    };

    const handleRefresh = () => {
        if (token) {
            if (selectedSession) {
                fetchSessionDetail(selectedSession.sessionId);
            } else {
                fetchDashboard(token);
            }
        }
    };

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return "たった今";
        if (minutes < 60) return `${minutes}分前`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}時間前`;
        return `${Math.floor(hours / 24)}日前`;
    };

    if (loading) {
        return <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>Loading...</div>;
    }

    if (error) {
        return <div style={{ minHeight: "100vh", color: "red", display: "flex", justifyContent: "center", alignItems: "center" }}>{error}</div>;
    }

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
            <Navbar />

            <main style={{ maxWidth: 900, margin: "0 auto", padding: "100px 24px 60px" }}>
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
                    <div>
                        <h1 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: 8 }}>
                            🏠 <span className="gradient-text">マイエージェント</span>
                        </h1>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                            企業とのチャット履歴を確認できます。あなた自身も会話に参加できます。
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn-secondary" onClick={handleRefresh} style={{ padding: "8px 16px", fontSize: "0.8rem" }}>🔄 更新</button>
                        <button onClick={handleLogout} style={{ padding: "8px 16px", fontSize: "0.8rem", borderRadius: 10, background: "rgba(239,83,80,0.1)", border: "1px solid rgba(239,83,80,0.2)", color: "var(--danger)", cursor: "pointer" }}>🚪 ログアウト</button>
                    </div>
                </motion.div>

                {/* Session List / Detail */}
                <AnimatePresence mode="wait">
                    {selectedSession ? (
                        <motion.div key="detail" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                            <button onClick={() => setSelectedSession(null)} className="btn-secondary" style={{ marginBottom: 20, fontSize: "0.85rem" }}>
                                ← セッション一覧に戻る
                            </button>

                            <div className="glass-card" style={{ padding: 28, position: "relative" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid var(--border-color)" }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>💬 {selectedSession.companyLabel}</div>
                                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{new Date(selectedSession.startedAt).toLocaleString("ja-JP")}</div>
                                    </div>
                                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{selectedSession.messages.length}件のメッセージ</div>
                                </div>

                                {/* Chat Messages */}
                                <div style={{ display: "flex", flexDirection: "column", gap: 16, maxHeight: "500px", overflowY: "auto", paddingRight: 8, paddingBottom: 80 }}>
                                    {selectedSession.messages.map((msg) => (
                                        <div key={msg.id} style={{ display: "flex", justifyContent: msg.role === "company" ? "flex-start" : msg.role === "agent" ? "flex-end" : msg.role === "talent" ? "flex-end" : "center" }}>
                                            {msg.role === "company" && <div style={{ fontSize: "1.3rem", marginRight: 10, marginTop: 4 }}>🏢</div>}
                                            {msg.role === "system" ? (
                                                <div style={{ padding: "8px 16px", borderRadius: 10, background: "rgba(255,167,38,0.1)", border: "1px solid rgba(255,167,38,0.2)", color: "var(--warning)", fontSize: "0.8rem" }}>{msg.content}</div>
                                            ) : (
                                                <div style={{
                                                    maxWidth: "75%",
                                                    padding: "12px 18px",
                                                    borderRadius: msg.role === "company" ? "4px 18px 18px 18px" : "18px 4px 18px 18px",
                                                    background: msg.role === "company" ? "rgba(116,185,255,0.1)" : msg.role === "talent" ? "rgba(108,92,231,0.25)" : "rgba(108,92,231,0.15)",
                                                    border: `1px solid ${msg.role === "company" ? "rgba(116,185,255,0.2)" : "rgba(108,92,231,0.25)"}`,
                                                }}>
                                                    <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginBottom: 6 }}>
                                                        {msg.role === "company" ? "🏢 企業" : msg.role === "talent" ? "👤 あなた" : "🤖 エージェント"} • {new Date(msg.timestamp).toLocaleTimeString("ja-JP")}
                                                    </div>
                                                    <p style={{ margin: 0, fontSize: "0.85rem", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{msg.content}</p>
                                                </div>
                                            )}
                                            {(msg.role === "agent" || msg.role === "talent") && <div style={{ fontSize: "1.3rem", marginLeft: 10, marginTop: 4 }}>{msg.role === "agent" ? "🤖" : "👤"}</div>}
                                        </div>
                                    ))}
                                    <div ref={bottomRef} />
                                </div>

                                {/* Direct Input Area */}
                                <div style={{ marginTop: 20, borderTop: "1px solid var(--border-color)", paddingTop: 16, display: "flex", gap: 10 }}>
                                    <input
                                        className="input-field"
                                        placeholder="直接メッセージを送る..."
                                        value={directInput}
                                        onChange={(e) => setDirectInput(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleDirectSend()}
                                        style={{ flex: 1 }}
                                    />
                                    <button
                                        className="btn-primary"
                                        onClick={handleDirectSend}
                                        disabled={sending || !directInput.trim()}
                                        style={{ whiteSpace: "nowrap" }}
                                    >
                                        {sending ? "..." : "送信"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                                <span>💬</span> チャット履歴
                            </h2>

                            {sessions.length === 0 ? (
                                <div className="glass-card" style={{ padding: 48, textAlign: "center" }}>
                                    <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>📭</div>
                                    <div style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 8 }}>まだチャット履歴がありません</div>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                    {sessions.map((session, i) => (
                                        <motion.div
                                            key={session.sessionId}
                                            className="glass-card"
                                            style={{ padding: 24, cursor: "pointer", transition: "all 0.2s" }}
                                            onClick={() => fetchSessionDetail(session.sessionId)}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.05 * i }}
                                            whileHover={{ scale: 1.01, borderColor: "rgba(108,92,231,0.4)" }}
                                        >
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                    <span style={{ fontSize: "1.5rem" }}>🏢</span>
                                                    <div>
                                                        <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{session.companyLabel}</div>
                                                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{timeAgo(session.lastMessageAt)}</div>
                                                    </div>
                                                </div>
                                                <div style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(108,92,231,0.1)", fontSize: "0.7rem", color: "var(--accent-secondary)" }}>
                                                    {session.messageCount}件
                                                </div>
                                            </div>

                                            {session.lastMessage && (
                                                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", padding: "10px 14px", borderRadius: 10, background: "rgba(0,0,0,0.2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    💬 {session.lastMessage}
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
