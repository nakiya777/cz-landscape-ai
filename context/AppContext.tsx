
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import {
    CanvasItem, CameraState, ProjectData, Season, TimeOfDay,
    ViewType, BuildingMainCategory, BuildingFloors, CustomAssetData,
    ImageModelType, ChatMessage, PlantData, ExteriorData, MeasurePoint
} from '../types';

interface AppState {
    bgImage: string | null;
    items: CanvasItem[];
    selectedId: string | null;
    scale: number;
    pixelsPerMeter: number;
    season: Season;
    time: TimeOfDay;
    viewType: ViewType;
    buildingCategory: BuildingMainCategory;
    buildingStyle: string;
    buildingFloors: BuildingFloors;
    customAssets: CustomAssetData[];
    isGenerating: boolean;
    isDetectingBuilding: boolean;
    generatedImage: string | null;
    toolMode: 'select' | 'measure';
    camera: CameraState | null;
    imageModel: ImageModelType;
    promptModel: ImageModelType;
    detectionModel: ImageModelType;
    chatMessages: ChatMessage[];
    isRefining: boolean;
    isGeneratingChat: boolean;
    isChatOpen: boolean;
    isSnapMode: boolean;
    measurePoints: MeasurePoint[];
    tempMeasureDistance: number | null;
    showMeasureDialog: boolean;
    historyIndex: number;
    historyLength: number;
    activeTab: 'plants' | 'exterior' | 'custom';
    showApiKeyDialog: boolean;
    showAISettings: boolean;
}

interface AppContextType extends AppState {
    setBgImage: React.Dispatch<React.SetStateAction<string | null>>;
    setItems: React.Dispatch<React.SetStateAction<CanvasItem[]>>;
    setSelectedId: React.Dispatch<React.SetStateAction<string | null>>;
    setScale: React.Dispatch<React.SetStateAction<number>>;
    setPixelsPerMeter: React.Dispatch<React.SetStateAction<number>>;
    setSeason: React.Dispatch<React.SetStateAction<Season>>;
    setTime: React.Dispatch<React.SetStateAction<TimeOfDay>>;
    setViewType: React.Dispatch<React.SetStateAction<ViewType>>;
    setBuildingCategory: React.Dispatch<React.SetStateAction<BuildingMainCategory>>;
    setBuildingStyle: React.Dispatch<React.SetStateAction<string>>;
    setBuildingFloors: React.Dispatch<React.SetStateAction<BuildingFloors>>;
    setCustomAssets: React.Dispatch<React.SetStateAction<CustomAssetData[]>>;
    setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>;
    setIsDetectingBuilding: React.Dispatch<React.SetStateAction<boolean>>;
    setGeneratedImage: React.Dispatch<React.SetStateAction<string | null>>;
    setToolMode: React.Dispatch<React.SetStateAction<'select' | 'measure'>>;
    setCamera: React.Dispatch<React.SetStateAction<CameraState | null>>;
    setImageModel: React.Dispatch<React.SetStateAction<ImageModelType>>;
    setPromptModel: React.Dispatch<React.SetStateAction<ImageModelType>>;
    setDetectionModel: React.Dispatch<React.SetStateAction<ImageModelType>>;
    setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
    setIsRefining: React.Dispatch<React.SetStateAction<boolean>>;
    setIsGeneratingChat: React.Dispatch<React.SetStateAction<boolean>>;
    setIsChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsSnapMode: React.Dispatch<React.SetStateAction<boolean>>;
    setMeasurePoints: React.Dispatch<React.SetStateAction<MeasurePoint[]>>;
    setTempMeasureDistance: React.Dispatch<React.SetStateAction<number | null>>;
    setShowMeasureDialog: React.Dispatch<React.SetStateAction<boolean>>;
    setActiveTab: React.Dispatch<React.SetStateAction<'plants' | 'exterior' | 'custom'>>;
    setShowApiKeyDialog: React.Dispatch<React.SetStateAction<boolean>>;
    setShowAISettings: React.Dispatch<React.SetStateAction<boolean>>;

    // Actions
    recordHistory: (newItems: CanvasItem[]) => void;
    undo: () => void;
    redo: () => void;
    addItem: (itemData: PlantData | ExteriorData | CustomAssetData, type: 'plant' | 'exterior' | 'custom_image', initialParams?: { x: number, y: number, w: number, h: number, points?: { x: number, y: number }[] }) => void;
    deleteItem: () => void;
    handleMoveLayer: (direction: 'up' | 'down') => void;
    sendChatMessage: (text: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

import { chatWithGemini } from '../services/geminiService';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // ... (rest of the file remains similar)
    const [bgImage, setBgImage] = useState<string | null>(null);
    const [items, setItems] = useState<CanvasItem[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [scale, setScale] = useState(1.0);
    const [pixelsPerMeter, setPixelsPerMeter] = useState(50);
    const [season, setSeason] = useState<Season>('spring');
    const [time, setTime] = useState<TimeOfDay>('day');
    const [viewType, setViewType] = useState<ViewType>('eye-level');
    const [buildingCategory, setBuildingCategory] = useState<BuildingMainCategory>('none');
    const [buildingStyle, setBuildingStyle] = useState<string>('');
    const [buildingFloors, setBuildingFloors] = useState<BuildingFloors>('2');
    const [customAssets, setCustomAssets] = useState<CustomAssetData[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isDetectingBuilding, setIsDetectingBuilding] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [toolMode, setToolMode] = useState<'select' | 'measure'>('select');
    const [camera, setCamera] = useState<CameraState | null>(null);
    const [imageModel, setImageModel] = useState<ImageModelType>('gemini-3-pro-image-preview');
    const [promptModel, setPromptModel] = useState<ImageModelType>('gemini-3-flash-preview');
    const [detectionModel, setDetectionModel] = useState<ImageModelType>('imagen-3.0-generate-002');
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        { role: 'system', text: 'こんにちは！お庭のデザインについて、何か相談はありますか？現在の配置を見ながらアドバイスできますよ。' }
    ]);
    const [isRefining, setIsRefining] = useState(false);
    const [isGeneratingChat, setIsGeneratingChat] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(true);
    const [isSnapMode, setIsSnapMode] = useState(true);
    const [measurePoints, setMeasurePoints] = useState<MeasurePoint[]>([]);
    const [tempMeasureDistance, setTempMeasureDistance] = useState<number | null>(null);
    const [showMeasureDialog, setShowMeasureDialog] = useState(false);
    const [activeTab, setActiveTab] = useState<'plants' | 'exterior' | 'custom'>('plants');
    const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
    const [showAISettings, setShowAISettings] = useState(false);

    // History
    const [history, setHistory] = useState<CanvasItem[][]>([[]]);
    const [historyIndex, setHistoryIndex] = useState(0);

    const recordHistory = useCallback((newItems: CanvasItem[]) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newItems);
        if (newHistory.length > 50) newHistory.shift();
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }, [history, historyIndex]);

    const undo = useCallback(() => {
        if (historyIndex > 0) {
            setItems(history[historyIndex - 1]);
            setHistoryIndex(historyIndex - 1);
        }
    }, [history, historyIndex]);

    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            setItems(history[historyIndex + 1]);
            setHistoryIndex(historyIndex + 1);
        }
    }, [history, historyIndex]);

    // Actions
    const addItem = useCallback((itemData: PlantData | ExteriorData | CustomAssetData, type: 'plant' | 'exterior' | 'custom_image', initialParams?: { x: number, y: number, w: number, h: number, points?: { x: number, y: number }[] }) => {
        let pixelWidth = 0, pixelHeight = 0, startX = 250, startY = 200;
        let points = initialParams?.points;

        if (initialParams) {
            pixelWidth = initialParams.w; pixelHeight = initialParams.h;
            startX = initialParams.x; startY = initialParams.y;
        } else {
            let wMeter = 1.0, hMeter = 1.0;
            if (type === 'plant') {
                const p = itemData as PlantData;
                wMeter = p.width || 1.0; hMeter = p.height || 1.0;
            } else if (type === 'exterior') {
                const e = itemData as ExteriorData;
                wMeter = e.defaultSize.w; hMeter = e.defaultSize.h;
            }
            pixelWidth = wMeter * pixelsPerMeter; pixelHeight = hMeter * pixelsPerMeter;
        }

        const newItem = {
            id: Date.now().toString(),
            type, x: startX, y: startY, width: pixelWidth, height: pixelHeight,
            rotation: 0, zIndex: items.length + 1, data: itemData, polygonPoints: points
        } as CanvasItem;
        const newItems = [...items, newItem];
        setItems(newItems);
        recordHistory(newItems);
        setSelectedId(newItem.id);
        setToolMode('select');
    }, [items, pixelsPerMeter, recordHistory]);

    const deleteItem = useCallback(() => {
        if (selectedId) {
            const newItems = items.filter(i => i.id !== selectedId);
            setItems(newItems);
            recordHistory(newItems);
            setSelectedId(null);
        }
    }, [selectedId, items, recordHistory]);

    const handleMoveLayer = useCallback((direction: 'up' | 'down') => {
        const idx = items.findIndex(i => i.id === selectedId);
        if (idx === -1) return;
        const newItems = [...items];
        const item = newItems.splice(idx, 1)[0];
        if (direction === 'up') newItems.push(item);
        else newItems.unshift(item);
        setItems(newItems);
        recordHistory(newItems);
    }, [items, selectedId, recordHistory]);

    const sendChatMessage = useCallback(async (text: string) => {
        const userMsg: ChatMessage = { role: 'user', text };
        const newMessages = [...chatMessages, userMsg];
        setChatMessages(newMessages);
        setIsGeneratingChat(true);

        try {
            const aiResponse = await chatWithGemini(newMessages);
            setChatMessages(prev => [...prev, { role: 'model', text: aiResponse }]);
        } catch (error) {
            console.error("Chat Error:", error);
            setChatMessages(prev => [...prev, { role: 'model', text: "すみません、エラーが発生しました。" }]);
        } finally {
            setIsGeneratingChat(false);
        }
    }, [chatMessages]);

    return (
        <AppContext.Provider value={{
            bgImage, setBgImage,
            items, setItems,
            selectedId, setSelectedId,
            scale, setScale,
            pixelsPerMeter, setPixelsPerMeter,
            season, setSeason,
            time, setTime,
            viewType, setViewType,
            buildingCategory, setBuildingCategory,
            buildingStyle, setBuildingStyle,
            buildingFloors, setBuildingFloors,
            customAssets, setCustomAssets,
            isGenerating, setIsGenerating,
            isDetectingBuilding, setIsDetectingBuilding,
            generatedImage, setGeneratedImage,
            toolMode, setToolMode,
            camera, setCamera,
            imageModel, setImageModel,
            chatMessages, setChatMessages,
            isRefining, setIsRefining,
            isGeneratingChat, setIsGeneratingChat,
            isChatOpen, setIsChatOpen,
            isSnapMode, setIsSnapMode,
            measurePoints, setMeasurePoints,
            tempMeasureDistance, setTempMeasureDistance,
            showMeasureDialog, setShowMeasureDialog,
            historyIndex, historyLength: history.length,
            recordHistory, undo, redo,
            addItem, deleteItem, handleMoveLayer,
            activeTab, setActiveTab,
            showApiKeyDialog, setShowApiKeyDialog,
            promptModel, setPromptModel,
            showAISettings, setShowAISettings,
            detectionModel, setDetectionModel
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useAppContext must be used within an AppProvider');
    return context;
};
