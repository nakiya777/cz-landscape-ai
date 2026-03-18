
import React, { useState, useEffect } from 'react';
import { KeyRound, Save, X, Trash2, ExternalLink, AlertCircle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { saveUserApiKey } from '../../utils/api';

const ApiKeyDialog: React.FC = () => {
    const { showApiKeyDialog, setShowApiKeyDialog } = useAppContext();
    const [apiKey, setApiKey] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem('cz_gemini_api_key') || '';
        setApiKey(stored);
    }, [showApiKeyDialog]);

    if (!showApiKeyDialog) return null;

    const handleSave = () => {
        saveUserApiKey(apiKey);
        setShowApiKeyDialog(false);
        alert('APIキーを保存しました。');
    };

    const handleClear = () => {
        if (confirm('保存されているAPIキーを削除しますか？')) {
            saveUserApiKey('');
            setApiKey('');
            alert('APIキーを削除しました。');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
            <div className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-gradient-to-r from-neutral-900 to-neutral-800">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                        <KeyRound className="w-6 h-6 text-emerald-400" />
                        Gemini API キー設定
                    </h2>
                    <button onClick={() => setShowApiKeyDialog(false)} className="text-neutral-500 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <div className="space-y-4">
                        <p className="text-sm text-neutral-400 leading-relaxed">
                            AI Studioプレビュー環境以外で実行する場合、AI機能（生成・チャット等）を利用するにはAPIキーが必要です。
                        </p>

                        <div className="relative group">
                            <label className="text-xs font-bold text-neutral-500 mb-1.5 block uppercase tracking-wider">
                                Gemini API キー
                            </label>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="AIza..."
                                className="w-full bg-neutral-800 border-2 border-neutral-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-all placeholder:text-neutral-600"
                            />
                        </div>

                        <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                            <div className="flex gap-3">
                                <AlertCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                                <div className="text-xs text-emerald-300 leading-relaxed">
                                    APIキーはブラウザの localStorage にのみ保存され、開発サーバーには送信されません。
                                </div>
                            </div>
                        </div>

                        <a
                            href="https://aistudio.google.com/app/apikey"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 transition-colors w-fit font-medium"
                        >
                            APIキーを新規取得する (Google AI Studio)
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={handleClear}
                            className="flex-1 px-4 py-3 rounded-xl border-2 border-neutral-700 text-neutral-400 hover:text-white hover:border-red-500/50 hover:bg-red-500/10 transition-all flex items-center justify-center gap-2 font-bold"
                        >
                            <Trash2 className="w-4 h-4" /> 削除
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
                        >
                            <Save className="w-4 h-4" /> 保存して閉じる
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApiKeyDialog;
