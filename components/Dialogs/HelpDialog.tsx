
import React from 'react';
import { X } from 'lucide-react';

interface HelpDialogProps {
    onClose: () => void;
}

const HelpDialog: React.FC<HelpDialogProps> = ({ onClose }) => {
    return (
        <div className="absolute inset-0 z-[600] bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-neutral-800 p-8 rounded-xl max-w-lg w-full border border-neutral-700 relative shadow-2xl" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-white"><X className="w-6 h-6" /></button>
                <h2 className="text-2xl font-bold text-white mb-6 text-emerald-400">操作ガイド</h2>
                <div className="space-y-4 text-sm text-neutral-200">
                    <p className="bg-neutral-700/50 p-3 rounded border border-neutral-600">
                        <strong className="text-white block mb-1">■ 基本操作</strong>
                        ドラッグで移動、回転ハンドルで向きを調整。敷地図をアップロードして開始。
                    </p>
                    <p className="bg-neutral-700/50 p-3 rounded border border-neutral-600">
                        <strong className="text-white block mb-1">■ 頂点の操作</strong>
                        建物などを選択すると頂点（○）が表示され、個別に変形できます。辺の上の「＋」で頂点を追加できます。
                    </p>
                </div>
                <button onClick={onClose} className="mt-8 w-full py-3 bg-emerald-600 text-white rounded font-bold shadow-lg">準備完了</button>
            </div>
        </div>
    );
};

export default HelpDialog;
