
import { LucideIcon } from 'lucide-react';

export type ItemType = 'plant' | 'exterior' | 'custom_image';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type TimeOfDay = 'day' | 'sunset' | 'night';
export type ViewType = 'eye-level' | 'aerial' | 'front';
export type ToolMode = 'select' | 'measure';
export type ImageModelType =
  | 'gemini-3-flash-preview'         // Gemini 3 Flash (2025年12月 最新・高速)
  | 'gemini-3-pro-preview'           // Gemini 3 Pro (2025年11月 高精度)
  | 'gemini-3-pro-image-preview'     // Gemini 3 Pro Image (画像生成特化)
  | 'gemini-2.0-flash-exp'           // Gemini 2.0 Flash (レガシー)
  | 'imagen-3.0-generate-002';       // Imagen 3 (Nano Banana PRO)

export type ExteriorCategory = 'all' | 'carport' | 'deck' | 'fence' | 'light' | 'paving' | 'building';
export type Maker = 'LIXIL' | 'YKKAP' | 'Sankyo' | 'Generic';

export type BuildingMainCategory = 'none' | 'japanese' | 'western' | 'modern';
export type BuildingFloors = '1' | '2' | '3';

// Add Window interface extension for AI Studio
declare global {
  interface Window {
    aistudio?: {
      getApiKey: () => string | null;
      openSelectKey: () => void;
    };
  }
}

export interface PlantData {
  id: string;
  name: string;
  en: string;
  type: 'tree' | 'shrub';
  color: string;
  height: number;
  width: number;
}

export interface ExteriorData {
  id: string;
  name: string;
  en: string;
  icon: string; // Emoji char
  defaultSize: { w: number; h: number };
  category: ExteriorCategory;
  maker: Maker;
}

export interface CustomAssetData {
  id: string;
  name: string;
  image: string; // Base64
  en: string;
}

export interface BaseCanvasItem {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  polygonPoints?: { x: number; y: number }[];
}

export interface PlantCanvasItem extends BaseCanvasItem {
  type: 'plant';
  data: PlantData;
}

export interface ExteriorCanvasItem extends BaseCanvasItem {
  type: 'exterior';
  data: ExteriorData;
}

export interface CustomImageCanvasItem extends BaseCanvasItem {
  type: 'custom_image';
  data: CustomAssetData;
}

export type CanvasItem = PlantCanvasItem | ExteriorCanvasItem | CustomImageCanvasItem;

export interface CameraState {
  x: number;
  y: number;
  rotation: number;
  zIndex?: number; // Added optional for camera
}

export interface MeasurePoint {
  x: number;
  y: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'model';
  text: string;
}

export interface ProjectData {
  bgImage: string | null;
  items: CanvasItem[];
  camera: CameraState | null;
  pixelsPerMeter: number;
  season: Season;
  time: TimeOfDay;
  customAssets: CustomAssetData[];
  buildingTaste?: {
    category: BuildingMainCategory;
    styleId: string;
    floors: BuildingFloors;
  };
  savedAt: string;
}
