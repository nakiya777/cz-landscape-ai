
import { useState, useCallback } from 'react';
import { CanvasItem } from '../types';

export const useHistory = (initialItems: CanvasItem[]) => {
    const [history, setHistory] = useState<CanvasItem[][]>([initialItems]);
    const [historyIndex, setHistoryIndex] = useState(0);

    const recordHistory = useCallback(
        (newItems: CanvasItem[]) => {
            const newHistory = history.slice(0, historyIndex + 1);
            newHistory.push(newItems);
            if (newHistory.length > 50) newHistory.shift();
            setHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
        },
        [history, historyIndex]
    );

    const undo = useCallback(
        (setItems: (items: CanvasItem[]) => void) => {
            if (historyIndex > 0) {
                setItems(history[historyIndex - 1]);
                setHistoryIndex(historyIndex - 1);
                return history[historyIndex - 1];
            }
            return null;
        },
        [history, historyIndex]
    );

    const redo = useCallback(
        (setItems: (items: CanvasItem[]) => void) => {
            if (historyIndex < history.length - 1) {
                setItems(history[historyIndex + 1]);
                setHistoryIndex(historyIndex + 1);
                return history[historyIndex + 1];
            }
            return null;
        },
        [history, historyIndex]
    );

    return {
        recordHistory,
        undo,
        redo,
        historyIndex,
        historyLength: history.length,
    };
};
