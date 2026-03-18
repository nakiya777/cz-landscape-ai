
import React from 'react';
import { Check, X } from 'lucide-react';

interface ResultDialogProps {
    generatedImage: string;
    onClose: () => void;
    onSave: () => void;
}

const ResultDialog: React.FC<ResultDialogProps> = ({
    generatedImage, onClose, onSave
}) => {
    return (
        <div className="absolute inset-0 z-[500] bg-black/80 flex items-center justify-center p-10 animate-in fade-in backdrop-blur-md">
            <div className="bg-neutral-900 p-2 rounded-xl max-w-5xl w-full border border-neutral-700 flex flex-col h-[85vh] shadow-3xl overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-neutral-800">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2"><Check className="w-5 h-5 text-emerald-400" /> デザイン生成完了</h2>
                    <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <div className="flex-1 bg-neutral-950 flex items-center justify-center overflow-hidden rounded-lg m-4 relative group">
                    <img
                        src={generatedImage}
                        className="max-w-full max-h-full object-contain shadow-2xl transition-transform duration-500 group-hover:scale-105"
                        alt="Generated landscape"
                    />
                </div>
                <div className="p-4 flex justify-end gap-3 bg-neutral-900/50">
                    <button onClick={onClose} className="px-6 py-2 text-neutral-400 hover:text-white">閉じる</button>
                    <button
                        onClick={onSave}
                        className="px-8 py-2 bg-emerald-600 text-white rounded font-bold shadow-lg active:scale-95"
                    >
                        画像を保存
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResultDialog;
