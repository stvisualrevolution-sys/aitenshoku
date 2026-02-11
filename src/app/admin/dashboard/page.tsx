"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface Company {
    companyId: string;
    companyName: string;
    contactName: string;
    email: string;
    phoneNumber: string;
    status: "pending" | "approved" | "rejected";
    loginToken: string;
    registeredAt: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Inquiry {
    id: string;
    name: string;
    email: string;
    category: "token_lost" | "account_delete" | "other";
    message: string;
    status: "unread" | "done";
    createdAt: string;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"companies" | "inquiries">("companies");
    const [companies, setCompanies] = useState<Company[]>([]);
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("admin-token");
        if (!token) {
            router.push("/admin/login");
            return;
        }

        Promise.all([fetchCompanies(), fetchInquiries()]).finally(() => setLoading(false));
    }, []);

    const fetchCompanies = async () => {
        const token = localStorage.getItem("admin-token");
        try {
            const res = await fetch("/api/admin/companies", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.status === 401) { router.push("/admin/login"); return; }
            const data = await res.json();
            setCompanies(data.companies || []);
        } catch (e) { console.error(e); }
    };

    const fetchInquiries = async () => {
        const token = localStorage.getItem("admin-token");
        try {
            const res = await fetch("/api/admin/inquiries", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            setInquiries(data.inquiries || []);
        } catch (e) { console.error(e); }
    };

    const handleAction = async (companyId: string, action: "approve" | "reject") => {
        if (!confirm(`${action === "approve" ? "承認" : "拒否"}しますか？`)) return;

        const token = localStorage.getItem("admin-token");
        try {
            const res = await fetch("/api/admin/companies", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ companyId, action })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success && data.company) {
                    setCompanies(prev => prev.map(c => c.companyId === companyId ? data.company : c));
                }
            }
        } catch (e) { alert("エラーが発生しました"); }
    };

    const handleInquiryStatus = async (id: string, status: "done") => {
        if (!confirm("対応済みにしますか？")) return;
        const token = localStorage.getItem("admin-token");
        try {
            await fetch("/api/admin/inquiries", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ id, status })
            });
            // ローカル更新
            setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: "done" } : i));
        } catch (e) { alert("エラーが発生しました"); }
    };

    const handleLogout = () => {
        localStorage.removeItem("admin-token");
        router.push("/admin/login");
    };

    if (loading) return <div style={{ padding: 40, color: "white" }}>Loading...</div>;

    return (
        <div style={{ minHeight: "100vh", background: "#1a1a2e", color: "white", padding: 40 }}>
            <div style={{ maxWidth: 1000, margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                    <h1>🛡️ Admin Dashboard</h1>
                    <button onClick={handleLogout} style={{ padding: "8px 16px", borderRadius: 8, background: "#ef5350", color: "white", border: "none", cursor: "pointer" }}>Logout</button>
                </div>

                <div style={{ display: "flex", gap: 16, marginBottom: 24, borderBottom: "1px solid #333", paddingBottom: 16 }}>
                    <button onClick={() => setActiveTab("companies")} style={{ background: "none", border: "none", color: activeTab === "companies" ? "#6c5ce7" : "#aaa", fontSize: "1.1rem", fontWeight: "bold", cursor: "pointer" }}>
                        Companies
                    </button>
                    <button onClick={() => setActiveTab("inquiries")} style={{ background: "none", border: "none", color: activeTab === "inquiries" ? "#6c5ce7" : "#aaa", fontSize: "1.1rem", fontWeight: "bold", cursor: "pointer" }}>
                        Inquiries ({inquiries.filter(i => i.status === "unread").length})
                    </button>
                </div>

                {activeTab === "companies" ? (
                    <div style={{ display: "grid", gap: 16 }}>
                        {companies.map((company) => (
                            <motion.div
                                key={company.companyId}
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                style={{
                                    background: "rgba(255,255,255,0.05)",
                                    padding: 24,
                                    borderRadius: 12,
                                    border: `1px solid ${company.status === "pending" ? "#fb8c00" : company.status === "approved" ? "#43a047" : "#e53935"}`
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                                            <h3 style={{ margin: 0, fontSize: "1.2rem" }}>{company.companyName}</h3>
                                            <span style={{
                                                padding: "4px 8px", borderRadius: 4, fontSize: "0.75rem",
                                                background: company.status === "pending" ? "rgba(251,140,0,0.2)" : company.status === "approved" ? "rgba(67,160,71,0.2)" : "rgba(229,57,53,0.2)",
                                                color: company.status === "pending" ? "#ffb74d" : company.status === "approved" ? "#81c784" : "#e57373"
                                            }}>
                                                {company.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <div style={{ color: "#b0bec5", fontSize: "0.9rem", display: "grid", gap: 4 }}>
                                            <div>👤 {company.contactName}</div>
                                            <div>📧 {company.email}</div>
                                            <div>📞 {company.phoneNumber}</div>
                                            <div>📅 {new Date(company.registeredAt).toLocaleString()}</div>
                                        </div>

                                        {company.status === "approved" && (
                                            <div style={{ marginTop: 16, background: "rgba(0,0,0,0.3)", padding: 12, borderRadius: 8 }}>
                                                <div style={{ fontSize: "0.75rem", color: "#90a4ae", marginBottom: 4 }}>Login Token</div>
                                                <code style={{ color: "#82b1ff", fontFamily: "monospace", wordBreak: "break-all" }}>{company.loginToken}</code>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: "flex", gap: 8 }}>
                                        {company.status === "pending" && (
                                            <>
                                                <button onClick={() => handleAction(company.companyId, "approve")} style={{ padding: "8px 16px", borderRadius: 8, background: "#43a047", color: "white", border: "none", cursor: "pointer" }}>Approve</button>
                                                <button onClick={() => handleAction(company.companyId, "reject")} style={{ padding: "8px 16px", borderRadius: 8, background: "#e53935", color: "white", border: "none", cursor: "pointer" }}>Reject</button>
                                            </>
                                        )}
                                        {company.status === "rejected" && (
                                            <button onClick={() => handleAction(company.companyId, "approve")} style={{ padding: "8px 16px", borderRadius: 8, background: "#43a047", color: "white", border: "none", cursor: "pointer" }}>Re-Approve</button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div style={{ display: "grid", gap: 16 }}>
                        {inquiries.map((inquiry) => (
                            <motion.div
                                key={inquiry.id}
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                style={{
                                    background: "rgba(255,255,255,0.05)",
                                    padding: 24,
                                    borderRadius: 12,
                                    borderLeft: `4px solid ${inquiry.status === "unread" ? "#fb8c00" : "#43a047"}`
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                                    <div>
                                        <span style={{
                                            padding: "4px 8px", borderRadius: 4, fontSize: "0.75rem", marginRight: 8,
                                            background: "rgba(108,92,231,0.2)", color: "#a29bfe"
                                        }}>
                                            {inquiry.category === "token_lost" ? "🔑 トークン紛失" : inquiry.category === "account_delete" ? "🗑️ 削除依頼" : "📝 その他"}
                                        </span>
                                        <span style={{ color: "#aaa", fontSize: "0.8rem" }}>{new Date(inquiry.createdAt).toLocaleString()}</span>
                                    </div>
                                    {inquiry.status === "unread" && (
                                        <button onClick={() => handleInquiryStatus(inquiry.id, "done")} style={{ padding: "6px 12px", borderRadius: 6, background: "#43a047", color: "white", border: "none", cursor: "pointer", fontSize: "0.8rem" }}>
                                            Done
                                        </button>
                                    )}
                                </div>
                                <div style={{ marginBottom: 8, fontWeight: "bold" }}>{inquiry.name} <span style={{ fontWeight: "normal", color: "#aaa", fontSize: "0.9rem" }}>&lt;{inquiry.email}&gt;</span></div>
                                <div style={{ whiteSpace: "pre-wrap", color: "#ddd", background: "rgba(0,0,0,0.2)", padding: 12, borderRadius: 8, fontSize: "0.95rem" }}>
                                    {inquiry.message}
                                </div>
                            </motion.div>
                        ))}
                        {inquiries.length === 0 && <div style={{ color: "#aaa" }}>No inquiries.</div>}
                    </div>
                )}
            </div>
        </div>
    );
}
