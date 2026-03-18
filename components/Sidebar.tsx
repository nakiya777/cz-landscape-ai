
import React, { useState, useMemo } from 'react';
import {
  Trees,
  Square,
  Box,
  Plus,
  HelpCircle,
  Save,
  FolderOpen,
  Wand2,
  KeyRound,
  Car,
  Armchair,
  Construction,
  Lightbulb,
  Footprints,
  LayoutGrid,
  Settings2
} from 'lucide-react';
import { PLANT_MASTER, EXTERIOR_CATEGORIES } from '../constants';
import { ExteriorCategory, Maker, CanvasItem } from '../types';
import { useAppContext } from '../context/AppContext';

interface SidebarProps {
  onUploadCustomAsset: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onShowHelp: () => void;
  onOpenApiKeySettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  onUploadCustomAsset, onShowHelp, onOpenApiKeySettings
}) => {
  const {
    activeTab, setActiveTab, addItem, customAssets,
    items, setItems, camera, setCamera, bgImage, setBgImage,
    pixelsPerMeter, setPixelsPerMeter, scale, setScale,
    selectedId, recordHistory,
    setShowAISettings
  } = useAppContext();

  const onSave = () => {
    const data = {
      items,
      camera,
      bgImage,
      pixelsPerMeter,
      scale,
      timestamp: Date.now()
    };
    localStorage.setItem('cz_landscape_project', JSON.stringify(data));
    alert('プロジェクトを保存しました。');
  };

  const onLoad = () => {
    const saved = localStorage.getItem('cz_landscape_project');
    if (!saved) {
      alert('保存されたデータが見つかりません。');
      return;
    }
    try {
      const data = JSON.parse(saved);
      if (data.items) setItems(data.items);
      if (data.camera) setCamera(data.camera);
      if (data.bgImage) setBgImage(data.bgImage);
      if (data.pixelsPerMeter) setPixelsPerMeter(data.pixelsPerMeter);
      if (data.scale) setScale(data.scale);
      alert('プロジェクトを読み込みました。');
    } catch (e) {
      console.error('Load Error:', e);
      alert('読み込みに失敗しました。');
    }
  };
  const assetInputRef = React.useRef<HTMLInputElement>(null);
  const [exteriorCategory, setExteriorCategory] = useState<ExteriorCategory>('all');

  const filteredExteriorItems = useMemo(() => {
    if (exteriorCategory === 'all') return EXTERIOR_CATEGORIES;
    return EXTERIOR_CATEGORIES.filter(item => item.category === exteriorCategory);
  }, [exteriorCategory]);

  const getMakerBadgeColor = (maker: Maker) => {
    switch (maker) {
      case 'LIXIL': return 'bg-orange-600 text-white';
      case 'YKKAP': return 'bg-sky-500 text-white';
      case 'Sankyo': return 'bg-red-600 text-white';
      default: return 'bg-neutral-600 text-neutral-300';
    }
  };

  const exteriorTabs = [
    { id: 'all', icon: LayoutGrid, label: 'すべて' },
    { id: 'carport', icon: Car, label: '車庫' },
    { id: 'deck', icon: Armchair, label: 'デッキ' },
    { id: 'fence', icon: Construction, label: '柵' },
    { id: 'light', icon: Lightbulb, label: '照明' },
    { id: 'paving', icon: Footprints, label: '床' },
  ] as const;

  return (
    <div className="w-80 bg-neutral-800 border-r border-neutral-700 flex flex-col shadow-xl z-20 h-full flex-shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-neutral-700">
        <h1 className="font-bold text-lg text-emerald-400 flex items-center justify-between">
          <span className="flex items-center gap-2"><Wand2 className="w-5 h-5" /> CZ Landscape</span>
          <div className="flex gap-2">
            <button onClick={() => setShowAISettings(true)} className="text-neutral-400 hover:text-emerald-400" title="AI設定"><Settings2 className="w-5 h-5" /></button>
            <button onClick={onOpenApiKeySettings} className="text-neutral-400 hover:text-white" title="APIキー設定"><KeyRound className="w-5 h-5" /></button>
            <button onClick={onShowHelp} className="text-neutral-400 hover:text-white" title="操作ヘルプ"><HelpCircle className="w-5 h-5" /></button>
          </div>
        </h1>
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button onClick={onSave} className="py-1.5 bg-neutral-700 hover:bg-neutral-600 rounded text-xs flex items-center justify-center gap-1 border border-neutral-600 text-white"><Save className="w-3 h-3" /> 保存</button>
          <button onClick={onLoad} className="py-1.5 bg-neutral-700 hover:bg-neutral-600 rounded text-xs flex items-center justify-center gap-1 border border-neutral-600 text-white"><FolderOpen className="w-3 h-3" /> 読込</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-700">
        <button onClick={() => setActiveTab('plants')} className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'plants' ? 'bg-neutral-700 text-white border-b-2 border-emerald-500' : 'text-neutral-400'}`}><Trees className="w-4 h-4" /> 植栽</button>
        <button onClick={() => setActiveTab('exterior')} className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'exterior' ? 'bg-neutral-700 text-white border-b-2 border-emerald-500' : 'text-neutral-400'}`}><Square className="w-4 h-4" /> エクステ</button>
        <button onClick={() => setActiveTab('custom')} className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'custom' ? 'bg-neutral-700 text-white border-b-2 border-emerald-500' : 'text-neutral-400'}`}><Box className="w-4 h-4" /> My素材</button>
      </div>

      {/* Filter Tabs for Exterior */}
      {activeTab === 'exterior' && (
        <div className="flex overflow-x-auto p-2 gap-1 border-b border-neutral-700 custom-scrollbar">
          {exteriorTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setExteriorCategory(tab.id as ExteriorCategory)}
              className={`flex-shrink-0 px-3 py-1.5 text-xs rounded-full flex items-center gap-1 transition-colors ${exteriorCategory === tab.id ? 'bg-blue-600 text-white' : 'bg-neutral-700 text-neutral-400 hover:text-white'}`}
            >
              <tab.icon className="w-3 h-3" /> {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        {activeTab === 'plants' && (
          <div className="grid grid-cols-2 gap-2">
            {PLANT_MASTER.map(plant => (
              <button key={plant.id} onClick={() => addItem(plant, 'plant')} className="flex flex-col items-center p-3 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-all border border-transparent hover:border-emerald-500 group text-left">
                <div className="w-8 h-8 rounded-full mb-2 shadow-lg group-hover:scale-110 transition-transform relative" style={{ backgroundColor: plant.color }}></div>
                <span className="text-xs font-bold text-neutral-200">{plant.name}</span>
                <span className="text-[10px] text-neutral-400">樹高{plant.height}m</span>
              </button>
            ))}
          </div>
        )}

        {activeTab === 'exterior' && (
          <div className="space-y-3">
            {filteredExteriorItems.map(ext => (
              <button key={ext.id} onClick={() => addItem(ext, 'exterior')} className="w-full flex items-center p-3 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-all border border-transparent hover:border-blue-500 relative overflow-hidden group">
                <span className="text-2xl mr-3">{ext.icon}</span>
                <div className="text-left flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide ${getMakerBadgeColor(ext.maker)}`}>{ext.maker}</span>
                  </div>
                  <span className="text-sm font-bold block text-neutral-200 truncate">{ext.name}</span>
                  <span className="text-[10px] text-neutral-400">幅 {ext.defaultSize.w}m × 奥行 {ext.defaultSize.h}m</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {activeTab === 'custom' && (
          <div className="space-y-4">
            <button onClick={() => assetInputRef.current?.click()} className="w-full py-4 border-2 border-dashed border-neutral-600 rounded-lg flex flex-col items-center justify-center text-neutral-400 hover:text-white hover:border-emerald-500 hover:bg-neutral-700/50 transition-all">
              <Plus className="w-6 h-6 mb-1" />
              <span className="text-xs">画像を追加 (PNG/JPG)</span>
            </button>
            <input type="file" ref={assetInputRef} onChange={onUploadCustomAsset} className="hidden" accept="image/*" />
            <div className="grid grid-cols-2 gap-2">
              {customAssets.map(asset => (
                <button key={asset.id} onClick={() => addItem(asset, 'custom_image')} className="flex flex-col items-center p-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg border border-transparent hover:border-emerald-500 relative group overflow-hidden">
                  <img src={asset.image} alt={asset.name} className="w-full h-16 object-contain mb-1 rounded" />
                  <span className="text-[10px] text-neutral-300 truncate w-full text-center">{asset.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedId && selectedId !== 'camera' && (
        <div className="p-4 border-t border-neutral-700 bg-neutral-900/50">
          <h3 className="text-xs font-bold text-neutral-400 mb-3 uppercase tracking-wider flex items-center gap-2">
            <LayoutGrid className="w-3 h-3" /> プロパティ
          </h3>
          {items.find(i => i.id === selectedId) && (() => {
            const item = items.find(i => i.id === selectedId)!;
            const updateItem = (updates: Partial<CanvasItem>) => {
              const newItems = items.map(i => i.id === selectedId ? { ...i, ...updates } : i);
              setItems(newItems);
              recordHistory(newItems);
            };

            return (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-500">位置 X (px)</label>
                  <input
                    type="number"
                    value={Math.round(item.x)}
                    onChange={(e) => updateItem({ x: Number(e.target.value) })}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs text-white focus:border-emerald-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-500">位置 Y (px)</label>
                  <input
                    type="number"
                    value={Math.round(item.y)}
                    onChange={(e) => updateItem({ y: Number(e.target.value) })}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs text-white focus:border-emerald-500 outline-none"
                  />
                </div>
                {!item.polygonPoints && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-500">幅 (px)</label>
                      <input
                        type="number"
                        value={Math.round(item.width)}
                        onChange={(e) => updateItem({ width: Math.max(1, Number(e.target.value)) })}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs text-white focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-500">奥行 (px)</label>
                      <input
                        type="number"
                        value={Math.round(item.height)}
                        onChange={(e) => updateItem({ height: Math.max(1, Number(e.target.value)) })}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs text-white focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </>
                )}
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] text-neutral-500">回転 (度)</label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={Math.round(item.rotation)}
                    onChange={(e) => updateItem({ rotation: Number(e.target.value) })}
                    className="w-full accent-emerald-500 h-1.5 mt-1"
                  />
                  <div className="flex justify-between text-[9px] text-neutral-600 mt-1 font-mono">
                    <span>0°</span>
                    <span className="text-neutral-400 font-bold">{Math.round(item.rotation)}°</span>
                    <span>360°</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      <div className="p-4 border-t border-neutral-700 bg-neutral-800/50 text-[10px] text-neutral-500 text-center italic">
        CZ Landscape v1.1.0
      </div>
    </div>
  );
};

export default Sidebar;
