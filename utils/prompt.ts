
import { CanvasItem, CameraState, Season, TimeOfDay, ViewType,
         BuildingMainCategory, BuildingFloors, PlantData, ExteriorData } from '../types';
import { BUILDING_TASTES } from '../constants';
import { calculateSpatialRelations, calculateVisibleBuildingFaces,
         getCompassDirection, SpatialRelation } from './spatial';

/** プロンプト生成の入力パラメータ */
export interface PromptGenerationInput {
    camera: CameraState | null;
    items: CanvasItem[];
    pixelsPerMeter: number;
    viewType: ViewType;
    season: Season;
    time: TimeOfDay;
    buildingCategory: BuildingMainCategory;
    buildingStyle: string;
    buildingFloors: BuildingFloors;
    isTextOnlyModel: boolean;
}

/**
 * アイテムのサイズに基づく説明プレフィックスを生成
 */
function getItemSizePrefix(item: CanvasItem, pixelsPerMeter: number): { prefix: string; description: string } {
    let description = item.data.en;
    let prefix = "";

    if (item.type === 'plant') {
        const actualWidth = item.width / pixelsPerMeter;
        if (actualWidth > 2.5) {
            prefix = "A magnificent large mature ";
            description = description.replace('tree', 'stately tree').replace('shrub', 'large dense shrub');
        } else if (actualWidth > 1.5) {
            prefix = "A well-established medium-sized ";
        } else {
            prefix = "A young ";
        }
    } else {
        prefix = "A precisely placed ";
    }

    return { prefix, description };
}

/**
 * 建物の説明文を生成
 */
function buildBuildingDescription(
    buildingCategory: BuildingMainCategory,
    buildingStyle: string,
    buildingFloors: BuildingFloors
): string | null {
    if (buildingCategory === 'none') return null;

    const tasteEntry = BUILDING_TASTES[buildingCategory as keyof typeof BUILDING_TASTES];
    if (!tasteEntry) return null;

    const styleObj = tasteEntry.styles.find((s: { id: string; prompt: string }) => s.id === buildingStyle);
    if (!styleObj) return null;

    const floorLabel = buildingFloors === '1'
        ? 'one-story bungalow'
        : `${buildingFloors}-story residential structure`;

    return `A ${floorLabel} in ${styleObj.prompt}`;
}

/**
 * 空間情報なしのフォールバック用アイテム説明を生成（従来互換）
 */
function describeFlatItems(items: CanvasItem[], pixelsPerMeter: number): string {
    return items.map(item => {
        const wM = (item.width / pixelsPerMeter).toFixed(1);
        const hM = (item.height / pixelsPerMeter).toFixed(1);
        const rot = Math.round(item.rotation);
        const { prefix, description } = getItemSizePrefix(item, pixelsPerMeter);
        const rotationInfo = rot !== 0 ? `, rotated exactly ${rot} degrees` : "";
        return `${prefix}${description} (scale: ${wM}m x ${hM}m${rotationInfo})`;
    }).join('. ');
}

/**
 * 深度レイヤーごとにグループ化した空間記述を生成
 */
function describeSpatialLayers(
    relations: SpatialRelation[],
    camera: CameraState,
    pixelsPerMeter: number,
    isTextOnlyModel: boolean
): string {
    /** レイヤーごとにグループ化 */
    const layers: Record<string, SpatialRelation[]> = {
        foreground: [],
        midground: [],
        background: [],
    };

    for (const rel of relations) {
        layers[rel.depthLayer].push(rel);
    }

    console.debug('[prompt] レイヤー分布: foreground=%d, midground=%d, background=%d',
        layers.foreground.length, layers.midground.length, layers.background.length);

    const parts: string[] = [];

    for (const [layerName, layerRelations] of Object.entries(layers)) {
        if (layerRelations.length === 0) continue;

        if (!isTextOnlyModel) {
            /** Gemini向け: 角括弧ヘッダ形式 */
            parts.push(`[${capitalize(layerName)}]`);
            for (const rel of layerRelations) {
                parts.push(formatSpatialItem(rel, camera, pixelsPerMeter, false));
            }
        } else {
            /** Imagen向け: 文章形式で詳細記述 */
            for (const rel of layerRelations) {
                parts.push(formatSpatialItem(rel, camera, pixelsPerMeter, true));
            }
        }
    }

    return parts.join('\n');
}

/**
 * 個別アイテムの空間記述を生成
 */
function formatSpatialItem(
    rel: SpatialRelation,
    camera: CameraState,
    pixelsPerMeter: number,
    verbose: boolean
): string {
    const item = rel.item;
    const wM = (item.width / pixelsPerMeter).toFixed(1);
    const hM = (item.height / pixelsPerMeter).toFixed(1);
    const { prefix, description } = getItemSizePrefix(item, pixelsPerMeter);

    /** 建物ポリゴンの可視面情報を取得 */
    let facesInfo = '';
    if (item.polygonPoints && item.polygonPoints.length >= 3) {
        const visibleFaces = calculateVisibleBuildingFaces(camera, item, pixelsPerMeter);
        if (visibleFaces.length > 0) {
            const faceDescs = visibleFaces.map(f => `${f.facingLabel} (${f.widthMeters}m wide)`);
            facesInfo = ` Visible faces: ${faceDescs.join(', ')}.`;
        }
    }

    if (verbose) {
        /** Imagen向け: 文章形式の詳細記述 */
        const layerLabel = rel.depthLayer === 'foreground' ? 'In the immediate foreground'
            : rel.depthLayer === 'midground' ? 'In the midground'
            : 'In the background';
        return `${layerLabel} (${rel.distanceMeters}m, ${rel.directionLabel}) is ${prefix.toLowerCase()}${description} (${wM}m x ${hM}m).${facesInfo}`;
    } else {
        /** Gemini向け: 箇条書き形式 */
        return `- ${rel.distanceMeters}m ahead, ${rel.directionLabel}: ${prefix}${description} (scale: ${wM}m x ${hM}m).${facesInfo}`;
    }
}

/**
 * 文字列の先頭を大文字に変換
 */
function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Imagen 3 向けのトークン数制限トランケーション
 * 最大トークン数を超える場合、最後の完全な文で切り詰める
 */
export function truncateForImagen(prompt: string, maxTokens: number = 480): string {
    const words = prompt.split(/\s+/);
    if (words.length <= maxTokens) return prompt;

    console.debug('[prompt] truncateForImagen: %d words -> %d max', words.length, maxTokens);

    /** 制限内で最後の完全な文を見つける */
    const truncated = words.slice(0, maxTokens).join(' ');
    const lastPeriod = truncated.lastIndexOf('.');
    if (lastPeriod > truncated.length * 0.7) {
        return truncated.substring(0, lastPeriod + 1);
    }
    return truncated + '...';
}

/**
 * プロンプトを自動生成する
 * カメラ情報がある場合は空間認識ベースの記述、ない場合は従来互換のフラット記述を使用
 */
export const generateAutoPrompt = (input: PromptGenerationInput): string => {
    const {
        camera, items, pixelsPerMeter, viewType, season, time,
        buildingCategory, buildingStyle, buildingFloors, isTextOnlyModel
    } = input;

    console.debug('[prompt] generateAutoPrompt: camera=%s, items=%d, isTextOnlyModel=%s',
        camera ? 'present' : 'null', items.length, isTextOnlyModel);

    /** 建物の説明を生成 */
    const buildingDesc = buildBuildingDescription(buildingCategory, buildingStyle, buildingFloors);
    const floorLabel = buildingFloors === '1' ? 'one-story bungalow' : `${buildingFloors}-story residential structure`;

    if (camera) {
        /** カメラあり: 空間認識ベースのプロンプト生成 */
        const cameraFacing = getCompassDirection(camera.rotation);
        const spatialRelations = calculateSpatialRelations(camera, items, pixelsPerMeter);

        console.debug('[prompt] カメラ方向: %s, 空間関係: %d件', cameraFacing, spatialRelations.length);

        if (isTextOnlyModel) {
            /** Imagen 3 向け: 詳細な文章形式 */
            const promptParts: string[] = [];

            if (buildingDesc) {
                promptParts.push(
                    `A highly detailed, photorealistic architectural render of a ${buildingCategory} ${floorLabel} exterior.`
                );
            } else {
                promptParts.push(
                    `A highly detailed, photorealistic landscape architectural render.`
                );
            }

            promptParts.push(
                `Viewing angle: ${viewType} perspective facing ${cameraFacing}, ${season} season, ${time === 'day' ? 'daytime' : time === 'sunset' ? 'golden hour sunset' : 'nighttime'} lighting.`
            );

            if (buildingDesc) {
                /** 建物がある場合、midgroundの建物アイテムを探して距離情報を追加 */
                const buildingRelation = spatialRelations.find(r => r.item.polygonPoints && r.item.polygonPoints.length >= 3);
                if (buildingRelation) {
                    const faces = calculateVisibleBuildingFaces(camera, buildingRelation.item, pixelsPerMeter);
                    const faceDesc = faces.length > 0
                        ? `, presenting its ${faces.map(f => `${f.facingLabel} (${f.widthMeters}m wide)`).join(' and ')}`
                        : '';
                    promptParts.push(
                        `The main building is ${buildingDesc} located ${buildingRelation.distanceMeters}m ${buildingRelation.directionLabel === 'center' ? 'straight ahead' : buildingRelation.directionLabel} in the ${buildingRelation.depthLayer}${faceDesc}.`
                    );
                } else {
                    promptParts.push(`The main building is ${buildingDesc}.`);
                }
            }

            /** 建物以外のアイテムを空間記述 */
            const nonBuildingRelations = spatialRelations.filter(r => !r.item.polygonPoints || r.item.polygonPoints.length < 3);
            if (nonBuildingRelations.length > 0) {
                const layerDesc = describeSpatialLayers(nonBuildingRelations, camera, pixelsPerMeter, true);
                promptParts.push(layerDesc);
            }

            const result = promptParts.join('\n');
            console.debug('[prompt] Imagen プロンプト生成完了 (トランケーション前): %d文字', result.length);
            return truncateForImagen(result);

        } else {
            /** Gemini 向け: 簡潔な構造化形式（参照画像あり） */
            const promptParts: string[] = [];

            promptParts.push(
                `A photorealistic architectural visualization render. The output must strictly match the spatial structure and layout of the provided reference image. Ignore any text labels in the reference image.`
            );

            promptParts.push(
                `Camera position: ${viewType}, facing ${cameraFacing}. Season: ${season}, Time: ${time}.`
            );

            if (buildingDesc) {
                promptParts.push(`Building: ${buildingDesc}.`);
            }

            /** 全アイテムを深度レイヤーで記述 */
            if (spatialRelations.length > 0) {
                const layerDesc = describeSpatialLayers(spatialRelations, camera, pixelsPerMeter, false);
                promptParts.push(layerDesc);
            }

            const result = promptParts.join('\n');
            console.debug('[prompt] Gemini プロンプト生成完了: %d文字', result.length);
            return result;
        }
    } else {
        /** カメラなし: 従来互換のフォールバック */
        console.debug('[prompt] カメラなし: フォールバックモード');

        const promptParts: string[] = [
            `A photorealistic architectural visualization render.`,
            `The output must strictly match the spatial structure and layout of the provided reference image.`,
            `Context: ${viewType} perspective, ${season} season, ${time} lighting environment.`
        ];

        if (buildingDesc) {
            promptParts.push(`Central Building: ${buildingDesc}. It must occupy the area marked on the plan.`);
        }

        const itemsDesc = describeFlatItems(items, pixelsPerMeter);
        if (itemsDesc) {
            promptParts.push(
                `Landscape Elements Detail: ${itemsDesc}. Each element should be rendered exactly within its corresponding footprint in the reference plan.`
            );
        }

        if (isTextOnlyModel) {
            return truncateForImagen(promptParts.join(' '));
        }

        return promptParts.join(' ');
    }
};
