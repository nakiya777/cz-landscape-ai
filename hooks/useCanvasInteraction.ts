
import React, { useState, useRef, useCallback } from 'react';
import { CanvasItem, CameraState } from '../types';
import { getClosestPointOnSegment } from '../utils/canvas';
import { useAppContext } from '../context/AppContext';

interface UseCanvasInteractionProps {
    canvasRef: React.RefObject<HTMLDivElement>;
}

export const useCanvasInteraction = ({ canvasRef }: UseCanvasInteractionProps) => {
    const {
        items, setItems, camera, setCamera, selectedId, setSelectedId,
        scale, toolMode, recordHistory, setTempMeasureDistance, setShowMeasureDialog,
        measurePoints, setMeasurePoints, isSnapMode
    } = useAppContext();

    // Internal state remains for dragging/interaction specifics
    const [isDragging, setIsDragging] = useState(false);
    const dragOccurredRef = useRef(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [activeAction, setActiveAction] = useState<string | null>(null);
    const [initialItemState, setInitialItemState] = useState<CanvasItem | null>(null);
    const [initialCameraState, setInitialCameraState] = useState<CameraState | null>(null);
    const [draggedVertexIndex, setDraggedVertexIndex] = useState<number | null>(null);
    const [hoveredEdge, setHoveredEdge] = useState<{ index: number, x: number, y: number } | null>(null);

    const handleCanvasClick = useCallback((e: React.MouseEvent) => {
        if (toolMode === 'measure') {
            const rect = canvasRef.current!.getBoundingClientRect();
            const x = (e.clientX - rect.left) / scale, y = (e.clientY - rect.top) / scale;
            if (measurePoints.length === 0) setMeasurePoints([{ x, y }]);
            else {
                setMeasurePoints([measurePoints[0], { x, y }]);
                setTempMeasureDistance(Math.sqrt(Math.pow(measurePoints[0].x - x, 2) + Math.pow(measurePoints[0].y - y, 2)));
                setShowMeasureDialog(true);
            }
        } else if (!isDragging && !dragOccurredRef.current) {
            setSelectedId(null);
        }
        dragOccurredRef.current = false;
    }, [toolMode, canvasRef, scale, measurePoints, isDragging, setMeasurePoints, setTempMeasureDistance, setShowMeasureDialog, setSelectedId]);

    const handleMouseDownItem = useCallback((e: React.MouseEvent, item: CanvasItem | 'camera', action: string, vertexIndex?: number) => {
        if (toolMode === 'measure') return;
        e.stopPropagation();
        setIsDragging(true);
        dragOccurredRef.current = false;
        setDragStart({ x: e.clientX, y: e.clientY });
        setActiveAction(action);
        if (item === 'camera') {
            setInitialCameraState(camera ? { ...camera } : null);
            setSelectedId('camera');
        } else {
            setSelectedId(item.id);
            setInitialItemState({ ...item });
            if (vertexIndex !== undefined) setDraggedVertexIndex(vertexIndex);
        }
    }, [toolMode, camera, setSelectedId]);

    const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging) {
            if (selectedId && toolMode !== 'measure') {
                const item = items.find(i => i.id === selectedId);
                if (item && item.polygonPoints && item.polygonPoints.length >= 3) {
                    const rect = canvasRef.current!.getBoundingClientRect();
                    const mx = (e.clientX - rect.left) / scale; const my = (e.clientY - rect.top) / scale;
                    const rad = -(item.rotation * Math.PI) / 180; const cos = Math.cos(rad); const sin = Math.sin(rad);
                    const dx = mx - (item.x + item.width / 2); const dy = my - (item.y + item.height / 2);
                    const localX = (dx * cos - dy * sin) + item.width / 2; const localY = (dx * sin + dy * cos) + item.height / 2;
                    let foundEdge = null;
                    for (let i = 0; i < item.polygonPoints.length; i++) {
                        const p1 = item.polygonPoints[i]; const p2 = item.polygonPoints[(i + 1) % item.polygonPoints.length];
                        const closest = getClosestPointOnSegment({ x: localX, y: localY }, p1, p2);
                        const dist = Math.sqrt(Math.pow(localX - closest.x, 2) + Math.pow(localY - closest.y, 2));
                        if (dist < 10 && Math.sqrt(Math.pow(closest.x - p1.x, 2) + Math.pow(closest.y - p1.y, 2)) > 15 && Math.sqrt(Math.pow(closest.x - p2.x, 2) + Math.pow(closest.y - p2.y, 2)) > 15) { foundEdge = { index: i, x: closest.x, y: closest.y }; break; }
                    }
                    setHoveredEdge(foundEdge);
                } else { setHoveredEdge(null); }
            }
            return;
        };

        const dx = (e.clientX - dragStart.x) / scale;
        const dy = (e.clientY - dragStart.y) / scale;
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) dragOccurredRef.current = true;

        if (selectedId === 'camera' && camera && initialCameraState) {
            if (activeAction === 'camera-move') {
                setCamera(prev => prev ? { ...prev, x: initialCameraState.x + dx, y: initialCameraState.y + dy } : null);
            } else if (activeAction === 'camera-rotate') {
                const rect = canvasRef.current!.getBoundingClientRect();
                const currAngle = Math.atan2((e.clientY - rect.top) / scale - initialCameraState.y, (e.clientX - rect.left) / scale - initialCameraState.x);
                const startAngle = Math.atan2((dragStart.y - rect.top) / scale - initialCameraState.y, (dragStart.x - rect.left) / scale - initialCameraState.x);
                setCamera(prev => prev ? { ...prev, rotation: (initialCameraState.rotation + (currAngle - startAngle) * (180 / Math.PI)) % 360 } : null);
            }
            return;
        }

        const snap = (v: number) => isSnapMode ? Math.round(v / 10) * 10 : v;

        if (selectedId !== 'camera' && initialItemState) {
            setItems(prevItems => prevItems.map(item => {
                if (item.id !== selectedId) return item;
                if (activeAction === 'vertex-move' && draggedVertexIndex !== null && item.polygonPoints && initialItemState.polygonPoints) {
                    const rad = -(initialItemState.rotation * Math.PI) / 180; const cos = Math.cos(rad); const sin = Math.sin(rad);
                    const newPoints = [...initialItemState.polygonPoints];
                    // We snap the local offset from original point
                    const localDX = snap(dx * cos - dy * sin);
                    const localDY = snap(dx * sin + dy * cos);
                    newPoints[draggedVertexIndex] = {
                        x: initialItemState.polygonPoints[draggedVertexIndex].x + localDX,
                        y: initialItemState.polygonPoints[draggedVertexIndex].y + localDY
                    };
                    return { ...item, polygonPoints: newPoints };
                }
                if (activeAction === 'move') {
                    return { ...item, x: snap(initialItemState.x + dx), y: snap(initialItemState.y + dy) };
                }
                else if (activeAction?.startsWith('resize') && !item.polygonPoints) {
                    const rad = (initialItemState.rotation * Math.PI) / 180; const cos = Math.cos(rad); const sin = Math.sin(rad);
                    // Snap the dimensions
                    let newWidth = snap(Math.max(10, initialItemState.width + (dx * cos + dy * sin)));
                    let newHeight = snap(Math.max(10, initialItemState.height + (-dx * sin + dy * cos)));
                    const vx = (newWidth - initialItemState.width) / 2, vy = (newHeight - initialItemState.height) / 2;
                    return { ...item, width: newWidth, height: newHeight, x: initialItemState.x - (vx - (vx * cos - vy * sin)), y: initialItemState.y - (vy - (vx * sin + vy * cos)) };
                }
                else if (activeAction === 'rotate') {
                    const rect = canvasRef.current!.getBoundingClientRect();
                    const cx = initialItemState.x + initialItemState.width / 2, cy = initialItemState.y + initialItemState.height / 2;
                    const currAngle = Math.atan2((e.clientY - rect.top) / scale - cy, (e.clientX - rect.left) / scale - cx);
                    const startAngle = Math.atan2((dragStart.y - rect.top) / scale - cy, (dragStart.x - rect.left) / scale - cx);
                    // For rotation, snap to 15 degrees if snap is on
                    let rotation = (initialItemState.rotation + (currAngle - startAngle) * (180 / Math.PI)) % 360;
                    if (isSnapMode) rotation = Math.round(rotation / 15) * 15;
                    return { ...item, rotation };
                }
                return item;
            }));
        }
    }, [isDragging, selectedId, toolMode, items, canvasRef, scale, dragStart, camera, initialCameraState, activeAction, initialItemState, draggedVertexIndex, setCamera, setItems]);

    const handleMouseUpGlobal = useCallback(() => {
        if (isDragging && selectedId && selectedId !== 'camera' && dragOccurredRef.current) {
            recordHistory(items);
        }
        setIsDragging(false);
        setActiveAction(null);
        setInitialItemState(null);
        setInitialCameraState(null);
        setDraggedVertexIndex(null);
    }, [isDragging, selectedId, dragOccurredRef, items, recordHistory]);

    const handleAddVertex = useCallback((e: React.MouseEvent, item: CanvasItem, index: number, x: number, y: number) => {
        e.stopPropagation();
        const newPoints = [...(item.polygonPoints || [])];
        const insertIndex = index + 1;
        newPoints.splice(insertIndex, 0, { x, y });
        const newItem = { ...item, polygonPoints: newPoints };
        const newItems = items.map(i => i.id === item.id ? newItem : i);
        setItems(newItems);
        recordHistory(newItems);
        setSelectedId(item.id);
        setActiveAction('vertex-move');
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        setInitialItemState(newItem);
        setDraggedVertexIndex(insertIndex);
        setHoveredEdge(null);
    }, [items, setItems, recordHistory, setSelectedId]);

    return {
        isDragging,
        hoveredEdge,
        handleCanvasClick,
        handleMouseDownItem,
        handleCanvasMouseMove,
        handleMouseUpGlobal,
        handleAddVertex
    };
};
