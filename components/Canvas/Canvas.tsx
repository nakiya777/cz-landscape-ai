
import React from 'react';
import { Maximize, ImageIcon } from 'lucide-react';
import { CanvasItem as ICanvasItem, CameraState, MeasurePoint, ToolMode } from '../../types';
import CanvasItemComponent from './CanvasItem';
import CameraItemComponent from './CameraItem';

interface CanvasProps {
    bgImage: string | null;
    items: ICanvasItem[];
    selectedId: string | null;
    scale: number;
    setScale: (val: number | ((prev: number) => number)) => void;
    toolMode: ToolMode;
    measurePoints: MeasurePoint[];
    camera: CameraState | null;
    hoveredEdge: { index: number; x: number; y: number } | null;
    canvasRef: React.RefObject<HTMLDivElement>;
    onCanvasClick: (e: React.MouseEvent) => void;
    onMouseDownItem: (e: React.MouseEvent, item: ICanvasItem | 'camera', action: string, vertexIndex?: number) => void;
    onAddVertex: (e: React.MouseEvent, item: ICanvasItem, index: number, x: number, y: number) => void;
}

const Canvas: React.FC<CanvasProps> = ({
    bgImage, items, selectedId, scale, setScale, toolMode, measurePoints, camera, hoveredEdge, canvasRef,
    onCanvasClick, onMouseDownItem, onAddVertex
}) => {
    return (
        <div className="flex-1 overflow-hidden relative flex items-center justify-center p-8 bg-neutral-900">
            <div
                ref={canvasRef}
                onClick={onCanvasClick}
                className={`relative shadow-2xl transition-all ${!bgImage ? 'w-[600px] h-[400px] border-2 border-dashed border-neutral-600 flex items-center justify-center bg-neutral-800/50' : ''}`}
                style={{ transform: `scale(${scale})` }}
            >
                {bgImage ? (
                    <>
                        <img src={bgImage} className="max-h-[80vh] max-w-[80vw] object-contain pointer-events-none select-none" draggable={false} alt="Site plan" />

                        {measurePoints.map((p, i) => (
                            <div key={i} className="absolute w-2 h-2 bg-yellow-400 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg ring-1 ring-black" style={{ left: p.x, top: p.y }}></div>
                        ))}

                        {items.map(item => (
                            <CanvasItemComponent
                                key={item.id}
                                item={item}
                                isSelected={selectedId === item.id}
                                toolMode={toolMode}
                                hoveredEdge={selectedId === item.id ? hoveredEdge : null}
                                onMouseDown={(e, action, vertexIndex) => onMouseDownItem(e, item, action, vertexIndex)}
                                onItemClick={(e) => e.stopPropagation()}
                                onAddVertex={(e, index, x, y) => onAddVertex(e, item, index, x, y)}
                            />
                        ))}

                        {camera && (
                            <CameraItemComponent
                                camera={camera}
                                isSelected={selectedId === 'camera'}
                                onMouseDown={(e, action) => onMouseDownItem(e, 'camera', action)}
                            />
                        )}
                    </>
                ) : (
                    <div className="text-center text-neutral-500">
                        <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>敷地図をアップロード</p>
                    </div>
                )}
            </div>

            {/* Zoom Controls */}
            <div className="absolute bottom-4 right-4 flex gap-2 bg-neutral-800 p-1 rounded-lg border border-neutral-700 z-20 shadow-xl">
                <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="p-2 hover:bg-neutral-700 rounded transition-colors">-</button>
                <span className="py-2 px-2 text-sm text-neutral-300 min-w-[3rem] text-center">{Math.round(scale * 100)}%</span>
                <button onClick={() => setScale(s => Math.min(2.0, s + 0.1))} className="p-2 hover:bg-neutral-700 rounded transition-colors">+</button>
                <button onClick={() => setScale(1.0)} className="p-2 border-l border-neutral-600 hover:bg-neutral-700 rounded-r transition-colors"><Maximize className="w-4 h-4" /></button>
            </div>
        </div>
    );
};

export default Canvas;
