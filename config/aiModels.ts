/**
 * AIモデル設定ファイル
 * 
 * 新しいモデルを追加する場合:
 *   1. modelsリストに新しいエントリを追加
 *   2. id: APIに渡すモデルID（正確に一致させること）
 *   3. name: UIに表示する名前
 *   4. capabilities: 対応機能（image:画像生成, vision:画像認識, text:テキスト生成）
 *   5. recommended: 推奨マーク★を表示するか
 * 
 * モデルを削除する場合:
 *   対象のエントリをmodelsリストから削除するだけ
 */

export interface AIModelConfig {
    id: string;
    name: string;
    capabilities: ('image' | 'vision' | 'text')[];
    recommended?: boolean;
    legacy?: boolean;
}

export interface AIModelsConfig {
    models: AIModelConfig[];
    defaults: {
        imageGeneration: string;
        buildingDetection: string;
        promptRefinement: string;
        chat: string;
    };
}

export const AI_MODELS_CONFIG: AIModelsConfig = {
    models: [
        // Gemini 3 系列 (2025年12月最新)
        {
            id: 'gemini-3-flash-preview',
            name: 'Gemini 3 Flash',
            capabilities: ['vision', 'text'],
            recommended: true
        },
        {
            id: 'gemini-3-pro-preview',
            name: 'Gemini 3 Pro',
            capabilities: ['vision', 'text']
        },
        {
            id: 'gemini-3-pro-image-preview',
            name: 'Gemini 3 Pro Image',
            capabilities: ['image', 'vision', 'text'],
            recommended: true
        },
        // Imagen 3 (Nano Banana PRO)
        {
            id: 'imagen-3.0-generate-002',
            name: 'Imagen 3 / Nano Banana PRO',
            capabilities: ['image', 'vision'],
            recommended: true
        },
        // レガシーモデル
        {
            id: 'gemini-2.0-flash-exp',
            name: 'Gemini 2.0 Flash',
            capabilities: ['vision', 'text'],
            legacy: true
        }
    ],

    // デフォルト設定
    defaults: {
        imageGeneration: 'gemini-3-pro-image-preview',
        buildingDetection: 'imagen-3.0-generate-002',
        promptRefinement: 'gemini-3-flash-preview',
        chat: 'gemini-3-flash-preview'
    }
};

// ユーティリティ関数
export const getModelsForCapability = (capability: 'image' | 'vision' | 'text'): AIModelConfig[] => {
    return AI_MODELS_CONFIG.models.filter(m => m.capabilities.includes(capability));
};

export const getModelById = (id: string): AIModelConfig | undefined => {
    return AI_MODELS_CONFIG.models.find(m => m.id === id);
};

export const getModelDisplayName = (id: string): string => {
    const model = getModelById(id);
    if (!model) return id;

    let name = model.name;
    if (model.recommended) name = `★ ${name}`;
    if (model.legacy) name = `${name} (レガシー)`;
    return name;
};
