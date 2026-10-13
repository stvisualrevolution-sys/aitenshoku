import { createHash, createHmac, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

// 管理者セッションの有効期間（12時間）
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

// 署名用の秘密鍵。ADMIN_SESSION_SECRET があれば優先し、無ければ ADMIN_PASSWORD を使う
// どちらも未設定の場合は管理者機能を無効にする（固定値へのフォールバックはしない）
function getSigningSecret(): string | undefined {
    return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || undefined;
}

export function isAdminConfigured(): boolean {
    return !!process.env.ADMIN_PASSWORD;
}

// 長さの違いから情報が漏れないよう、ハッシュ化してから定数時間で比較する
function safeEqual(a: string, b: string): boolean {
    const hashA = createHash("sha256").update(a).digest();
    const hashB = createHash("sha256").update(b).digest();
    return timingSafeEqual(hashA, hashB);
}

function sign(expiresAt: number, secret: string): string {
    return createHmac("sha256", secret).update(`admin:${expiresAt}`).digest("base64url");
}

export function verifyAdminPassword(password: unknown): boolean {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword || typeof password !== "string") return false;
    return safeEqual(password, adminPassword);
}

// トークン形式: "<有効期限(ms)>.<HMAC署名>"
export function createAdminToken(): string {
    const secret = getSigningSecret();
    if (!secret) throw new Error("Admin password is not configured");

    const expiresAt = Date.now() + SESSION_TTL_MS;
    return `${expiresAt}.${sign(expiresAt, secret)}`;
}

export function verifyAdminToken(token: string): boolean {
    const secret = getSigningSecret();
    if (!secret || !isAdminConfigured()) return false;

    const [expiresAtStr, signature, ...rest] = token.split(".");
    if (!expiresAtStr || !signature || rest.length > 0) return false;

    const expiresAt = Number(expiresAtStr);
    if (!Number.isSafeInteger(expiresAt) || expiresAt <= Date.now()) return false;

    return safeEqual(signature, sign(expiresAt, secret));
}

export function isAdminRequest(request: NextRequest): boolean {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return false;
    return verifyAdminToken(authHeader.slice("Bearer ".length));
}
