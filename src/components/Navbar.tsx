"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const pathname = usePathname();

    return (
        <nav
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 50,
                backdropFilter: "blur(20px)",
                background: "rgba(10, 10, 15, 0.8)",
                borderBottom: "1px solid var(--border-color)",
            }}
        >
            <div
                style={{
                    maxWidth: "1200px",
                    margin: "0 auto",
                    padding: "0 24px",
                    height: "64px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <Link
                    href="/"
                    style={{
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                    }}
                >
                    <span style={{ fontSize: "1.5rem" }}>🔗</span>
                    <span
                        className="gradient-text"
                        style={{ fontSize: "1.25rem", fontWeight: 700, letterSpacing: "-0.02em" }}
                    >
                        Agent-Link
                    </span>
                </Link>

                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    {/* 求職者 */}
                    <Link
                        href="/talent/dashboard"
                        className={`nav-link ${pathname === "/talent/dashboard" ? "active" : ""}`}
                    >
                        求職者登録
                    </Link>
                    <Link
                        href="/talent/login"
                        className={`nav-link ${pathname === "/talent/login" || pathname === "/talent/my-agent" ? "active" : ""}`}
                    >
                        マイページ
                    </Link>
                    <Link
                        href="/contact"
                        className={`nav-link ${pathname === "/contact" ? "active" : ""}`}
                    >
                        お問い合わせ
                    </Link>
                    <Link
                        href="/terms"
                        className={`nav-link ${pathname === "/terms" ? "active" : ""}`}
                    >
                        利用規約
                    </Link>
                    <span style={{ width: 1, height: 20, background: "var(--border-color)", margin: "0 4px" }} />
                    {/* 企業 */}
                    <Link
                        href="/recruiter/register"
                        className={`nav-link ${pathname === "/recruiter/register" ? "active" : ""}`}
                    >
                        企業登録
                    </Link>
                    <Link
                        href="/recruiter/login"
                        className={`nav-link ${pathname === "/recruiter/login" || pathname === "/recruiter/search" ? "active" : ""}`}
                    >
                        企業検索
                    </Link>
                </div>
            </div>
        </nav>
    );
}
