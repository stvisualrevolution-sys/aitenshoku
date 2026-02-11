import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 管理者エリア（/admin, /api/admin）のみ制限
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
        // 許可IPリスト取得
        const allowedIps = (process.env.ALLOWED_IPS || "127.0.0.1,::1").split(",").map(ip => ip.trim());

        // クライアントIP取得
        // Vercel等では x-forwarded-for ヘッダーを見る必要がある
        let clientIp = (request as any).ip || request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

        // ローカル開発環境の ::1 (IPv6 localhost) 対応
        if (clientIp === "::1") clientIp = "127.0.0.1";

        // IPチェック
        // 注: 本番環境（Vercel等）ではプロキシのIPになることがあるため、適切なヘッダー設定が必要
        // 今回は簡易的なチェックとして実装

        const isAllowed = allowedIps.includes(clientIp) || allowedIps.includes("::1") && clientIp === "127.0.0.1";

        if (!isAllowed) {
            console.warn(`[Middleware] Blocked access to ${pathname} from ${clientIp}`);
            // 403 Forbidden
            return new NextResponse("Forbidden: Access Denied", { status: 403 });
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
