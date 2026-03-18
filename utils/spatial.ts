import { CanvasItem, CameraState } from '../types';

/** 空間関係の計算結果 */
export interface SpatialRelation {
    item: CanvasItem;
    distanceMeters: number;
    relativeAngleDeg: number;
    directionLabel: string;
    depthLayer: 'foreground' | 'midground' | 'background';
    compassBearing: string;
}

/** 建物の可視面情報 */
export interface VisibleBuildingFace {
    edgeIndex: number;
    widthMeters: number;
    normalAngleDeg: number;
    facingLabel: string;
    dotProduct: number;
}

/** 定数 */
export const CAMERA_FOV_DEG = 60;

export const DEPTH_THRESHOLDS = {
    foreground: 3.0,
    midground: 10.0,
} as const;

export const DIRECTION_RANGES = [
    { min: -15,  max: 15,   label: 'center' },
    { min: -60,  max: -15,  label: 'front-left' },
    { min: 15,   max: 60,   label: 'front-right' },
    { min: -120, max: -60,  label: 'left' },
    { min: 60,   max: 120,  label: 'right' },
    { min: -180, max: -120, label: 'back-left' },
    { min: 120,  max: 180,  label: 'back-right' },
] as const;

/**
 * カメラからオブジェクト中心への距離（メートル）を計算
 */
export function calculateDistanceMeters(
    camera: CameraState, item: CanvasItem, pixelsPerMeter: number
): number {
    const itemCenterX = item.x + item.width / 2;
    const itemCenterY = item.y + item.height / 2;
    const dx = itemCenterX - camera.x;
    const dy = itemCenterY - camera.y;
    return Math.sqrt(dx * dx + dy * dy) / pixelsPerMeter;
}

/**
 * カメラ正面を0°とした相対角度を計算（-180~+180）
 * 正 = 右、負 = 左
 * 座標系: 0°=北(上)、時計回り、スクリーン座標Y下向き
 */
export function calculateRelativeAngle(
    camera: CameraState, item: CanvasItem
): number {
    const dx = (item.x + item.width / 2) - camera.x;
    const dy = (item.y + item.height / 2) - camera.y;
    // atan2(dx, -dy): スクリーン座標でY軸反転、0°=北
    const absoluteAngleDeg = Math.atan2(dx, -dy) * (180 / Math.PI);
    let relative = absoluteAngleDeg - camera.rotation;
    while (relative > 180) relative -= 360;
    while (relative < -180) relative += 360;
    return relative;
}

/**
 * 相対角度から方向ラベルを取得
 */
export function getDirectionLabel(angleOffsetDeg: number): string {
    for (const range of DIRECTION_RANGES) {
        if (angleOffsetDeg >= range.min && angleOffsetDeg < range.max) {
            return range.label;
        }
    }
    return 'behind';
}

/**
 * 距離から深度レイヤーを判定
 */
export function getDepthLayer(distanceM: number): 'foreground' | 'midground' | 'background' {
    if (distanceM <= DEPTH_THRESHOLDS.foreground) return 'foreground';
    if (distanceM <= DEPTH_THRESHOLDS.midground) return 'midground';
    return 'background';
}

/**
 * 絶対角度からコンパス方向を取得（8方位）
 */
export function getCompassDirection(angleDeg: number): string {
    const normalized = ((angleDeg % 360) + 360) % 360;
    const directions = ['north', 'north-east', 'east', 'south-east',
                        'south', 'south-west', 'west', 'north-west'];
    const index = Math.round(normalized / 45) % 8;
    return directions[index];
}

/**
 * 全アイテムの空間関係をまとめて計算
 * 距離順（手前→奥）にソートして返す
 */
export function calculateSpatialRelations(
    camera: CameraState, items: CanvasItem[], pixelsPerMeter: number
): SpatialRelation[] {
    console.debug('[spatial] calculateSpatialRelations: アイテム数:', items.length);
    return items.map(item => {
        const distanceMeters = calculateDistanceMeters(camera, item, pixelsPerMeter);
        const relativeAngleDeg = calculateRelativeAngle(camera, item);
        const relation: SpatialRelation = {
            item,
            distanceMeters: Math.round(distanceMeters * 10) / 10,
            relativeAngleDeg: Math.round(relativeAngleDeg),
            directionLabel: getDirectionLabel(relativeAngleDeg),
            depthLayer: getDepthLayer(distanceMeters),
            compassBearing: getCompassDirection(
                Math.atan2(
                    (item.x + item.width / 2) - camera.x,
                    -((item.y + item.height / 2) - camera.y)
                ) * (180 / Math.PI)
            ),
        };
        console.debug(`[spatial] ${item.data.en}: ${relation.distanceMeters}m, ${relation.directionLabel}, ${relation.depthLayer}`);
        return relation;
    }).sort((a, b) => a.distanceMeters - b.distanceMeters);
}

/**
 * 建物ポリゴンの各辺について、カメラから見える面を判定する
 * 前提: 頂点は時計回り（スクリーン座標系）、矩形以外も許容
 */
export function calculateVisibleBuildingFaces(
    camera: CameraState, item: CanvasItem, pixelsPerMeter: number
): VisibleBuildingFace[] {
    const points = item.polygonPoints;
    if (!points || points.length < 3) return [];

    console.debug('[spatial] calculateVisibleBuildingFaces: ポリゴン頂点数:', points.length);
    const faces: VisibleBuildingFace[] = [];

    for (let i = 0; i < points.length; i++) {
        const p1 = points[i];
        const p2 = points[(i + 1) % points.length];

        // ワールド座標に変換
        const wp1 = { x: item.x + p1.x, y: item.y + p1.y };
        const wp2 = { x: item.x + p2.x, y: item.y + p2.y };

        // 辺ベクトル
        const edgeX = wp2.x - wp1.x;
        const edgeY = wp2.y - wp1.y;

        // 外向き法線（時計回り、スクリーン座標）
        const normalX = edgeY;
        const normalY = -edgeX;

        // 辺の中点
        const midX = (wp1.x + wp2.x) / 2;
        const midY = (wp1.y + wp2.y) / 2;

        // カメラから中点への視線ベクトル
        const viewX = midX - camera.x;
        const viewY = midY - camera.y;

        // 内積: 負ならカメラに向いている
        const dot = normalX * viewX + normalY * viewY;

        if (dot < 0) {
            const edgeLengthPx = Math.sqrt(edgeX * edgeX + edgeY * edgeY);
            const widthMeters = Math.round((edgeLengthPx / pixelsPerMeter) * 10) / 10;
            const normalAngleDeg = Math.atan2(normalX, -normalY) * (180 / Math.PI);
            const facingDirection = getCompassDirection(normalAngleDeg + 180);

            const face: VisibleBuildingFace = {
                edgeIndex: i,
                widthMeters,
                normalAngleDeg: Math.round(normalAngleDeg),
                facingLabel: `${facingDirection}-facing wall`,
                dotProduct: Math.round(dot * 100) / 100,
            };
            console.debug(`[spatial] 可視面[${i}]: ${face.facingLabel} (${face.widthMeters}m)`);
            faces.push(face);
        }
    }

    console.debug(`[spatial] 可視面数: ${faces.length}/${points.length}`);
    return faces;
}
