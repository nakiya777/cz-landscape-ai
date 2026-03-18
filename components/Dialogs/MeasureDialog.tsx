
import React, { useState, useEffect, useCallback } from 'react';
import { Ruler } from 'lucide-react';
import { logger } from '../../utils/logger';

interface MeasureDialogProps {
    measureInputRef: React.RefObject<HTMLInputElement>;
    tempMeasureDistance: number | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (val: number) => void;
}

/** デフォルトの計測値（メートル） */
const DEFAULT_MEASURE_VALUE = "2.0";

const MeasureDialog: React.FC<MeasureDialogProps> = ({
    measureInputRef, isOpen, onClose, onConfirm
}) => {
    /** 入力値のstate管理 */
    const [measureValue, setMeasureValue] = useState(DEFAULT_MEASURE_VALUE);

    /** ダイアログが開かれたときに入力値をデフォルトにリセット */
    useEffect(() => {
        if (isOpen) {
            logger.debug('[MeasureDialog] ダイアログが開かれました。入力値をリセットします:', DEFAULT_MEASURE_VALUE);
            setMeasureValue(DEFAULT_MEASURE_VALUE);
        }
    }, [isOpen]);

    /** 確定ボタンのハンドラ */
    const handleConfirm = useCallback(() => {
        const val = parseFloat(measureValue || "0");
        logger.debug('[MeasureDialog] 確定: 入力値 =', measureValue, '-> パース値 =', val);
        onConfirm(val);
    }, [measureValue, onConfirm]);

    return (
        <div className="absolute inset-0 z-[400] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-neutral-800 p-6 rounded-lg w-80 shadow-2xl border border-neutral-700 animate-in slide-in-from-bottom-4">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Ruler className="w-5 h-5 text-yellow-500" /> 縮尺の設定</h3>
                <div className="flex items-center gap-2 mb-6">
                    <input
                        ref={measureInputRef}
                        type="number"
                        step="0.1"
                        value={measureValue}
                        onChange={(e) => setMeasureValue(e.target.value)}
                        className="flex-1 bg-neutral-900 border border-neutral-600 rounded px-3 py-2 text-white outline-none focus:border-emerald-500"
                        autoFocus
                    />
                    <span className="text-neutral-400">m</span>
                </div>
                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-3 py-2 text-sm text-neutral-400 hover:text-white">キャンセル</button>
                    <button
                        onClick={handleConfirm}
                        className="px-6 py-2 bg-emerald-600 text-white rounded text-sm font-bold shadow-lg"
                    >
                        決定
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MeasureDialog;
