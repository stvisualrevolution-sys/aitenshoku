import { NextRequest, NextResponse } from "next/server";
import { getAllCompanies, approveCompany, rejectCompany, verifyAdminPassword } from "@/lib/company-store";

export async function GET(request: NextRequest) {
    // 認証チェック（ヘッダーでパスワードを送る簡易仕様）
    const authHeader = request.headers.get("Authorization");
    if (authHeader !== "Bearer admin-session-token") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const companies = await getAllCompanies();
    return NextResponse.json({ companies });
}

export async function POST(request: NextRequest) {
    // 認証チェック
    const authHeader = request.headers.get("Authorization");
    if (authHeader !== "Bearer admin-session-token") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { companyId, action } = await request.json();

        let updatedCompany;
        if (action === "approve") {
            updatedCompany = await approveCompany(companyId);
        } else if (action === "reject") {
            updatedCompany = await rejectCompany(companyId);
        } else {
            return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
        }

        if (!updatedCompany) {
            return NextResponse.json({ success: false, error: "Company not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, company: updatedCompany });
    } catch {
        return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
}
