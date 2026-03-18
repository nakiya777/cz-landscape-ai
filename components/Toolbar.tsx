import React from 'react';
import { Upload, Ruler, Home, Camera, Undo, Redo, ArrowDown, ArrowUp, Trash2, Wand2, MessageSquare, Grid3X3 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface ToolbarProps {
    onUploadImage: () => void;
    onToggleMeasureMode: () => void;
    onDetectBuilding: () => void;
    onToggleCamera: () => void;
    onOpenPromptDialog: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
    onUploadImage, onToggleMeasureMode, onDetectBuilding, onToggleCamera, onOpenPromptDialog
}) => {
    const {
        toolMode, isDetectingBuilding, bgImage, camera,
        undo, redo, historyIndex, historyLength,
        selectedId, handleMoveLayer, deleteItem, isGenerating,
        isChatOpen, setIsChatOpen,
        isSnapMode, setIsSnapMode
    } = useAppContext();

    const isMeasureMode = toolMode === 'measure';
    const hasBgImage = !!bgImage;
    const hasCamera = !!camera;
    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < historyLength - 1;
    return (
        <div className="h-14 bg-neutral-800 border-b border-neutral-700 flex items-center justify-between px-4 z-20">
            <div className="flex items-center gap-4">
                <button onClick={onUploadImage} className="flex items-center gap-2 px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 rounded text-sm text-white">
                    <Upload className="w-4 h-4" /> 敷地図
                </button>
                <button
                    onClick={onToggleMeasureMode}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm ${isMeasureMode ? 'bg-yellow-600 text-white shadow-lg' : 'bg-neutral-700 text-neutral-300'}`}
                >
                    <Ruler className="w-4 h-4" /> 縮尺
                </button>
                <button
                    onClick={() => setIsSnapMode(!isSnapMode)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm ${isSnapMode ? 'bg-emerald-600 text-white shadow-lg' : 'bg-neutral-700 text-neutral-300'}`}
                >
                    <Grid3X3 className="w-4 h-4" /> スナップ
                </button>
                <button
                    onClick={onDetectBuilding}
                    disabled={!hasBgImage || isDetectingBuilding}
                    className="flex items-center gap-2 px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 rounded text-sm text-neutral-300 disabled:opacity-30"
                >
                    <Home className="w-4 h-4" /> 建物検出
                </button>
                <button
                    onClick={onToggleCamera}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm ${hasCamera ? 'bg-indigo-600 text-white' : 'bg-neutral-700 text-neutral-300'}`}
                >
                    <Camera className="w-4 h-4" /> 視点
                </button>
                <button
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm ${isChatOpen ? 'bg-indigo-600 text-white shadow-lg' : 'bg-neutral-700 text-neutral-300'}`}
                >
                    <MessageSquare className="w-4 h-4" /> チャット
                </button>
                <div className="flex items-center bg-neutral-800 rounded border border-neutral-700">
                    <button onClick={undo} disabled={!canUndo} className="p-1.5 text-neutral-400 disabled:opacity-30"><Undo className="w-4 h-4" /></button>
                    <button onClick={redo} disabled={!canRedo} className="p-1.5 text-neutral-400 disabled:opacity-30"><Redo className="w-4 h-4" /></button>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {selectedId && selectedId !== 'camera' && (
                    <div className="flex items-center gap-1 bg-neutral-700 rounded-lg p-1 mr-2">
                        <button onClick={() => handleMoveLayer('down')} className="p-1.5 hover:bg-neutral-600 rounded"><ArrowDown className="w-4 h-4" /></button>
                        <button onClick={() => handleMoveLayer('up')} className="p-1.5 hover:bg-neutral-600 rounded"><ArrowUp className="w-4 h-4" /></button>
                        <button onClick={deleteItem} className="p-1.5 text-red-400 hover:bg-red-900/20 rounded"><Trash2 className="w-4 h-4" /></button>
                    </div>
                )}
                <button
                    onClick={onOpenPromptDialog}
                    disabled={!hasBgImage || isGenerating}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50"
                >
                    <Wand2 className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} /> AI生成
                </button>
            </div>
        </div>
    );
};

export default Toolbar;
