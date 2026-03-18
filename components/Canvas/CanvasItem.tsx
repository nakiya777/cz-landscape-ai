
import React from 'react';
import { RotateCw, PlusCircle } from 'lucide-react';
import { CanvasItem as ICanvasItem, PlantData, ExteriorData, CustomAssetData, ToolMode } from '../../types';

interface CanvasItemProps {
    item: ICanvasItem;
    isSelected: boolean;
    toolMode: ToolMode;
    hoveredEdge: { index: number; x: number; y: number } | null;
    onMouseDown: (e: React.MouseEvent, action: string, vertexIndex?: number) => void;
    onItemClick: (e: React.MouseEvent) => void;
    onAddVertex: (e: React.MouseEvent, index: number, x: number, y: number) => void;
}

const CanvasItem: React.FC<CanvasItemProps> = ({
    item, isSelected, toolMode, hoveredEdge, onMouseDown, onItemClick, onAddVertex
}) => {
    return (
        <div
            onMouseDown={(e) => onMouseDown(e, 'move')}
            onClick={onItemClick}
            className={`absolute group select-none ${isSelected ? 'z-50' : ''}`}
            style={{
                left: item.x,
                top: item.y,
                width: item.width,
                height: item.height,
                transform: `rotate(${item.rotation}deg)`,
                zIndex: item.zIndex,
                cursor: toolMode === 'measure' ? 'crosshair' : 'grab'
            }}
        >
            {item.polygonPoints ? (
                <div className="w-full h-full relative" onClick={(e) => e.stopPropagation()}>
                    <svg width={item.width} height={item.height} className="overflow-visible pointer-events-none">
                        <polygon
                            points={item.polygonPoints.map(p => `${p.x},${p.y}`).join(' ')}
                            fill={(item.data as ExteriorData).category === 'building' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(59, 130, 246, 0.2)'}
                            stroke={(item.data as ExteriorData).category === 'building' ? 'white' : '#60A5FA'}
                            strokeWidth="2"
                            className="pointer-events-auto"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xl">
                        {(item.data as ExteriorData).icon}
                    </div>
                    {isSelected && item.polygonPoints.map((pt, idx) => (
                        <div key={idx}
                            className="absolute w-4 h-4 bg-white border-2 border-blue-600 rounded-full cursor-move z-[70] hover:scale-125 transition-transform"
                            style={{ left: pt.x, top: pt.y, transform: 'translate(-50%, -50%)' }}
                            onMouseDown={(e) => onMouseDown(e, 'vertex-move', idx)}
                            onClick={(e) => e.stopPropagation()}
                        />
                    ))}
                    {isSelected && hoveredEdge && (
                        <div className="absolute w-5 h-5 bg-emerald-500 text-white rounded-full cursor-copy z-[60] flex items-center justify-center shadow-lg hover:scale-125 transition-transform"
                            style={{ left: hoveredEdge.x, top: hoveredEdge.y, transform: 'translate(-50%, -50%)' }}
                            onMouseDown={(e) => onAddVertex(e, hoveredEdge.index, hoveredEdge.x, hoveredEdge.y)}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <PlusCircle className="w-3 h-3" />
                        </div>
                    )}
                </div>
            ) : (
                <div
                    className={`w-full h-full flex items-center justify-center transition-all overflow-hidden ${(item.data as ExteriorData).category === 'building' ? 'border-2 border-dashed border-white/50 bg-white/40' : (item.type === 'plant' ? 'rounded-full opacity-80 border border-white/20' : (item.type === 'custom_image' ? 'border border-blue-400/50' : 'border-2 border-blue-400 bg-blue-500/20'))} ${isSelected ? 'ring-2 ring-blue-400' : ''}`}
                    style={item.type === 'plant' ? { backgroundColor: (item.data as PlantData).color } : {}}
                >
                    {item.type === 'exterior' && <span className="text-xl">{(item.data as ExteriorData).icon}</span>}
                    {item.type === 'custom_image' && <img src={(item.data as CustomAssetData).image} className="w-full h-full object-contain pointer-events-none" alt={item.data.name} />}
                </div>
            )}
            {isSelected && (
                <>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 bg-white text-blue-600 rounded-full shadow-lg flex items-center justify-center cursor-ew-resize z-[80]"
                        onMouseDown={(e) => onMouseDown(e, 'rotate')}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <RotateCw className="w-3 h-3" />
                    </div>
                    {!item.polygonPoints && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white border-2 border-blue-500 rounded-sm cursor-nwse-resize z-[80]"
                            onMouseDown={(e) => onMouseDown(e, 'resize')}
                            onClick={(e) => e.stopPropagation()}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default CanvasItem;
