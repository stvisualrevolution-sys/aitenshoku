import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 管理者エリア（/admin, /api/admin）のみ制限
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
        // 許可IPリスト取得（環境変数が設定されている場合のみ）
        const allowedIpsStr = process.env.ALLOWED_IPS;

        // 環境変数が空の場合は制限しない（Vercelデプロイ対策）
        if (allowedIpsStr) {
            const allowedIps = allowedIpsStr.split(",").map(ip => ip.trim());

            // クライアントIP取得
            // Vercel等では x-forwarded-for ヘッダーを見る必要がある
            let clientIp = (request as any).ip || request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

            // ローカル開発環境の ::1 (IPv6 localhost) 対応
            if (clientIp === "::1") clientIp = "127.0.0.1";

            // IPチェック
            const isAllowed = allowedIps.includes(clientIp) || (allowedIps.includes("::1") && clientIp === "127.0.0.1");

            if (!isAllowed) {
                console.warn(`[Middleware] Blocked access to ${pathname} from ${clientIp}`);
                // 403 Forbidden
                return new NextResponse("Forbidden: Access Denied", { status: 403 });
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/api/admin/:path*",
    ],
};
