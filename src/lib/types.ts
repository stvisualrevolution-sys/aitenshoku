export interface AgentProfile {
    id: string;
    name: string;
    avatarEmoji: string;
    title: string;
    endpointUrl: string;
    isOnline: boolean;
    ownerName: string;
    registeredAt: string;
    lastSeen: string;
    bio: string;
    // New Profile Fields
    birthDate?: string;
    nationality?: string;
    education?: ManifestEducation[];
    workHistory?: ManifestWorkHistory[];
}

export interface ChatMessage {
    id: string;
    role: "user" | "agent";
    content: string;
    timestamp: string;
}

// エージェントAPIのリクエスト/レスポンス仕様
export interface AgentChatRequest {
    message: string;
    session_id: string;
}

export interface AgentChatResponse {
    response: string;
}

// --- YAMLマニフェスト関連 ---

export interface ManifestSkill {
    name: string;
    level: string;
}

export interface ManifestBasicInfo {
    name: string;
    title?: string;
    region?: string;
}

export interface ManifestPreferences {
    minimum_annual_salary?: number;
    preferred_work_style?: string;
    available_from?: string;
}

export interface ManifestEducation {
    school: string;
    degree: string;
    field?: string;
    year: number;
    status?: string;
}

export interface ManifestWorkHistory {
    company: string;
    position: string;
    duration: string;
    description?: string;
}

export interface ManifestCandidate {
    basic_info: ManifestBasicInfo & {
        birth_date?: string;
        nationality?: string;
    };
    education?: ManifestEducation[];
    work_history?: ManifestWorkHistory[];
    skills: {
        languages?: ManifestSkill[];
        frameworks?: ManifestSkill[];
        tools?: ManifestSkill[];
        other?: ManifestSkill[];
    };
    preferences?: ManifestPreferences;
    portfolio?: string;
    bio?: string;
}

export interface ManifestAgentSettings {
    name: string;
    endpoint: string;
    personality?: string;
}

export interface AgentManifest {
    agent_settings: ManifestAgentSettings;
    candidate: ManifestCandidate;
}

// パース結果
export interface ManifestParseResult {
    success: boolean;
    data?: AgentManifest;
    errors: string[];
    warnings: string[];
}

// ヘルスチェック結果
export interface HealthCheckResult {
    online: boolean;
    responseTime?: number;
    testResponse?: string;
    error?: string;
}

// 登録リクエスト
export interface RegisterAgentRequest {
    manifest: AgentManifest;
}

// 登録レスポンス
export interface RegisterAgentResponse {
    success: boolean;
    agentId?: string;
    errors?: string[];
}
