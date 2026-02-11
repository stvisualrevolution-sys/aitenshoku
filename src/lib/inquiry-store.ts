import { supabase } from "./supabase";

export type InquiryCategory = "token_lost" | "account_delete" | "other";
export type InquiryStatus = "unread" | "done";

export interface Inquiry {
    id: string;
    name: string;
    email: string;
    category: InquiryCategory;
    message: string;
    status: InquiryStatus;
    createdAt: string;
}

// --- 送信 ---

export async function sendInquiry(inquiry: Omit<Inquiry, "id" | "status" | "createdAt">): Promise<boolean> {
    const { error } = await supabase
        .from('inquiries')
        .insert({
            name: inquiry.name,
            email: inquiry.email,
            category: inquiry.category,
            message: inquiry.message,
            status: "unread",
        }); // id, created_at はDB側で自動生成される想定

    if (error) {
        console.error("Error sending inquiry:", error);
        return false;
    }
    return true;
}

// --- 管理者用 ---

export async function getAllInquiries(): Promise<Inquiry[]> {
    const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map(mapToInquiry);
}

export async function updateInquiryStatus(id: string, status: InquiryStatus): Promise<boolean> {
    const { error } = await supabase
        .from('inquiries')
        .update({ status })
        .eq('id', id);

    return !error;
}

// Helper
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapToInquiry(data: any): Inquiry {
    return {
        id: data.id,
        name: data.name,
        email: data.email,
        category: data.category as InquiryCategory,
        message: data.message,
        status: data.status as InquiryStatus,
        createdAt: data.created_at,
    };
}
