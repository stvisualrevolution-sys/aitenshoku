import yaml from "js-yaml";
import { AgentManifest, ManifestParseResult } from "./types";

export function parseManifest(yamlContent: string): ManifestParseResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. YAMLとしてパース
    let raw: Record<string, unknown>;
    try {
        raw = yaml.load(yamlContent) as Record<string, unknown>;
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "不明なエラー";
        return {
            success: false,
            errors: [`YAMLの解析に失敗しました: ${msg}`],
            warnings: [],
        };
    }

    if (!raw || typeof raw !== "object") {
        return {
            success: false,
            errors: ["YAMLファイルが空か、正しい形式ではありません。"],
            warnings: [],
        };
    }

    // 2. agent_settings の検証
    const agentSettings = raw.agent_settings as Record<string, unknown> | undefined;
    if (!agentSettings || typeof agentSettings !== "object") {
        errors.push("「agent_settings」セクションが見つかりません。");
    } else {
        if (!agentSettings.name || typeof agentSettings.name !== "string") {
            errors.push("「agent_settings.name」が必要です（文字列）。");
        }
        if (!agentSettings.endpoint || typeof agentSettings.endpoint !== "string") {
            errors.push("「agent_settings.endpoint」が必要です（URL文字列）。");
        } else {
            // URL形式のバリデーション
            try {
                new URL(agentSettings.endpoint as string);
            } catch {
                errors.push(`「agent_settings.endpoint」が有効なURLではありません: "${agentSettings.endpoint}"`);
            }
        }
        if (agentSettings.personality && typeof agentSettings.personality !== "string") {
            warnings.push("「agent_settings.personality」は文字列を指定してください。");
        }
    }

    // 3. candidate の検証
    const candidate = raw.candidate as Record<string, unknown> | undefined;
    if (!candidate || typeof candidate !== "object") {
        errors.push("「candidate」セクションが見つかりません。");
    } else {
        // basic_info
        const basicInfo = candidate.basic_info as Record<string, unknown> | undefined;
        if (!basicInfo || typeof basicInfo !== "object") {
            errors.push("「candidate.basic_info」セクションが必要です。");
        } else {
            if (!basicInfo.name || typeof basicInfo.name !== "string") {
                errors.push("「candidate.basic_info.name」が必要です（文字列）。");
            }
            if (!basicInfo.title) {
                warnings.push("「candidate.basic_info.title」の指定を推奨します。");
            }
            if (!basicInfo.region) {
                warnings.push("「candidate.basic_info.region」の指定を推奨します。");
            }
        }

        // skills
        const skills = candidate.skills as Record<string, unknown> | undefined;
        if (!skills || typeof skills !== "object") {
            errors.push("「candidate.skills」セクションが必要です。");
        } else {
            const skillCategories = ["languages", "frameworks", "tools", "other"];
            let hasAnySkills = false;
            for (const cat of skillCategories) {
                const arr = skills[cat];
                if (Array.isArray(arr) && arr.length > 0) {
                    hasAnySkills = true;
                    for (const skill of arr) {
                        if (!skill.name || typeof skill.name !== "string") {
                            errors.push(`「candidate.skills.${cat}」内の各項目には「name」が必要です。`);
                            break;
                        }
                    }
                }
            }
            if (!hasAnySkills) {
                warnings.push("スキルが一つも登録されていません。少なくとも1つのスキルを追加してください。");
            }
        }

        // preferences
        const prefs = candidate.preferences as Record<string, unknown> | undefined;
        if (prefs && typeof prefs === "object") {
            if (prefs.minimum_annual_salary !== undefined && typeof prefs.minimum_annual_salary !== "number") {
                warnings.push("「candidate.preferences.minimum_annual_salary」は数値で指定してください。");
            }
        }
    }

    if (errors.length > 0) {
        return { success: false, errors, warnings };
    }

    // 4. パース成功 — 構造化データを生成
    const as = agentSettings as Record<string, unknown>;
    const c = candidate as Record<string, unknown>;
    const bi = c.basic_info as Record<string, unknown>;
    const sk = c.skills as Record<string, unknown>;
    const pr = (c.preferences || {}) as Record<string, unknown>;

    const toSkillArray = (arr: unknown) => {
        if (!Array.isArray(arr)) return [];
        return arr.map((s: Record<string, unknown>) => ({
            name: String(s.name || ""),
            level: String(s.level || "未設定"),
        }));
    };

    const manifest: AgentManifest = {
        agent_settings: {
            name: String(as.name),
            endpoint: String(as.endpoint),
            personality: as.personality ? String(as.personality) : undefined,
        },
        candidate: {
            basic_info: {
                name: String(bi.name),
                title: bi.title ? String(bi.title) : undefined,
                region: bi.region ? String(bi.region) : undefined,
                birth_date: bi.birth_date ? String(bi.birth_date) : undefined,
                nationality: bi.nationality ? String(bi.nationality) : undefined,
            },
            education: Array.isArray(c.education)
                ? c.education.map((e: any) => ({
                    school: String(e.school || ""),
                    degree: String(e.degree || ""),
                    field: e.field ? String(e.field) : undefined,
                    year: Number(e.year || 0),
                    status: e.status ? String(e.status) : undefined,
                }))
                : undefined,
            work_history: Array.isArray(c.work_history)
                ? c.work_history.map((w: any) => ({
                    company: String(w.company || ""),
                    position: String(w.position || ""),
                    duration: String(w.duration || ""),
                    description: w.description ? String(w.description) : undefined,
                }))
                : undefined,
            skills: {
                languages: toSkillArray(sk.languages),
                frameworks: toSkillArray(sk.frameworks),
                tools: toSkillArray(sk.tools),
                other: toSkillArray(sk.other),
            },
            preferences: {
                minimum_annual_salary: typeof pr.minimum_annual_salary === "number" ? pr.minimum_annual_salary : undefined,
                preferred_work_style: pr.preferred_work_style ? String(pr.preferred_work_style) : undefined,
                available_from: pr.available_from ? String(pr.available_from) : undefined,
            },
            portfolio: c.portfolio ? String(c.portfolio) : undefined,
            bio: c.bio ? String(c.bio) : undefined,
        },
    };

    return { success: true, data: manifest, errors: [], warnings };
}
