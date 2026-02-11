import { NextRequest, NextResponse } from "next/server";
import { registerCompany, companyEmailExists } from "@/lib/company-store";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { companyName, contactName, email, phoneNumber, industry } = body;

        // バリデーション
        const errors: string[] = [];
        if (!companyName?.trim()) errors.push("企業名は必須です。");
        if (!contactName?.trim()) errors.push("担当者名は必須です。");
        if (!email?.trim()) errors.push("メールアドレスは必須です。");
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("メールアドレスの形式が正しくありません。");
        if (!phoneNumber?.trim()) errors.push("電話番号は必須です。");

        if (errors.length > 0) {
            return NextResponse.json({ success: false, errors }, { status: 400 });
        }

        // 重複チェック
        if (await companyEmailExists(email)) {
            return NextResponse.json(
                { success: false, errors: ["このメールアドレスは既に登録されています。"] },
                { status: 409 }
            );
        }

        const companyId = `company-${Date.now().toString(36)}`;
        const loginToken = `ctok-${companyId}-${Math.random().toString(36).slice(2, 10)}`;

        await registerCompany({
            companyId,
            companyName: companyName.trim(),
            contactName: contactName.trim(),
            email: email.trim().toLowerCase(),
            phoneNumber: phoneNumber.trim(),
            industry: industry?.trim() || "",
            loginToken,
            status: "pending", // 初期ステータスは審査中
            registeredAt: new Date().toISOString(),
        });

        return NextResponse.json({
            success: true,
            // トークンは返さない（承認後に管理者が手動送付）
        });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "不明なエラー";
        return NextResponse.json({ success: false, errors: [msg] }, { status: 500 });
    }
}
