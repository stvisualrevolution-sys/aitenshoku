"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { AgentManifest, ManifestSkill, HealthCheckResult } from "@/lib/types";
import { parseManifest } from "@/lib/manifest-parser";

type FlowStep = "upload" | "preview" | "testing" | "result";

export default function TalentDashboard() {
    const [step, setStep] = useState<FlowStep>("upload");
    const [yamlContent, setYamlContent] = useState("");
    const [manifest, setManifest] = useState<AgentManifest | null>(null);
    const [parseErrors, setParseErrors] = useState<string[]>([]);
    const [parseWarnings, setParseWarnings] = useState<string[]>([]);
    const [healthCheck, setHealthCheck] = useState<HealthCheckResult | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [registrationResult, setRegistrationResult] = useState<{ success: boolean; agentId?: string; loginToken?: string; errors?: string[] } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ファイル読み込み処理
    const handleFile = useCallback((file: File) => {
        if (!file.name.endsWith(".yaml") && !file.name.endsWith(".yml")) {
            setParseErrors(["ファイル形式が正しくありません。.yaml または .yml ファイルをアップロードしてください。"]);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            setYamlContent(content);
            handleParse(content);
        };
        reader.onerror = () => {
            setParseErrors(["ファイルの読み込みに失敗しました。"]);
        };
        reader.readAsText(file);
    }, []);

    // YAML解析
    const handleParse = (content: string) => {
        const result = parseManifest(content);
        setParseErrors(result.errors);
        setParseWarnings(result.warnings);

        if (result.success && result.data) {
            setManifest(result.data);
            setStep("preview");
        }
    };

    // D&D
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };
    const handleDragLeave = () => setIsDragOver(false);
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    };
    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    // 接続テスト → 保存
    const handleRegister = async () => {
        if (!manifest) return;

        setStep("testing");
        setIsRegistering(true);
        setHealthCheck(null);

        try {
            const res = await fetch("/api/register-agent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ yamlContent }),
            });
            const data = await res.json();

            if (data.success) {
                setHealthCheck(data.healthCheck);
                setRegistrationResult({
                    success: data.healthCheck.online,
                    agentId: data.agentId,
                    loginToken: data.loginToken,
                });
            } else {
                setRegistrationResult({
                    success: false,
                    errors: data.errors,
                });
            }
        } catch {
            setRegistrationResult({
                success: false,
                errors: ["サーバーへの接続に失敗しました。"],
            });
        } finally {
            setIsRegistering(false);
            setStep("result");
        }
    };

    // リセット
    const handleReset = () => {
        setStep("upload");
        setYamlContent("");
        setManifest(null);
        setParseErrors([]);
        setParseWarnings([]);
        setHealthCheck(null);
        setRegistrationResult(null);
    };

    // スキル表示ヘルパー
    const renderSkills = (skills: ManifestSkill[] | undefined, label: string) => {
        if (!skills || skills.length === 0) return null;
        return (
            <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {skills.map((s, i) => (
                        <span key={i} className="skill-badge">
                            {s.name}
                            <span style={{ marginLeft: 6, fontSize: "0.65rem", opacity: 0.7 }}>{s.level}</span>
                        </span>
                    ))}
                </div>
            </div>
        );
    };

    // ステップ番号ヘルパー
    const stepIndex = { upload: 0, preview: 1, testing: 2, result: 3 };

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
            <Navbar />
            <main style={{ maxWidth: 800, margin: "0 auto", padding: "100px 24px 60px" }}>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: 8 }}>
                        📄 <span className="gradient-text">マニフェストをアップロード</span>
                    </h1>
                    <p style={{ color: "var(--text-secondary)", marginBottom: 32, fontSize: "0.95rem" }}>
                        YAMLマニフェストをアップロードして、あなたのAIエージェントを登録してください。
                    </p>
                </motion.div>

                {/* Progress Bar */}
                <div style={{ display: "flex", gap: 8, marginBottom: 40 }}>
                    {["アップロード", "プレビュー", "接続テスト", "完了"].map((label, i) => (
                        <div key={i} style={{ flex: 1, textAlign: "center" }}>
                            <div style={{
                                height: 4,
                                borderRadius: 2,
                                background: i <= stepIndex[step] ? "var(--accent-primary)" : "var(--border-color)",
                                transition: "all 0.5s ease",
                                marginBottom: 8,
                            }} />
                            <span style={{
                                fontSize: "0.7rem",
                                color: i <= stepIndex[step] ? "var(--accent-secondary)" : "var(--text-muted)",
                                fontWeight: i === stepIndex[step] ? 700 : 400,
                            }}>
                                {label}
                            </span>
                        </div>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {/* ===================== STEP 1: UPLOAD ===================== */}
                    {step === "upload" && (
                        <motion.div
                            key="upload"
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 30 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Drag & Drop Zone */}
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    padding: 60,
                                    borderRadius: 20,
                                    border: `2px dashed ${isDragOver ? "var(--accent-primary)" : "var(--border-color)"}`,
                                    background: isDragOver ? "rgba(108,92,231,0.08)" : "rgba(26,26,46,0.4)",
                                    cursor: "pointer",
                                    textAlign: "center",
                                    transition: "all 0.3s ease",
                                    marginBottom: 24,
                                }}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".yaml,.yml"
                                    onChange={handleFileInput}
                                    style={{ display: "none" }}
                                />
                                <div style={{ fontSize: "3rem", marginBottom: 16 }}>
                                    {isDragOver ? "📥" : "📄"}
                                </div>
                                <div style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 8, color: isDragOver ? "var(--accent-secondary)" : "var(--text-primary)" }}>
                                    {isDragOver ? "ここにドロップ！" : "YAMLマニフェストをドラッグ＆ドロップ"}
                                </div>
                                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                                    または クリックしてファイルを選択（.yaml / .yml）
                                </div>
                            </div>

                            {/* Parse Errors */}
                            {parseErrors.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="glass-card"
                                    style={{ padding: 24, borderColor: "rgba(239,83,80,0.3)", marginBottom: 24 }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                                        <span style={{ fontSize: "1.2rem" }}>❌</span>
                                        <span style={{ fontWeight: 700, color: "var(--danger)" }}>解析エラー</span>
                                    </div>
                                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                                        {parseErrors.map((err, i) => (
                                            <li key={i} style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 4 }}>{err}</li>
                                        ))}
                                    </ul>
                                </motion.div>
                            )}

                            {/* Sample Download */}
                            <div className="glass-card" style={{ padding: 24 }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: 4 }}>📝 サンプルマニフェスト</div>
                                        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>初めての方はサンプルをダウンロードしてカスタマイズしてください</div>
                                    </div>
                                    <a
                                        href="/sample-manifest.yaml"
                                        download="agent-manifest-sample.yaml"
                                        className="btn-secondary"
                                        style={{ padding: "8px 20px", fontSize: "0.85rem", textDecoration: "none" }}
                                    >
                                        ⬇️ ダウンロード
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ===================== STEP 2: PREVIEW ===================== */}
                    {step === "preview" && manifest && (
                        <motion.div
                            key="preview"
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 30 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="glass-card glow-box" style={{ padding: 32, marginBottom: 24 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid var(--border-color)" }}>
                                    <span style={{ fontSize: "1.3rem" }}>✅</span>
                                    <span style={{ fontWeight: 700, fontSize: "1.05rem" }}>このように登録されます</span>
                                </div>

                                {/* Agent Info */}
                                <div style={{ display: "flex", gap: 20, marginBottom: 28 }}>
                                    <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(108,92,231,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", flexShrink: 0 }}>
                                        🤖
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 4 }}>
                                            {manifest.agent_settings.name}
                                        </div>
                                        <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 2 }}>
                                            {manifest.candidate.basic_info.title || "未設定"}
                                        </div>
                                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                                            👤 {manifest.candidate.basic_info.name}
                                            {manifest.candidate.basic_info.region && ` • 📍 ${manifest.candidate.basic_info.region}`}
                                        </div>
                                    </div>
                                </div>

                                {/* Endpoint */}
                                <div style={{ padding: 16, borderRadius: 12, background: "rgba(0,0,0,0.3)", marginBottom: 24, fontFamily: "var(--font-mono)" }}>
                                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: 6 }}>エンドポイント</div>
                                    <div style={{ fontSize: "0.85rem", color: "var(--accent-secondary)", wordBreak: "break-all" }}>
                                        {manifest.agent_settings.endpoint}
                                    </div>
                                </div>

                                {/* Skills */}
                                <div style={{ marginBottom: 24 }}>
                                    <div style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: 12 }}>⚡ スキル</div>
                                    {renderSkills(manifest.candidate.skills.languages, "言語")}
                                    {renderSkills(manifest.candidate.skills.frameworks, "フレームワーク")}
                                    {renderSkills(manifest.candidate.skills.tools, "ツール")}
                                    {renderSkills(manifest.candidate.skills.other, "その他")}
                                </div>

                                {/* Preferences */}
                                {manifest.candidate.preferences && (
                                    <div style={{ marginBottom: 24 }}>
                                        <div style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: 12 }}>💼 希望条件</div>
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                                            {manifest.candidate.preferences.minimum_annual_salary && (
                                                <div style={{ padding: 14, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)" }}>
                                                    <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginBottom: 4 }}>最低希望年収</div>
                                                    <div style={{ fontSize: "1rem", fontWeight: 700 }}>
                                                        ¥{(manifest.candidate.preferences.minimum_annual_salary / 10000).toLocaleString()}万
                                                    </div>
                                                </div>
                                            )}
                                            {manifest.candidate.preferences.preferred_work_style && (
                                                <div style={{ padding: 14, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)" }}>
                                                    <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginBottom: 4 }}>勤務スタイル</div>
                                                    <div style={{ fontSize: "1rem", fontWeight: 700 }}>{manifest.candidate.preferences.preferred_work_style}</div>
                                                </div>
                                            )}
                                            {manifest.candidate.preferences.available_from && (
                                                <div style={{ padding: 14, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)" }}>
                                                    <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginBottom: 4 }}>入社可能日</div>
                                                    <div style={{ fontSize: "1rem", fontWeight: 700 }}>{manifest.candidate.preferences.available_from}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Bio */}
                                {manifest.candidate.bio && (
                                    <div style={{ marginBottom: 16 }}>
                                        <div style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: 8 }}>📝 自己紹介</div>
                                        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>{manifest.candidate.bio}</p>
                                    </div>
                                )}

                                {/* Portfolio */}
                                {manifest.candidate.portfolio && (
                                    <div>
                                        <div style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: 8 }}>🔗 ポートフォリオ</div>
                                        <a href={manifest.candidate.portfolio} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.85rem", color: "var(--accent-secondary)" }}>
                                            {manifest.candidate.portfolio}
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Warnings */}
                            {parseWarnings.length > 0 && (
                                <div className="glass-card" style={{ padding: 20, marginBottom: 24, borderColor: "rgba(255,167,38,0.3)" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                        <span>⚠️</span>
                                        <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--warning)" }}>注意事項</span>
                                    </div>
                                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                                        {parseWarnings.map((w, i) => (
                                            <li key={i} style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>{w}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Buttons */}
                            <div style={{ display: "flex", gap: 12 }}>
                                <button className="btn-secondary" onClick={handleReset} style={{ flex: 1 }}>
                                    ← やり直す
                                </button>
                                <button className="btn-primary" onClick={handleRegister} style={{ flex: 2 }}>
                                    🔌 接続テスト＆登録する
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* ===================== STEP 3: TESTING ===================== */}
                    {step === "testing" && (
                        <motion.div
                            key="testing"
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 30 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="glass-card glow-box" style={{ padding: 48, textAlign: "center" }}>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    style={{ fontSize: "3rem", display: "inline-block", marginBottom: 24 }}
                                >
                                    ⚡
                                </motion.div>
                                <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: 12 }}>
                                    エージェントに接続テスト中...
                                </h2>
                                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.7 }}>
                                    {manifest?.agent_settings.endpoint} にテストリクエストを送信しています。
                                    <br />
                                    最大15秒お待ちください。
                                </p>
                                <div style={{ marginTop: 24 }}>
                                    <motion.div
                                        style={{ height: 4, borderRadius: 2, background: "var(--accent-primary)" }}
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 15, ease: "linear" }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ===================== STEP 4: RESULT ===================== */}
                    {step === "result" && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 30 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Health Check Result */}
                            {healthCheck && (
                                <div className="glass-card" style={{
                                    padding: 32,
                                    marginBottom: 24,
                                    borderColor: healthCheck.online ? "rgba(0,230,118,0.3)" : "rgba(239,83,80,0.3)",
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                                        <span style={{ fontSize: "2rem" }}>
                                            {healthCheck.online ? "✅" : "⚠️"}
                                        </span>
                                        <div>
                                            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: healthCheck.online ? "var(--success)" : "var(--warning)" }}>
                                                {healthCheck.online ? "接続成功！" : "エージェントがオフラインです"}
                                            </div>
                                            {healthCheck.responseTime !== undefined && healthCheck.responseTime > 0 && (
                                                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                                                    応答時間: {healthCheck.responseTime}ms
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {healthCheck.online && healthCheck.testResponse && (
                                        <div style={{ padding: 16, borderRadius: 12, background: "rgba(0,230,118,0.05)", border: "1px solid rgba(0,230,118,0.15)" }}>
                                            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: 6 }}>エージェントの応答:</div>
                                            <p style={{ fontSize: "0.9rem", color: "var(--text-primary)", margin: 0, lineHeight: 1.7 }}>
                                                「{healthCheck.testResponse}」
                                            </p>
                                        </div>
                                    )}

                                    {!healthCheck.online && healthCheck.error && (
                                        <div style={{ padding: 16, borderRadius: 12, background: "rgba(239,83,80,0.05)", border: "1px solid rgba(239,83,80,0.15)" }}>
                                            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: 6 }}>エラー詳細:</div>
                                            <p style={{ fontSize: "0.85rem", color: "var(--danger)", margin: 0 }}>{healthCheck.error}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Registration Result */}
                            {registrationResult && (
                                <div className="glass-card glow-box" style={{ padding: 32, textAlign: "center", marginBottom: 24 }}>
                                    {healthCheck?.online ? (
                                        <>
                                            <div style={{ fontSize: "3rem", marginBottom: 16 }}>🎉</div>
                                            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: 8 }}>
                                                エージェント登録完了！
                                            </h2>
                                            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: 16 }}>
                                                企業があなたのエージェントと対話できるようになりました。
                                            </p>

                                            {/* Login Token Section */}
                                            <div style={{ padding: 20, borderRadius: 14, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(108,92,231,0.3)", marginBottom: 20, textAlign: "left" }}>
                                                <div style={{ fontSize: "0.75rem", color: "var(--warning)", fontWeight: 700, marginBottom: 10, textAlign: "center" }}>
                                                    ⚠️ このトークンを控えてください（再表示できません）
                                                </div>
                                                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: 4 }}>ログイントークン</div>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                    <code style={{ flex: 1, padding: "10px 14px", borderRadius: 8, background: "rgba(108,92,231,0.1)", color: "var(--accent-secondary)", fontSize: "0.85rem", fontFamily: "var(--font-mono)", wordBreak: "break-all" }}>
                                                        {registrationResult.loginToken}
                                                    </code>
                                                    <button
                                                        className="btn-secondary"
                                                        style={{ padding: "10px 14px", fontSize: "0.8rem", flexShrink: 0 }}
                                                        onClick={() => {
                                                            if (registrationResult.loginToken) {
                                                                navigator.clipboard.writeText(registrationResult.loginToken);
                                                            }
                                                        }}
                                                    >
                                                        📋 コピー
                                                    </button>
                                                </div>
                                                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 8 }}>Agent ID: {registrationResult.agentId}</div>
                                            </div>

                                            <a
                                                href="/talent/login"
                                                className="btn-primary"
                                                style={{ display: "inline-block", padding: "12px 28px", textDecoration: "none", fontSize: "0.95rem" }}
                                            >
                                                🏠 マイページへログイン →
                                            </a>
                                        </>
                                    ) : (
                                        <>
                                            <div style={{ fontSize: "3rem", marginBottom: 16 }}>⚠️</div>
                                            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: 8 }}>
                                                エージェントがオフラインです
                                            </h2>
                                            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.7 }}>
                                                エージェントとの接続が確認できませんでした。
                                                <br />
                                                エージェントを起動し、ngrok等で公開した上で再試行してください。
                                            </p>

                                            {registrationResult.loginToken && (
                                                <div style={{ padding: 16, borderRadius: 12, background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-color)", marginTop: 16, textAlign: "left" }}>
                                                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: 4 }}>ログイントークン（保管してください）</div>
                                                    <code style={{ fontSize: "0.8rem", color: "var(--accent-secondary)", fontFamily: "var(--font-mono)", wordBreak: "break-all" }}>
                                                        {registrationResult.loginToken}
                                                    </code>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Registration Error */}
                            {registrationResult?.errors && registrationResult.errors.length > 0 && (
                                <div className="glass-card" style={{ padding: 24, marginBottom: 24, borderColor: "rgba(239,83,80,0.3)" }}>
                                    <div style={{ fontWeight: 700, color: "var(--danger)", marginBottom: 12 }}>❌ エラー</div>
                                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                                        {registrationResult.errors.map((e, i) => (
                                            <li key={i} style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>{e}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Actions */}
                            <div style={{ display: "flex", gap: 12 }}>
                                <button className="btn-secondary" onClick={handleReset} style={{ flex: 1 }}>
                                    ← 最初からやり直す
                                </button>
                                {healthCheck?.online && (
                                    <a href="/recruiter/search" className="btn-primary" style={{ flex: 2, textAlign: "center", textDecoration: "none" }}>
                                        🏢 企業検索ページで確認する →
                                    </a>
                                )}
                                {!healthCheck?.online && (
                                    <button className="btn-primary" onClick={handleRegister} style={{ flex: 2 }} disabled={isRegistering}>
                                        🔄 再テストする
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* API Spec (always visible at bottom) */}
                <motion.div
                    className="glass-card"
                    style={{ padding: 24, marginTop: 40 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <details>
                        <summary style={{ cursor: "pointer", fontWeight: 700, fontSize: "0.9rem", marginBottom: 8 }}>
                            📡 エージェントAPI仕様（クリックで展開）
                        </summary>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", lineHeight: 1.8, color: "var(--text-secondary)", marginTop: 16 }}>
                            <div style={{ marginBottom: 4 }}><span style={{ color: "#00e676" }}>POST</span> {`{agent_settings.endpoint}`}</div>
                            <div style={{ marginTop: 8 }}>
                                <span style={{ color: "var(--text-muted)" }}>Request Body:</span>
                                <pre style={{ margin: "4px 0", padding: 12, borderRadius: 8, background: "rgba(0,0,0,0.3)", overflow: "auto" }}>
                                    {`{
  "message": "Pythonの経験はありますか？",
  "session_id": "abc123"
}`}
                                </pre>
                            </div>
                            <div style={{ marginTop: 8 }}>
                                <span style={{ color: "var(--text-muted)" }}>Response Body:</span>
                                <pre style={{ margin: "4px 0", padding: 12, borderRadius: 8, background: "rgba(0,0,0,0.3)", overflow: "auto" }}>
                                    {`{
  "response": "はい、7年の経験があります..."
}`}
                                </pre>
                            </div>
                        </div>
                    </details>
                </motion.div>
            </main>
        </div>
    );
}
