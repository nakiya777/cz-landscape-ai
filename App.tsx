
import React, { useState, useRef, useEffect } from 'react';
import { PlusCircle, RotateCw, ImageIcon, Maximize, Camera as CameraIcon } from 'lucide-react';

import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';
import MeasureDialog from './components/Dialogs/MeasureDialog';
import PromptDialog from './components/Dialogs/PromptDialog';
import ResultDialog from './components/Dialogs/ResultDialog';
import ApiKeyDialog from './components/Dialogs/ApiKeyDialog';
import AISettingsDialog from './components/Dialogs/AISettingsDialog';

import { generateImageResponse, refinePrompt, detectBuildingArea } from './services/geminiService';
import { useHistory } from './hooks/useHistory';
import { useCanvasInteraction } from './hooks/useCanvasInteraction';
import ChatSidebar from './components/ChatSidebar';
import { renderSceneToBase64 } from './utils/canvas';
import { generateAutoPrompt } from './utils/prompt';
import { useAppContext } from './context/AppContext';

import {
  CanvasItem, CameraState, PlantData, ExteriorData, CustomAssetData,
  MeasurePoint, Season, TimeOfDay, ViewType, ImageModelType,
  BuildingMainCategory, BuildingFloors
} from './types';
import { EXTERIOR_CATEGORIES } from './constants';

export default function App() {
  const {
    bgImage, setBgImage, items, setItems, selectedId, setSelectedId,
    scale, setScale, pixelsPerMeter, setPixelsPerMeter, season, setSeason,
    time, setTime, viewType, setViewType, buildingCategory, setBuildingCategory,
    buildingStyle, setBuildingStyle, buildingFloors, setBuildingFloors,
    customAssets, setCustomAssets, isGenerating, setIsGenerating,
    isDetectingBuilding, setIsDetectingBuilding, generatedImage, setGeneratedImage,
    toolMode, setToolMode, camera, setCamera, imageModel, setImageModel,
    isRefining, setIsRefining, measurePoints, setMeasurePoints,
    tempMeasureDistance, setTempMeasureDistance, showMeasureDialog, setShowMeasureDialog,
    recordHistory, undo, redo, historyIndex, historyLength,
    isChatOpen, activeTab, setActiveTab,
    showApiKeyDialog, setShowApiKeyDialog,
    showAISettings, setShowAISettings,
    detectionModel,
    addItem, deleteItem, handleMoveLayer
  } = useAppContext();

  const [showPromptDialog, setShowPromptDialog] = useState(false);
  const [finalPrompt, setFinalPrompt] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  // --- Refs ---
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const measureInputRef = useRef<HTMLInputElement>(null);

  // --- Hooks ---
  const {
    isDragging, hoveredEdge, handleCanvasClick, handleMouseDownItem,
    handleCanvasMouseMove, handleMouseUpGlobal, handleAddVertex
  } = useCanvasInteraction({ canvasRef });

  // --- Effects ---
  useEffect(() => {
    if (showPromptDialog) {
      const prompt = generateAutoPrompt(
        viewType, season, time, buildingCategory, buildingStyle,
        buildingFloors, items, pixelsPerMeter
      );
      setFinalPrompt(prompt);
    }
  }, [showPromptDialog, viewType, season, time, buildingCategory, buildingStyle, buildingFloors, items, pixelsPerMeter]);

  // --- Handlers ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBgImage(event.target?.result as string);
        setPixelsPerMeter(50);
        setItems([]);
        setCamera(null);
        setMeasurePoints([]);
        recordHistory([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCustomAssetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const newAsset: CustomAssetData = {
          id: Date.now().toString(),
          name: file.name,
          image: base64,
          en: `Custom asset image: ${file.name}`
        };
        setCustomAssets(prev => [...prev, newAsset]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApiKeyError = () => {
    if ((window as any).aistudio?.openSelectKey) {
      (window as any).aistudio.openSelectKey();
    } else {
      setShowApiKeyDialog(true);
      alert("APIキーが無効、または未設定です。設定画面を開きます。");
    }
  };

  const handleDetectBuilding = async () => {
    if (!bgImage) return;
    setIsDetectingBuilding(true);
    try {
      const result = await detectBuildingArea(bgImage, detectionModel);
      console.log('[Building Detection] API Result:', result);
      if (result) {
        const imgEl = canvasRef.current?.querySelector('img') as HTMLImageElement | null;
        if (!imgEl) return;

        console.log('[Building Detection] Image element:', {
          naturalWidth: imgEl.naturalWidth,
          naturalHeight: imgEl.naturalHeight,
          offsetWidth: imgEl.offsetWidth,
          offsetHeight: imgEl.offsetHeight,
          offsetLeft: imgEl.offsetLeft,
          offsetTop: imgEl.offsetTop
        });

        // Calculate actual displayed image dimensions within object-contain
        const imgAspect = imgEl.naturalWidth / imgEl.naturalHeight;
        const boxAspect = imgEl.offsetWidth / imgEl.offsetHeight;
        let renderW, renderH, offsetX, offsetY;

        if (boxAspect > imgAspect) {
          // Box is wider than image (Pillarbox)
          renderH = imgEl.offsetHeight;
          renderW = renderH * imgAspect;
          offsetX = (imgEl.offsetWidth - renderW) / 2;
          offsetY = 0;
        } else {
          // Box is taller than image (Letterbox)
          renderW = imgEl.offsetWidth;
          renderH = renderW / imgAspect;
          offsetX = 0;
          offsetY = (imgEl.offsetHeight - renderH) / 2;
        }

        const x = imgEl.offsetLeft + offsetX + (result.x / 100) * renderW;
        const y = imgEl.offsetTop + offsetY + (result.y / 100) * renderH;
        const w = (result.width / 100) * renderW;
        const h = (result.height / 100) * renderH;

        console.log('[Building Detection] Calculated coordinates:', { x, y, w, h, renderW, renderH, offsetX, offsetY });

        const points = [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: h }, { x: 0, y: h }];
        const buildingItemDef = EXTERIOR_CATEGORIES.find(i => i.id === 'building_mass');
        if (buildingItemDef) addItem(buildingItemDef, 'exterior', { x, y, w, h, points });
      } else { alert("建物を検出できませんでした。"); }
    } catch (e: any) {
      if (e.message === "API_KEY_ERROR") handleApiKeyError();
    } finally { setIsDetectingBuilding(false); }
  };

  const handleToggleCamera = () => {
    if (camera) setCamera(null);
    else setCamera({ x: 400, y: 300, rotation: 180 });
  };

  const handleOpenApiKeySettings = () => {
    if ((window as any).aistudio?.openSelectKey) {
      (window as any).aistudio.openSelectKey();
    } else {
      setShowApiKeyDialog(true);
    }
  };

  const startActualGeneration = async () => {
    setShowPromptDialog(false); setIsGenerating(true);
    try {
      const aistudio = (window as any).aistudio;
      if (imageModel === 'gemini-3-pro-image-preview') {
        if (aistudio && !await aistudio.hasSelectedApiKey()) { await aistudio.openSelectKey(); }
      }
      const refImage = await renderSceneToBase64(bgImage, items, pixelsPerMeter, 1024, 768);
      const base64Image = await generateImageResponse(finalPrompt, refImage, imageModel);
      if (base64Image) setGeneratedImage(base64Image); else alert("画像生成失敗");
    } catch (e: any) {
      if (e.message === "API_KEY_ERROR") handleApiKeyError();
      else alert("エラーが発生しました。");
    } finally { setIsGenerating(false); }
  }

  const handleRefinePrompt = async () => {
    setIsRefining(true);
    try {
      const refined = await refinePrompt(finalPrompt);
      setFinalPrompt(refined);
    } catch (e: any) {
      if (e.message === "API_KEY_ERROR") handleApiKeyError();
    } finally { setIsRefining(false); }
  };

  return (
    <div className="flex h-screen bg-neutral-900 text-neutral-100 font-sans overflow-hidden"
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleMouseUpGlobal}
      onMouseLeave={handleMouseUpGlobal}
    >
      <Sidebar
        onUploadCustomAsset={() => fileInputRef.current?.click()}
        onShowHelp={() => setShowHelp(true)}
        onOpenApiKeySettings={handleOpenApiKeySettings}
      />

      <div className="flex-1 flex flex-col bg-neutral-900 relative">
        <Toolbar
          onUploadImage={() => fileInputRef.current?.click()}
          onToggleMeasureMode={() => setToolMode(toolMode === 'measure' ? 'select' : 'measure')}
          onDetectBuilding={handleDetectBuilding}
          onToggleCamera={handleToggleCamera}
          onOpenPromptDialog={() => setShowPromptDialog(true)}
        />
        <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />

        <div className="flex-1 flex relative overflow-hidden">
          <main className="flex-1 overflow-hidden relative flex items-center justify-center p-8 bg-neutral-900">
            <div ref={canvasRef} onClick={handleCanvasClick} className={`relative shadow-2xl transition-all ${!bgImage ? 'w-[600px] h-[400px] border-2 border-dashed border-neutral-600 flex items-center justify-center bg-neutral-800/50' : ''}`} style={{ transform: `scale(${scale})` }}>
              {bgImage ? (
                <>
                  <img src={bgImage} className="max-h-[80vh] max-w-[80vw] object-contain pointer-events-none select-none" draggable={false} alt="Site plan" />
                  {measurePoints.map((p, i) => <div key={i} className="absolute w-2 h-2 bg-yellow-400 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg ring-1 ring-black" style={{ left: p.x, top: p.y }}></div>)}
                  {items.map(item => (
                    <div key={item.id}
                      onMouseDown={(e) => handleMouseDownItem(e, item, 'move')}
                      onClick={(e) => e.stopPropagation()}
                      className={`absolute group select-none ${selectedId === item.id ? 'z-50' : ''}`}
                      style={{ left: item.x, top: item.y, width: item.width, height: item.height, transform: `rotate(${item.rotation}deg)`, zIndex: item.zIndex, cursor: toolMode === 'measure' ? 'crosshair' : 'grab' }}
                    >
                      {item.polygonPoints ? (
                        <div className="w-full h-full relative" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => handleMouseDownItem(e, item, 'move')}>
                          <svg width={item.width} height={item.height} className="overflow-visible pointer-events-none">
                            <polygon points={item.polygonPoints.map(p => `${p.x},${p.y}`).join(' ')} fill={(item.data as ExteriorData).category === 'building' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(59, 130, 246, 0.2)'} stroke={(item.data as ExteriorData).category === 'building' ? 'white' : '#60A5FA'} strokeWidth="2" className="pointer-events-auto cursor-move" onMouseDown={(e) => handleMouseDownItem(e, item, 'move')} />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xl">{(item.data as ExteriorData).icon}</div>
                          {selectedId === item.id && item.polygonPoints.map((pt, idx) => (
                            <div key={idx}
                              className="absolute w-4 h-4 bg-white border-2 border-blue-600 rounded-full cursor-move z-[70] hover:scale-125 transition-transform"
                              style={{ left: pt.x, top: pt.y, transform: 'translate(-50%, -50%)' }}
                              onMouseDown={(e) => handleMouseDownItem(e, item, 'vertex-move', idx)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          ))}
                          {selectedId === item.id && hoveredEdge && (
                            <div className="absolute w-5 h-5 bg-emerald-500 text-white rounded-full cursor-copy z-[60] flex items-center justify-center shadow-lg hover:scale-125 transition-transform"
                              style={{ left: hoveredEdge.x, top: hoveredEdge.y, transform: 'translate(-50%, -50%)' }}
                              onMouseDown={(e) => handleAddVertex(e, item, hoveredEdge.index, hoveredEdge.x, hoveredEdge.y)}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <PlusCircle className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center transition-all overflow-hidden ${(item.data as ExteriorData).category === 'building' ? 'border-2 border-dashed border-white/50 bg-white/40' : (item.type === 'plant' ? 'rounded-full opacity-80 border border-white/20' : (item.type === 'custom_image' ? 'border border-blue-400/50' : 'border-2 border-blue-400 bg-blue-500/20'))} ${selectedId === item.id ? 'ring-2 ring-blue-400' : ''}`} style={item.type === 'plant' ? { backgroundColor: (item.data as PlantData).color } : {}}>
                          {item.type === 'exterior' && <span className="text-xl">{(item.data as ExteriorData).icon}</span>}
                          {item.type === 'custom_image' && <img src={(item.data as CustomAssetData).image} className="w-full h-full object-contain pointer-events-none" alt={item.data.name} />}
                        </div>
                      )}
                      {selectedId === item.id && (
                        <>
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 bg-white text-blue-600 rounded-full shadow-lg flex items-center justify-center cursor-ew-resize z-[80]"
                            onMouseDown={(e) => handleMouseDownItem(e, item, 'rotate')}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <RotateCw className="w-3 h-3" />
                          </div>
                          {!item.polygonPoints && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white border-2 border-blue-500 rounded-sm cursor-nwse-resize z-[80]"
                              onMouseDown={(e) => handleMouseDownItem(e, item, 'resize')}
                              onClick={(e) => e.stopPropagation()}
                            />
                          )}
                        </>
                      )}
                    </div>
                  ))}
                  {camera && (
                    <div onMouseDown={(e) => handleMouseDownItem(e, 'camera', 'camera-move')}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute z-[100] cursor-move"
                      style={{ left: camera.x, top: camera.y, transform: `translate(-50%, -50%) rotate(${camera.rotation}deg)`, width: 100, height: 100 }}
                    >
                      <div className="absolute bottom-1/2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[30px] border-r-[30px] border-t-[80px] border-l-transparent border-r-transparent border-t-yellow-400/30"></div>
                      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg border-2 ${selectedId === 'camera' ? 'border-yellow-400 scale-110' : 'border-white'}`}><CameraIcon className="w-5 h-5 transform rotate-180" /></div>
                      {selectedId === 'camera' && (
                        <div className="absolute -top-[40px] left-1/2 -translate-x-1/2 w-6 h-6 bg-white text-indigo-600 rounded-full flex items-center justify-center cursor-ew-resize z-[101]"
                          onMouseDown={(e) => handleMouseDownItem(e, 'camera', 'camera-rotate')}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <RotateCw className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (<div className="text-center text-neutral-500"><ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" /><p>敷地図をアップロード</p></div>)}
            </div>
            <div className="absolute bottom-4 right-4 flex gap-2 bg-neutral-800 p-1 rounded-lg border border-neutral-700 z-20 shadow-xl">
              <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="p-2 hover:bg-neutral-700 rounded transition-colors">-</button>
              <span className="py-2 px-2 text-sm text-neutral-300 min-w-[3rem] text-center">{Math.round(scale * 100)}%</span>
              <button onClick={() => setScale(s => Math.min(2.0, s + 0.1))} className="p-2 hover:bg-neutral-700 rounded transition-colors">+</button>
              <button onClick={() => setScale(1.0)} className="p-2 border-l border-neutral-600 hover:bg-neutral-700 rounded-r transition-colors"><Maximize className="w-4 h-4" /></button>
            </div>
          </main>
          {isChatOpen && <ChatSidebar />}
        </div>
      </div>

      {showPromptDialog && (
        <PromptDialog
          imageModel={imageModel} setImageModel={setImageModel}
          season={season} setSeason={setSeason}
          time={time} setTime={setTime}
          viewType={viewType} setViewType={setViewType}
          buildingCategory={buildingCategory} setBuildingCategory={setBuildingCategory}
          buildingStyle={buildingStyle} setBuildingStyle={setBuildingStyle}
          buildingFloors={buildingFloors} setBuildingFloors={setBuildingFloors}
          finalPrompt={finalPrompt} setFinalPrompt={setFinalPrompt}
          isRefining={isRefining}
          onRefine={handleRefinePrompt}
          onStartGeneration={startActualGeneration}
          onClose={() => setShowPromptDialog(false)}
        />
      )}

      {showMeasureDialog && (
        <MeasureDialog
          measureInputRef={measureInputRef}
          tempMeasureDistance={tempMeasureDistance}
          onClose={() => { setShowMeasureDialog(false); setMeasurePoints([]); }}
          onConfirm={(val) => {
            if (val > 0 && tempMeasureDistance) setPixelsPerMeter(tempMeasureDistance / val);
            setShowMeasureDialog(false); setMeasurePoints([]);
          }}
        />
      )}

      {generatedImage && (
        <ResultDialog
          generatedImage={generatedImage}
          onClose={() => setGeneratedImage(null)}
          onSave={() => {
            const l = document.createElement('a');
            l.href = generatedImage!;
            l.download = `render_${Date.now()}.png`;
            l.click();
          }}
        />
      )}

      {showHelp && (
        <div className="absolute inset-0 z-[600] bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowHelp(false)}>
          <div className="bg-neutral-800 p-8 rounded-xl max-w-lg w-full border border-neutral-700 relative shadow-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowHelp(false)} className="absolute top-4 right-4 text-neutral-400 hover:text-white">X</button>
            <h2 className="text-2xl font-bold text-white mb-6 text-emerald-400">操作ガイド</h2>
            <div className="space-y-4 text-sm text-neutral-200">
              <p className="bg-neutral-700/50 p-3 rounded border border-neutral-600"><strong className="text-white block mb-1">■ 基本操作</strong>ドラッグで移動、回転ハンドルで向きを調整。敷地図をアップロードして開始。</p>
              <p className="bg-neutral-700/50 p-3 rounded border border-neutral-600"><strong className="text-white block mb-1">■ 頂点の操作</strong>建物などを選択すると頂点（○）が表示され、個別に変形できます。辺の上の「＋」で頂点を追加できます。</p>
            </div>
            <button onClick={() => setShowHelp(false)} className="mt-8 w-full py-3 bg-emerald-600 text-white rounded font-bold shadow-lg">準備完了</button>
          </div>
        </div>
      )}


      {showAISettings && <AISettingsDialog onClose={() => setShowAISettings(false)} />}
      <ApiKeyDialog />
    </div>
  );
}
