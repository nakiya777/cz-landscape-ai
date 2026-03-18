import React from 'react';
import { X, Cpu, Sparkles, ImageIcon, Settings2, Home } from 'lucide-react';
import { ImageModelType } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { AI_MODELS_CONFIG, getModelsForCapability, getModelDisplayName } from '../../config/aiModels';

interface AISettingsDialogProps {
    onClose: () => void;
}

const AISettingsDialog: React.FC<AISettingsDialogProps> = ({ onClose }) => {
    const { imageModel, setImageModel, promptModel, setPromptModel, detectionModel, setDetectionModel } = useAppContext();

    // 画像生成対応モデル（image capability）
    const imageGenModels = getModelsForCapability('image');
    // 画像認識対応モデル（vision capability）
    const visionModels = getModelsForCapability('vision');
    // テキスト生成対応モデル（text capability）
    const textModels = getModelsForCapability('text');

    return (
        <div className="absolute inset-0 z-[500] bg-black/70 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-neutral-900 rounded-2xl max-w-lg w-full border border-neutral-700 flex flex-col max-h-[80vh] shadow-3xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-center p-5 border-b border-neutral-800 bg-neutral-800/30">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        <Settings2 className="w-6 h-6 text-emerald-400" /> AI設定
                    </h2>
                    <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
                    {/* 画像生成エンジン */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-emerald-400" /> 画像生成エンジン
                        </label>
                        <select
                            value={imageModel}
                            onChange={(e) => setImageModel(e.target.value as ImageModelType)}
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-sm text-white outline-none focus:border-emerald-500 transition-colors"
                        >
                            {imageGenModels.map(model => (
                                <option key={model.id} value={model.id}>
                                    {getModelDisplayName(model.id)}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-neutral-500">
                            画像を直接生成するには画像生成対応モデルを選択してください。
                        </p>
                    </div>

                    {/* 建物検出エンジン */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                            <Home className="w-4 h-4 text-orange-400" /> 建物検出エンジン
                        </label>
                        <select
                            value={detectionModel}
                            onChange={(e) => setDetectionModel(e.target.value as ImageModelType)}
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-sm text-white outline-none focus:border-orange-500 transition-colors"
                        >
                            {visionModels.map(model => (
                                <option key={model.id} value={model.id}>
                                    {getModelDisplayName(model.id)}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-neutral-500">
                            配置図から建物を検出するAIモデルを選択します。
                        </p>
                    </div>

                    {/* プロンプト改善エンジン */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-400" /> プロンプト改善エンジン
                        </label>
                        <select
                            value={promptModel}
                            onChange={(e) => setPromptModel(e.target.value as ImageModelType)}
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                        >
                            {textModels.map(model => (
                                <option key={model.id} value={model.id}>
                                    {getModelDisplayName(model.id)}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-neutral-500">
                            プロンプトの改善・拡張に使用するAIモデルを選択します。
                        </p>
                    </div>

                    {/* チャットエンジン (参考表示) */}
                    <div className="space-y-3 opacity-60">
                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                            <Cpu className="w-4 h-4 text-cyan-400" /> チャットエンジン
                        </label>
                        <div className="w-full bg-neutral-800/50 border border-neutral-700 rounded-lg p-3 text-sm text-neutral-400">
                            {getModelDisplayName(AI_MODELS_CONFIG.defaults.chat)} (固定)
                        </div>
                        <p className="text-xs text-neutral-500">
                            チャット機能は常に上記モデルを使用します。
                        </p>
                    </div>
                </div>

                <div className="p-4 border-t border-neutral-800 bg-neutral-800/30">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-colors"
                    >
                        設定を保存
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AISettingsDialog;
