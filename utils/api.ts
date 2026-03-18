
/**
 * Utility to retrieve the Gemini API key from various sources.
 * Priority: 
 * 1. AI Studio Preview environment (window.aistudio)
 * 2. User-provided key in localStorage
 * 3. Environment variable (process.env.API_KEY)
 */
export const getApiKey = (): string => {
    // 1. Check AI Studio (for internal preview mode)
    const aiStudioKey = (window as any).aistudio?.getApiKey();
    if (aiStudioKey) return aiStudioKey;

    // 2. Check localStorage (for standalone web mode)
    const storedKey = localStorage.getItem('cz_gemini_api_key');
    if (storedKey) return storedKey;

    // 3. Fallback to env var
    return process.env.API_KEY || '';
};

export const saveUserApiKey = (key: string) => {
    if (key) {
        localStorage.setItem('cz_gemini_api_key', key);
    } else {
        localStorage.removeItem('cz_gemini_api_key');
    }
};
