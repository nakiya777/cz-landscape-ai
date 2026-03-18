
import React from 'react';
import { X, Zap, Crown, Sun, Building2, RefreshCw, Sparkles, Wand2 } from 'lucide-react';
import { Season, TimeOfDay, ViewType, ImageModelType, BuildingMainCategory, BuildingFloors } from '../../types';
import { BUILDING_TASTES } from '../../constants';
import { useAppContext } from '../../context/AppContext';

interface PromptDialogProps {
    finalPrompt: string;
    setFinalPrompt: (val: string) => void;
    onRefine: () => void;
    onStartGeneration: () => void;
    onClose: () => void;
}

const PromptDialog: React.FC<PromptDialogProps> = ({
    finalPrompt, setFinalPrompt, onRefine, onStartGeneration, onClose
}) => {
    const {
        imageModel, setImageModel, promptModel, setPromptModel,
        season, setSeason, time, setTime, viewType, setViewType,
        buildingCategory, setBuildingCategory, buildingStyle, setBuildingStyle,
        buildingFloors, setBuildingFloors, isRefining
    } = useAppContext();
    return (
        <div className="absolute inset-0 z-[300] bg-black/70 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300" >
            <div className="bg-neutral-900 rounded-2xl max-w-4xl w-full border border-neutral-700 flex flex-col max-h-[90vh] shadow-3xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-center p-5 border-b border-neutral-800 bg-neutral-800/30">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3"><Zap className="w-6 h-6 text-emerald-400" /> デザイン生成設定</h2>
                    <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
                </div>
                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2"><Crown className="w-3 h-3" /> 画像生成エンジン</label>
                            <select
                                value={imageModel}
                                onChange={(e) => setImageModel(e.target.value as ImageModelType)}
                                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-sm text-white outline-none focus:border-emerald-500"
                            >
                                <option value="gemini-3-pro-image-preview">★ Gemini 3 Pro Image (推奨)</option>
                                <option value="imagen-3.0-generate-002">Imagen 3 / Nano Banana PRO</option>
                                <option value="gemini-3-flash-preview">Gemini 3 Flash (テキストのみ)</option>
                                <option value="gemini-3-pro-preview">Gemini 3 Pro (テキストのみ)</option>
                                <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash (レガシー)</option>
                            </select>

                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-4 block flex items-center gap-2"><Sparkles className="w-3 h-3" /> プロンプト改善エンジン</label>
                            <select
                                value={promptModel}
                                onChange={(e) => setPromptModel(e.target.value as ImageModelType)}
                                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-sm text-white outline-none focus:border-emerald-500"
                            >
                                <option value="gemini-3-flash-preview">★ Gemini 3 Flash (高速・推奨)</option>
                                <option value="gemini-3-pro-preview">Gemini 3 Pro (高精度)</option>
                                <option value="gemini-3-pro-image-preview">Gemini 3 Pro Image</option>
                                <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash (レガシー)</option>
                            </select>

                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-4 block flex items-center gap-2"><Sun className="w-3 h-3" /> 環境設定</label>
                            <div className="grid grid-cols-3 gap-2">
                                <select value={season} onChange={(e) => setSeason(e.target.value as Season)} className="bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-emerald-500">
                                    <option value="spring">春</option><option value="summer">夏</option><option value="autumn">秋</option><option value="winter">冬</option>
                                </select>
                                <select value={time} onChange={(e) => setTime(e.target.value as TimeOfDay)} className="bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-emerald-500">
                                    <option value="day">昼</option><option value="sunset">夕暮れ</option><option value="night">夜間</option>
                                </select>
                                <select value={viewType} onChange={(e) => setViewType(e.target.value as ViewType)} className="bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-emerald-500">
                                    <option value="eye-level">アイレベル</option><option value="aerial">鳥瞰</option><option value="front">正面</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2"><Building2 className="w-3 h-3" /> 建物設定</label>
                            <div className="space-y-3 p-4 bg-neutral-800/40 rounded-xl border border-neutral-800">
                                <div>
                                    <span className="text-[10px] text-neutral-500 block mb-1.5 ml-1">テイスト</span>
                                    <div className="flex gap-1.5 flex-wrap">
                                        {([
                                            { id: 'japanese', label: '和風' }, { id: 'western', label: '洋風' }, { id: 'modern', label: 'モダン' }, { id: 'none', label: 'なし' }
                                        ] as const).map(c => (
                                            <button key={c.id} onClick={() => { setBuildingCategory(c.id); if (c.id !== 'none') setBuildingStyle(BUILDING_TASTES[c.id].styles[0].id); }} className={`px-3 py-1.5 text-[10px] rounded-lg border transition-all ${buildingCategory === c.id ? 'bg-amber-600 border-amber-500 text-white shadow-lg' : 'bg-neutral-800 border-neutral-700 text-neutral-500'}`}>{c.label}</button>
                                        ))}
                                    </div>
                                </div>
                                {buildingCategory !== 'none' && (
                                    <div className="animate-in slide-in-from-top-2">
                                        <span className="text-[10px] text-neutral-500 block mb-1.5 ml-1">詳細スタイル</span>
                                        <select value={buildingStyle} onChange={(e) => setBuildingStyle(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-xs text-white outline-none focus:border-amber-500">
                                            {BUILDING_TASTES[buildingCategory].styles.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                )}
                                <div>
                                    <span className="text-[10px] text-neutral-500 block mb-1.5 ml-1">階数</span>
                                    <div className="flex gap-1.5">
                                        {(['1', '2', '3'] as const).map(f => (
                                            <button key={f} onClick={() => setBuildingFloors(f)} className={`flex-1 py-1.5 text-[10px] rounded-lg border transition-all ${buildingFloors === f ? 'bg-amber-600 border-amber-500 text-white shadow-lg' : 'bg-neutral-800 border-neutral-700 text-neutral-500'}`}>{f}階建て</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-3 pt-4 border-t border-neutral-800">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">最終指示内容</label>
                            <button
                                onClick={onRefine}
                                disabled={isRefining}
                                className="text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-lg transition-all disabled:opacity-50"
                            >
                                {isRefining ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} AIで洗練する
                            </button>
                        </div>
                        <textarea
                            className="w-full h-40 bg-neutral-950 p-5 rounded-xl border border-neutral-800 font-mono text-sm text-neutral-300 outline-none focus:border-emerald-500/50 resize-none shadow-inner"
                            value={finalPrompt}
                            onChange={(e) => setFinalPrompt(e.target.value)}
                        />
                    </div>
                </div>
                <div className="p-5 border-t border-neutral-800 flex justify-end gap-3 bg-neutral-800/20">
                    <button onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-neutral-400 hover:text-white transition-colors">キャンセル</button>
                    <button onClick={onStartGeneration} className="px-12 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold shadow-xl active:scale-95 flex items-center gap-2 text-sm"><Wand2 className="w-4 h-4" /> 生成を開始</button>
                </div>
            </div>
        </div >
    );
};

export default PromptDialog;
