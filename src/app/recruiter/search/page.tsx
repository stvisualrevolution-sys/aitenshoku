"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface AgentResult {
    agentId: string;
    agentName: string;
    ownerName: string;
    title: string;
    endpointUrl: string;
    skills: string[];
    minimumSalary: number | null;
    workStyle: string | null;
    bio: string | null;
    region: string | null;
    avgResponseMs: number | null;
    lastPingMs: number | null;
    isOnline: boolean;
    registeredAt: string;
    isDemo: boolean;
}

interface CompanyInfo {
    companyId: string;
    companyName: string;
    contactName: string;
}

interface ChatMsg {
    role: "user" | "agent" | "system";
    content: string;
}

const SKILL_OPTIONS = [
    "python", "typescript", "javascript", "go", "rust", "java",
    "react", "next.js", "vue", "fastapi", "django", "pytorch",
    "tensorflow", "docker", "kubernetes", "aws", "gcp", "azure",
];

export default function RecruiterSearch() {
    const router = useRouter();
    const [agents, setAgents] = useState<AgentResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    // 認証
    const [authChecking, setAuthChecking] = useState(true);
    const [company, setCompany] = useState<CompanyInfo | null>(null);

    // フィルタ
    const [query, setQuery] = useState("");
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [maxSalary, setMaxSalary] = useState<string>("");
    const [onlineOnly, setOnlineOnly] = useState(false);

    // フローティングチャット
    const [chatAgent, setChatAgent] = useState<AgentResult | null>(null);
    const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
    const [chatInput, setChatInput] = useState("");
    const [chatTyping, setChatTyping] = useState(false);
    const [chatSessionId] = useState(() => `recruiter-${Date.now()}`);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // 認証チェック
    useEffect(() => {
        const token = localStorage.getItem("company-token");
        if (!token) {
            router.push("/recruiter/login");
            return;
        }
        fetch("/api/company/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
        })
            .then((r) => r.json())
            .then((data) => {
                if (data.success) {
                    setCompany(data.company);
                } else {
                    localStorage.removeItem("company-token");
                    router.push("/recruiter/login");
                }
            })
            .catch(() => {
                router.push("/recruiter/login");
            })
            .finally(() => setAuthChecking(false));
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("company-token");
        router.push("/recruiter/login");
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages, chatTyping]);

    const toggleSkill = (skill: string) => {
        setSelectedSkills((prev) =>
            prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
        );
    };

    const handleSearch = useCallback(async () => {
        setLoading(true);
        setSearched(true);
        try {
            const res = await fetch("/api/search-agents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    query: query || undefined,
                    skillFilter: selectedSkills.length > 0 ? selectedSkills : undefined,
                    maxSalary: maxSalary ? parseInt(maxSalary) * 10000 : undefined,
                    onlineOnly,
                }),
            });
            const data = await res.json();
            setAgents(data.agents || []);
        } catch {
            setAgents([]);
        } finally {
            setLoading(false);
        }
    }, [query, selectedSkills, maxSalary, onlineOnly]);

    // チャット開始
    const startChat = (agent: AgentResult) => {
        setChatAgent(agent);
        setChatMessages([]);
        setChatInput("");
        // 初回挨拶
        sendChatMessage(agent, "こんにちは。採用担当として、お話を聞かせてください。", true);
    };

    const sendChatMessage = async (agent: AgentResult, message: string, isInitial = false) => {
        if (!isInitial) {
            setChatMessages((prev) => [...prev, { role: "user", content: message }]);
        }
        setChatTyping(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    endpointUrl: agent.endpointUrl,
                    message,
                    sessionId: chatSessionId,
                    agentId: agent.agentId,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setChatMessages((prev) => [...prev, { role: "agent", content: data.response }]);
            } else {
                setChatMessages((prev) => [...prev, { role: "system", content: `⚠️ ${data.error}` }]);
            }
        } catch {
            setChatMessages((prev) => [...prev, { role: "system", content: "⚠️ 接続エラー" }]);
        } finally {
            setChatTyping(false);
        }
    };

    const handleChatSend = () => {
        if (!chatInput.trim() || chatTyping || !chatAgent) return;
        const msg = chatInput.trim();
        setChatInput("");
        sendChatMessage(chatAgent, msg);
    };

    // 応答速度バッジ
    const speedBadge = (ms: number | null) => {
        if (ms === null) return null;
        let color = "var(--success)";
        let label = "⚡ 超高速";
        let bg = "rgba(0,230,118,0.1)";
        if (ms > 3000) {
            color = "var(--danger)";
            label = "🐢 低速";
            bg = "rgba(239,83,80,0.1)";
        } else if (ms > 1000) {
            color = "var(--warning)";
            label = "🏃 普通";
            bg = "rgba(255,167,38,0.1)";
        }
        return (
            <span style={{ padding: "3px 10px", borderRadius: 8, fontSize: "0.65rem", fontWeight: 700, color, background: bg, border: `1px solid ${color}22` }}>
                {label} {ms}ms
            </span>
        );
    };

    // ハイスペック判定（速度 < 500ms && オンライン）
    const isHighSpec = (a: AgentResult) => a.isOnline && a.avgResponseMs !== null && a.avgResponseMs < 500;

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
            <Navbar />

            {authChecking ? (
                <main style={{ maxWidth: 500, margin: "0 auto", padding: "200px 24px", textAlign: "center" }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        style={{ fontSize: "3rem", display: "inline-block", marginBottom: 16 }}>🔐</motion.div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>認証を確認中...</div>
                </main>
            ) : !company ? null : (
                <main style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 24px 60px" }}>
                    {/* Header */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 4 }}>
                        <div>
                            <h1 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: 8 }}>
                                🏢 <span className="gradient-text">エージェント検索</span>
                            </h1>
                            <p style={{ color: "var(--text-secondary)", marginBottom: 32, fontSize: "0.95rem" }}>
                                登録済みの求職者AIエージェントをスキル・年収で検索し、リアルタイム対話できます。
                            </p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)" }}>
                            <div>
                                <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>{company.companyName}</div>
                                <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{company.contactName}</div>
                            </div>
                            <button onClick={handleLogout} style={{ padding: "6px 12px", borderRadius: 8, fontSize: "0.7rem", background: "rgba(239,83,80,0.1)", border: "1px solid rgba(239,83,80,0.2)", color: "var(--danger)", cursor: "pointer" }}>
                                ログアウト
                            </button>
                        </div>
                    </motion.div>

                    {/* Filter Panel */}
                    <motion.div className="glass-card" style={{ padding: 28, marginBottom: 28 }} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        {/* Search Bar */}
                        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                            <input
                                className="input-field"
                                placeholder="🔍 名前、タイトル、スキルで検索..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                                style={{ flex: 1 }}
                            />
                            <button className="btn-primary" onClick={handleSearch} disabled={loading} style={{ padding: "12px 28px", fontSize: "0.9rem" }}>
                                {loading ? "⏳ 検索中..." : "🔍 検索"}
                            </button>
                        </div>

                        {/* Skill Tags */}
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>スキルフィルタ</div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {SKILL_OPTIONS.map((skill) => (
                                    <button
                                        key={skill}
                                        onClick={() => toggleSkill(skill)}
                                        style={{
                                            padding: "5px 14px",
                                            borderRadius: 20,
                                            fontSize: "0.75rem",
                                            fontWeight: 600,
                                            cursor: "pointer",
                                            transition: "all 0.2s",
                                            border: selectedSkills.includes(skill) ? "1px solid var(--accent-primary)" : "1px solid var(--border-color)",
                                            background: selectedSkills.includes(skill) ? "rgba(108,92,231,0.2)" : "transparent",
                                            color: selectedSkills.includes(skill) ? "var(--accent-secondary)" : "var(--text-secondary)",
                                        }}
                                    >
                                        {skill}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Salary + Online Filter */}
                        <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>予算上限:</span>
                                <input
                                    className="input-field"
                                    type="number"
                                    placeholder="万円"
                                    value={maxSalary}
                                    onChange={(e) => setMaxSalary(e.target.value)}
                                    style={{ width: 100, textAlign: "right" }}
                                />
                                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>万円/年</span>
                            </div>
                            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                                <input type="checkbox" checked={onlineOnly} onChange={(e) => setOnlineOnly(e.target.checked)}
                                    style={{ width: 16, height: 16, accentColor: "var(--accent-primary)" }} />
                                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>オンラインのみ</span>
                            </label>
                        </div>
                    </motion.div>

                    {/* Results */}
                    {!searched ? (
                        <motion.div className="glass-card" style={{ padding: 60, textAlign: "center" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div style={{ fontSize: "3rem", marginBottom: 16 }}>🔍</div>
                            <div style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 8 }}>エージェントを検索しましょう</div>
                            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>上のフィルタを設定して「検索」ボタンを押してください</p>
                        </motion.div>
                    ) : loading ? (
                        <motion.div className="glass-card" style={{ padding: 60, textAlign: "center" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                style={{ fontSize: "3rem", display: "inline-block", marginBottom: 16 }}>⚡</motion.div>
                            <div style={{ fontSize: "1rem", fontWeight: 600 }}>全エージェントに接続テスト中...</div>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>オンライン状態と応答速度を計測しています</p>
                        </motion.div>
                    ) : agents.length === 0 ? (
                        <motion.div className="glass-card" style={{ padding: 60, textAlign: "center" }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div style={{ fontSize: "3rem", marginBottom: 16 }}>📭</div>
                            <div style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 8 }}>条件に合うエージェントが見つかりません</div>
                            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>フィルタ条件を変更するか、まだエージェントが登録されていない可能性があります。</p>
                        </motion.div>
                    ) : (
                        <div>
                            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 16 }}>
                                {agents.length}件のエージェントが見つかりました
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
                                {agents.map((agent, i) => (
                                    <motion.div
                                        key={agent.agentId}
                                        className="glass-card"
                                        style={{
                                            padding: 0,
                                            overflow: "hidden",
                                            position: "relative",
                                            cursor: "default",
                                            border: isHighSpec(agent) ? "1px solid rgba(108,92,231,0.4)" : undefined,
                                        }}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.05 * i }}
                                        whileHover={{ scale: 1.01 }}
                                    >
                                        {/* High-spec glow */}
                                        {isHighSpec(agent) && (
                                            <div style={{
                                                position: "absolute", top: 0, left: 0, right: 0, height: 3,
                                                background: "linear-gradient(90deg, var(--accent-primary), #00e676, var(--accent-primary))",
                                                backgroundSize: "200% 100%",
                                                animation: "shimmer 2s infinite linear",
                                            }} />
                                        )}

                                        <div style={{ padding: 24 }}>
                                            {/* Header */}
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                                                <div style={{ display: "flex", gap: 12 }}>
                                                    <div style={{
                                                        width: 48, height: 48, borderRadius: 14,
                                                        background: isHighSpec(agent) ? "rgba(108,92,231,0.2)" : "rgba(255,255,255,0.05)",
                                                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem",
                                                        border: isHighSpec(agent) ? "1px solid rgba(108,92,231,0.3)" : "none",
                                                    }}>
                                                        🤖
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 700, fontSize: "1rem", display: "flex", alignItems: "center", gap: 6 }}>
                                                            {agent.agentName}
                                                            {agent.isDemo && <span style={{ fontSize: "0.6rem", padding: "2px 7px", borderRadius: 6, background: "rgba(255,167,38,0.15)", color: "var(--warning)", border: "1px solid rgba(255,167,38,0.3)" }}>DEMO</span>}
                                                            {isHighSpec(agent) && <span style={{ fontSize: "0.65rem", padding: "2px 8px", borderRadius: 6, background: "rgba(108,92,231,0.15)", color: "var(--accent-secondary)" }}>★ ハイスぺ</span>}
                                                        </div>
                                                        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{agent.title}</div>
                                                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                                                            👤 {agent.ownerName}
                                                            {agent.region && ` • 📍 ${agent.region}`}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                                                    <span className={`status-dot ${agent.isOnline ? "status-active" : "status-offline"}`} style={{ width: 10, height: 10, display: "inline-block", borderRadius: "50%", background: agent.isOnline ? "var(--success)" : "var(--text-muted)" }} />
                                                    <span style={{ fontSize: "0.65rem", color: agent.isOnline ? "var(--success)" : "var(--text-muted)" }}>
                                                        {agent.isOnline ? "オンライン" : "オフライン"}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Speed + Salary */}
                                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                                                {speedBadge(agent.avgResponseMs)}
                                                {agent.minimumSalary && (
                                                    <span style={{ padding: "3px 10px", borderRadius: 8, fontSize: "0.65rem", fontWeight: 700, color: "var(--text-secondary)", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)" }}>
                                                        💰 {(agent.minimumSalary / 10000).toLocaleString()}万〜
                                                    </span>
                                                )}
                                                {agent.workStyle && (
                                                    <span style={{ padding: "3px 10px", borderRadius: 8, fontSize: "0.65rem", color: "var(--text-muted)", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)" }}>
                                                        🏠 {agent.workStyle}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Skills */}
                                            {agent.skills.length > 0 && (
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 14 }}>
                                                    {agent.skills.slice(0, 8).map((s) => (
                                                        <span key={s} className="skill-badge" style={{ fontSize: "0.65rem", padding: "3px 8px" }}>{s}</span>
                                                    ))}
                                                    {agent.skills.length > 8 && (
                                                        <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", padding: "3px 4px" }}>+{agent.skills.length - 8}</span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Bio snippet */}
                                            {agent.bio && (
                                                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 16, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                                                    {agent.bio}
                                                </p>
                                            )}

                                            {/* CTA */}
                                            <button
                                                className={agent.isOnline ? "btn-primary" : "btn-secondary"}
                                                onClick={() => agent.isOnline && startChat(agent)}
                                                disabled={!agent.isOnline}
                                                style={{ width: "100%", padding: "10px", fontSize: "0.85rem", opacity: agent.isOnline ? 1 : 0.5 }}
                                            >
                                                {agent.isOnline ? "💬 対話を開始する" : "🔌 オフライン"}
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            )}

            {/* =================== Floating Chat Panel =================== */}
            <AnimatePresence>
                {chatAgent && (
                    <motion.div
                        initial={{ x: 420, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 420, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        style={{
                            position: "fixed",
                            top: 0,
                            right: 0,
                            width: 400,
                            height: "100vh",
                            background: "rgba(10,10,15,0.97)",
                            borderLeft: "1px solid var(--border-color)",
                            backdropFilter: "blur(20px)",
                            zIndex: 100,
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        {/* Chat Header */}
                        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(108,92,231,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" }}>🤖</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{chatAgent.agentName}</div>
                                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)", display: "inline-block" }} />
                                    {chatAgent.ownerName}のエージェント
                                    {chatAgent.avgResponseMs && <span> • {chatAgent.avgResponseMs}ms</span>}
                                </div>
                            </div>
                            <button
                                onClick={() => setChatAgent(null)}
                                style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(239,83,80,0.1)", border: "1px solid rgba(239,83,80,0.2)", color: "var(--danger)", cursor: "pointer", fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center" }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Chat Connection Banner */}
                        <div style={{ padding: "8px 20px", background: "rgba(0,230,118,0.05)", borderBottom: "1px solid rgba(0,230,118,0.1)", fontSize: "0.7rem", color: "var(--success)", textAlign: "center" }}>
                            🔗 {chatAgent.ownerName}のPC上のエージェントに接続中
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                            {chatMessages.map((msg, i) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : msg.role === "system" ? "center" : "flex-start" }}>
                                    {msg.role === "system" ? (
                                        <div style={{ padding: "6px 14px", borderRadius: 10, background: "rgba(239,83,80,0.1)", border: "1px solid rgba(239,83,80,0.15)", fontSize: "0.75rem", color: "var(--danger)" }}>{msg.content}</div>
                                    ) : (
                                        <div style={{
                                            maxWidth: "85%",
                                            padding: "10px 14px",
                                            borderRadius: msg.role === "user" ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
                                            background: msg.role === "user" ? "rgba(108,92,231,0.2)" : "rgba(255,255,255,0.05)",
                                            border: `1px solid ${msg.role === "user" ? "rgba(108,92,231,0.3)" : "var(--border-color)"}`,
                                        }}>
                                            <p style={{ margin: 0, fontSize: "0.82rem", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{msg.content}</p>
                                        </div>
                                    )}
                                </motion.div>
                            ))}

                            {chatTyping && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex" }}>
                                    <div style={{ padding: "10px 14px", borderRadius: "4px 14px 14px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)" }}>
                                        <span className="typing-cursor" style={{ fontSize: "0.8rem" }}>応答中</span>
                                        <span style={{ fontSize: "0.6rem", color: "var(--text-muted)", marginLeft: 6 }}>（ローカルPC経由）</span>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Suggested Questions */}
                        {chatMessages.length <= 1 && !chatTyping && (
                            <div style={{ padding: "0 20px 12px", display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {["スキルを教えて", "希望年収は？", "いつから入社可能？", "ポートフォリオを見せて"].map((q) => (
                                    <button key={q} onClick={() => { setChatInput(q); }}
                                        style={{ padding: "5px 12px", borderRadius: 16, background: "rgba(108,92,231,0.08)", border: "1px solid rgba(108,92,231,0.2)", color: "var(--accent-secondary)", cursor: "pointer", fontSize: "0.7rem" }}
                                    >{q}</button>
                                ))}
                            </div>
                        )}

                        {/* Input */}
                        <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border-color)", display: "flex", gap: 8 }}>
                            <input
                                className="input-field"
                                placeholder="質問を入力..."
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") handleChatSend(); }}
                                style={{ flex: 1, fontSize: "0.85rem" }}
                            />
                            <button className="btn-primary" onClick={handleChatSend} disabled={chatTyping || !chatInput.trim()}
                                style={{ padding: "10px 18px", fontSize: "0.85rem", opacity: chatTyping || !chatInput.trim() ? 0.5 : 1 }}>
                                送信
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Overlay when chat is open */}
            <AnimatePresence>
                {chatAgent && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setChatAgent(null)}
                        style={{ position: "fixed", top: 0, left: 0, right: 400, bottom: 0, background: "rgba(0,0,0,0.3)", zIndex: 99 }}
                    />
                )}
            </AnimatePresence>

            {/* Shimmer animation for high-spec cards */}
            <style jsx>{`
                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
        </div>
    );
}
