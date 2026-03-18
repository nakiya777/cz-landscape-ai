/**
 * デバッグロガーユーティリティ
 * 開発環境でのみログを出力する
 */

const isDev = import.meta.env?.DEV ?? process.env.NODE_ENV !== 'production';

export const logger = {
    /** デバッグログ（開発環境のみ） */
    debug: (...args: unknown[]) => {
        if (isDev) console.debug(...args);
    },
    /** 情報ログ */
    info: (...args: unknown[]) => {
        if (isDev) console.info(...args);
    },
    /** 警告ログ */
    warn: (...args: unknown[]) => {
        console.warn(...args);
    },
    /** エラーログ */
    error: (...args: unknown[]) => {
        console.error(...args);
    },
};
