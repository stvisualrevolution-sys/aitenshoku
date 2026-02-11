"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function AdminLogin() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });
            const data = await res.json();

            if (data.success) {
                // 簡易トークン保存
                localStorage.setItem("admin-token", data.token); // "admin-session-token"
                router.push("/admin/dashboard");
            } else {
                setError(data.error);
            }
        } catch {
            setError("サーバーエラー");
        }
    };

    return (
        <div style={{ minHeight: "100vh", background: "#1a1a2e", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ background: "rgba(255,255,255,0.05)", padding: 40, borderRadius: 16, width: 400 }}>
                <h1 style={{ textAlign: "center", marginBottom: 24 }}>🛡️ Admin Login</h1>
                <form onSubmit={handleLogin}>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: "100%", padding: 12, marginBottom: 16, borderRadius: 8, border: "1px solid #333", background: "rgba(0,0,0,0.3)", color: "white" }}
                    />
                    {error && <div style={{ color: "#ef5350", marginBottom: 16, fontSize: "0.9rem" }}>{error}</div>}
                    <button type="submit" style={{ width: "100%", padding: 12, borderRadius: 8, background: "#6c5ce7", color: "white", border: "none", cursor: "pointer", fontWeight: "bold" }}>
                        Login
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
