import { supabase } from "./supabase";

export type CompanyStatus = "pending" | "approved" | "rejected";

export interface CompanyAccount {
    companyId: string;
    companyName: string;
    contactName: string;
    email: string;
    phoneNumber: string;
    industry: string;
    loginToken: string;
    status: CompanyStatus;
    registeredAt: string;
}

// 簡易管理者パスワード
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin-secret-pass";

// --- 登録・取得 (Asyncに変更) ---

export async function registerCompany(company: CompanyAccount): Promise<void> {
    const { error } = await supabase
        .from('companies')
        .insert({
            company_id: company.companyId,
            company_name: company.companyName,
            contact_name: company.contactName,
            email: company.email,
            phone_number: company.phoneNumber,
            industry: company.industry,
            login_token: company.loginToken,
            status: company.status,
            registered_at: company.registeredAt,
        });

    if (error) {
        console.error("Error registering company:", error);
        throw new Error("Database error");
    }
}

export async function getCompanyByEmail(email: string): Promise<CompanyAccount | undefined> {
    const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('email', email)
        .single();

    if (error || !data) return undefined;

    return mapToCompanyAccount(data);
}

export async function companyEmailExists(email: string): Promise<boolean> {
    const { count, error } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true })
        .eq('email', email);

    if (error) return false;
    return (count || 0) > 0;
}

// --- ログイン認証 ---

export async function getCompanyByToken(token: string): Promise<CompanyAccount | undefined> {
    const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('login_token', token)
        .single();

    if (error || !data) return undefined;

    return mapToCompanyAccount(data);
}

// --- 管理者機能 ---

export function verifyAdminPassword(password: string): boolean {
    return password === ADMIN_PASSWORD;
}

export async function getAllCompanies(): Promise<CompanyAccount[]> {
    const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('registered_at', { ascending: false });

    if (error || !data) return [];

    return data.map(mapToCompanyAccount);
}

export async function approveCompany(companyId: string): Promise<CompanyAccount | undefined> {
    const { data, error } = await supabase
        .from('companies')
        .update({ status: 'approved' })
        .eq('company_id', companyId)
        .select()
        .single();

    if (error || !data) return undefined;
    return mapToCompanyAccount(data);
}

export async function rejectCompany(companyId: string): Promise<CompanyAccount | undefined> {
    const { data, error } = await supabase
        .from('companies')
        .update({ status: 'rejected' })
        .eq('company_id', companyId)
        .select()
        .single();

    if (error || !data) return undefined;
    return mapToCompanyAccount(data);
}

// Helper: DBカラム名(snake_case) -> アプリ用(camelCase) マッピング
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapToCompanyAccount(data: any): CompanyAccount {
    return {
        companyId: data.company_id,
        companyName: data.company_name,
        contactName: data.contact_name,
        email: data.email,
        phoneNumber: data.phone_number,
        industry: data.industry,
        loginToken: data.login_token,
        status: data.status as CompanyStatus,
        registeredAt: data.registered_at,
    };
}
