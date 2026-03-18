
/**
 * Gemini APIキーを複数のソースから優先順位付きで取得するユーティリティ。
 * 優先順位:
 * 1. AI Studio Preview環境 (window.aistudio)
 * 2. localStorageに保存されたユーザー入力キー
 * 3. 環境変数 (process.env.GEMINI_API_KEY)
 */
export const getApiKey = (): string => {
    // 1. AI Studio内部プレビューモードのキーを確認
    const aiStudioKey = (window as any).aistudio?.getApiKey();
    if (aiStudioKey) {
        console.debug('[getApiKey] AI Studioからキーを取得しました');
        return aiStudioKey;
    }

    // 2. localStorageからユーザー保存キーを確認
    const storedKey = localStorage.getItem('cz_gemini_api_key');
    if (storedKey) {
        console.debug('[getApiKey] localStorageからキーを取得しました');
        return storedKey;
    }

    // 3. 環境変数へのフォールバック
    const envKey = process.env.GEMINI_API_KEY || '';
    console.debug('[getApiKey] 環境変数からキーを取得しました (存在: %s)', !!envKey);
    return envKey;
};

/** ユーザーのAPIキーをlocalStorageに保存・削除する */
export const saveUserApiKey = (key: string) => {
    if (key) {
        localStorage.setItem('cz_gemini_api_key', key);
        console.debug('[saveUserApiKey] APIキーをlocalStorageに保存しました');
    } else {
        localStorage.removeItem('cz_gemini_api_key');
        console.debug('[saveUserApiKey] APIキーをlocalStorageから削除しました');
    }
};
