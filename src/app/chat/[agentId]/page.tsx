"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
// mockAgentsは使わずAPIから取得するように変更すべきだが、
// 簡易的にエージェント表示用メタデータとして利用しつつ、実データはAPIでやり取りする
import { mockAgents } from "@/lib/mock-data";

interface Message {
    role: "user" | "agent" | "system" | "talent";
    content: string;
}

export default function ChatPage() {
    const params = useParams();
    const router = useRouter();
    const agentId = params?.agentId as string;

    // 表示用情報（本来はAPIでagentIdから取得すべき）
    // mockAgentsにない場合はデフォルト表示
    const agentDisplay = mockAgents.find((a) => a.id === agentId) || {
        id: agentId,
        name: "Unknown Agent",
        avatarEmoji: "🤖",
        title: "AI Agent",
        ownerName: "求職者",
        isOnline: true, // 仮
        endpointUrl: "/api/mock-ep/chat" // 仮
    };

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 1. ログインチェック & 履歴取得
    useEffect(() => {
        const companyToken = localStorage.getItem("company-token");
        if (!companyToken) {
            // トークンがない場合、ログインへ誘導
            router.push(`/recruiter/login?redirect=/chat/${agentId}`);
            return;
        }

        const fetchHistory = async () => {
            try {
                const res = await fetch("/api/company/chat-history", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ companyToken, agentId })
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.sessionId) {
                        setSessionId(data.sessionId);
                    } else {
                        // セッションがない場合は新規作成用のIDを生成
                        setSessionId(`session-${Date.now()}-${Math.random().toString(36).slice(2)}`);
                    }
                    if (data.messages) {
                        setMessages(data.messages);
                    }
                }
            } catch (e) {
                console.error("Failed to load history", e);
            } finally {
                setIsLoadingHistory(false);
            }
        };

        fetchHistory();
    }, [agentId, router]);

    // スクロール
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);


    const sendToAgent = async (message: string) => {
        if (!sessionId) return; // Should not happen after load

        setMessages((prev) => [...prev, { role: "user", content: message }]);
        setIsTyping(true);

        // search-agents等から取得した正しいEndpointを使うべきだが、
        // 今回は簡易的にmock-dataまたはDBからとるのが正しい。
        // ここでは api/chat が endpointUrl を要求する仕様になっているため、
        // frontendで持っている情報を送る必要がある。
        // (本当はbackendでlookupすべき)
        // とりあえず agentDisplay.endpointUrl を使う

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    endpointUrl: agentDisplay.endpointUrl, // 注意: これが正しくないと動かない
                    message,
                    sessionId,
                    agentId: agentId,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessages((prev) => [...prev, { role: "agent", content: data.response }]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    { role: "system", content: `⚠️ ${data.error}` },
                ]);
            }
        } catch {
            setMessages((prev) => [
                ...prev,
                { role: "system", content: "⚠️ ネットワークエラーが発生しました。" },
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSend = () => {
        if (!input.trim() || isTyping) return;
        const message = input.trim();
        setInput("");
        sendToAgent(message);
    };

    if (isLoadingHistory) {
        return <div style={{ padding: 40, color: "white", textAlign: "center" }}>履歴を読み込み中...</div>;
    }

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", flexDirection: "column" }}>
            {/* Chat Header */}
            <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, backdropFilter: "blur(20px)", background: "rgba(10,10,15,0.85)", borderBottom: "1px solid var(--border-color)" }}>
                <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px", height: 72, display: "flex", alignItems: "center", gap: 16 }}>
                    <Link href="/recruiter/search" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "1.1rem", padding: "4px 8px" }}>←</Link>
                    <div style={{ fontSize: "2rem", width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 14, background: "rgba(108,92,231,0.1)" }}>{agentDisplay.avatarEmoji}</div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: "1rem" }}>{agentDisplay.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                            <span className={`status-dot ${agentDisplay.isOnline ? "status-active" : ""}`} />
                            {agentDisplay.title}
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, maxWidth: 800, width: "100%", margin: "0 auto", padding: "96px 24px 140px", display: "flex", flexDirection: "column", gap: 16 }}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: 16, fontSize: "0.8rem", color: "var(--text-muted)", borderRadius: 12, background: "rgba(108,92,231,0.05)", border: "1px solid var(--border-color)" }}>
                    🔗 このチャットは <strong>{agentDisplay.ownerName}</strong> と接続されています
                </motion.div>

                {messages.length === 0 && (
                    <div style={{ textAlign: "center", color: "#aaa", marginTop: 40 }}>まだメッセージはありません。挨拶してみましょう！</div>
                )}

                {messages.map((msg, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                        style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : msg.role === "system" ? "center" : "flex-start" }}>

                        {(msg.role === "agent" || msg.role === "talent") && (
                            <div style={{ fontSize: "1.3rem", marginRight: 10, marginTop: 4 }}>
                                {msg.role === "agent" ? agentDisplay.avatarEmoji : "👤"}
                            </div>
                        )}

                        {msg.role === "system" ? (
                            <div style={{ padding: "10px 20px", borderRadius: 12, background: "rgba(239,83,80,0.1)", border: "1px solid rgba(239,83,80,0.2)", color: "var(--danger)", fontSize: "0.8rem", maxWidth: "80%", textAlign: "center", lineHeight: 1.6 }}>{msg.content}</div>
                        ) : (
                            <div
                                className={msg.role === "user" ? "chat-bubble-user" : "chat-bubble-agent"}
                                style={msg.role === "talent" ? { border: "2px solid #6c5ce7", background: "rgba(108,92,231,0.1)" } : {}}
                            >
                                {msg.role === "talent" && <div style={{ fontSize: "0.7rem", color: "#6c5ce7", marginBottom: 4, fontWeight: "bold" }}>求職者本人</div>}
                                <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{msg.content}</p>
                            </div>
                        )}
                    </motion.div>
                ))}

                {isTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", alignItems: "flex-start" }}>
                        <div style={{ fontSize: "1.3rem", marginRight: 10, marginTop: 4 }}>{agentDisplay.avatarEmoji}</div>
                        <div className="chat-bubble-agent">
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span className="typing-cursor" style={{ fontSize: "0.9rem" }}>エージェント応答中</span>
                            </div>
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, backdropFilter: "blur(20px)", background: "rgba(10,10,15,0.9)", borderTop: "1px solid var(--border-color)", padding: "16px 24px" }}>
                <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", gap: 12 }}>
                    <input className="input-field" placeholder="メッセージを入力..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }} style={{ flex: 1 }} />
                    <button className="btn-primary" onClick={handleSend} disabled={isTyping || !input.trim()} style={{ padding: "12px 24px", opacity: isTyping || !input.trim() ? 0.5 : 1 }}>送信</button>
                </div>
            </div>
        </div>
    );
}
