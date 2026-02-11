import { NextRequest, NextResponse } from "next/server";
import { getCompanyByToken } from "@/lib/company-store";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token } = body;

        if (!token?.trim()) {
            return NextResponse.json(
                { success: false, error: "ログイントークンを入力してください。" },
                { status: 400 }
            );
        }

        const company = await getCompanyByToken(token.trim());
        if (!company) {
            return NextResponse.json(
                { success: false, error: "無効なトークンです。正しいトークンでログインしてください。" },
                { status: 401 }
            );
        }

        if (company.status === "pending") {
            return NextResponse.json(
                { success: false, error: "現在、管理者による審査中です。承認されるまでお待ちください。" },
                { status: 403 }
            );
        }

        if (company.status === "rejected") {
            return NextResponse.json(
                { success: false, error: "このアカウントは利用が許可されていません。" },
                { status: 403 }
            );
        }

        return NextResponse.json({
            success: true,
            company: {
                companyId: company.companyId,
                companyName: company.companyName,
                contactName: company.contactName,
                email: company.email,
                industry: company.industry,
            },
        });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "不明なエラー";
        return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }
}
