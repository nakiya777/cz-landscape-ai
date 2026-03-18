
import { CanvasItem, CameraState, CustomAssetData } from '../types';
import { calculateVisibleBuildingFaces, CAMERA_FOV_DEG } from './spatial';

/**
 * Calculates the closest point on a line segment to a given point.
 */
export const getClosestPointOnSegment = (
  p: { x: number; y: number },
  a: { x: number; y: number },
  b: { x: number; y: number }
) => {
  const atob = { x: b.x - a.x, y: b.y - a.y };
  const atop = { x: p.x - a.x, y: p.y - a.y };
  const lenSq = atob.x * atob.x + atob.y * atob.y;
  if (lenSq === 0) return a;
  let t = Math.max(0, Math.min(1, (atop.x * atob.x + atop.y * atob.y) / lenSq));
  return { x: a.x + atob.x * t, y: a.y + atob.y * t };
};

/**
 * Renders the current scene to a Base64 encoded PNG string.
 */
export const renderSceneToBase64 = async (
  bgImage: string | null,
  items: CanvasItem[],
  pixelsPerMeter: number,
  width: number,
  height: number,
  camera?: CameraState | null,
  annotate?: boolean
): Promise<string | null> => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // カスタム画像をプリロード（並列化でパフォーマンス向上）
  const imageCache = new Map<string, HTMLImageElement>();
  const customImageItems = items.filter(item => item.type === 'custom_image');
  if (customImageItems.length > 0) {
    console.debug(`[canvas] カスタム画像 ${customImageItems.length} 件を並列プリロード開始`);
    const preloadPromises = customImageItems.map(item => new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        imageCache.set(item.id, img);
        console.debug(`[canvas] 画像プリロード完了: ${item.id}`);
        resolve();
      };
      img.onerror = () => {
        console.error(`[canvas] 画像プリロード失敗: ${item.id}`);
        resolve();
      };
      img.src = (item.data as CustomAssetData).image;
    }));
    await Promise.all(preloadPromises);
    console.debug(`[canvas] 全カスタム画像のプリロード完了 (${imageCache.size}/${customImageItems.length} 成功)`);
  }

  if (bgImage) {
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, width, height);
        resolve();
      };
      img.src = bgImage;
    });
  } else {
    ctx.fillStyle = '#171717';
    ctx.fillRect(0, 0, width, height);
  }

  for (const item of items) {
    ctx.save();
    const cx = item.x + item.width / 2;
    const cy = item.y + item.height / 2;
    ctx.translate(cx, cy);
    ctx.rotate((item.rotation * Math.PI) / 180);
    ctx.translate(-item.width / 2, -item.height / 2);

    if (item.polygonPoints) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      item.polygonPoints.forEach((pt, i) =>
        i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)
      );
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (item.type === 'plant') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(item.width / 2, item.height / 2, item.width / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (item.type === 'exterior') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fillRect(0, 0, item.width, item.height);
      ctx.strokeRect(0, 0, item.width, item.height);
    } else if (item.type === 'custom_image') {
      // プリロード済みキャッシュから同期的に描画（z-order維持）
      const cachedImg = imageCache.get(item.id);
      if (cachedImg) {
        ctx.drawImage(cachedImg, 0, 0, item.width, item.height);
      } else {
        console.debug(`[canvas] キャッシュミス（プリロード失敗）: ${item.id}`);
      }
    }
    ctx.restore();
  }

  // アノテーション描画パス
  if (annotate) {
    console.debug('[canvas] アノテーション描画開始');

    // 各アイテムにラベルを描画
    for (const item of items) {
      const cx = item.x + item.width / 2;
      const cy = item.y + item.height; // アイテム下部

      ctx.save();
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';

      // 半透明背景
      const label = item.data.en;
      const textMetrics = ctx.measureText(label);
      const bgWidth = textMetrics.width + 6;
      const bgHeight = 14;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(cx - bgWidth / 2, cy + 2, bgWidth, bgHeight);

      // 白文字ラベル
      ctx.fillStyle = '#ffffff';
      ctx.fillText(label, cx, cy + 13);
      ctx.restore();
    }

    // カメラ位置と視野角を描画
    if (camera) {
      ctx.save();

      // カメラアイコン（小さい丸）
      ctx.fillStyle = 'rgba(255, 200, 0, 0.8)';
      ctx.beginPath();
      ctx.arc(camera.x, camera.y, 6, 0, Math.PI * 2);
      ctx.fill();

      // CAMラベル
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('CAM', camera.x, camera.y - 10);

      // 視野角の扇形を描画
      // カメラ回転: 0°=北(上), 時計回り → Canvas: 0°=右, 反時計回り
      // 変換: canvasAngle = (rotation - 90) * PI / 180
      const fovRad = (CAMERA_FOV_DEG / 2) * (Math.PI / 180);
      const cameraAngleRad = ((camera.rotation - 90) * Math.PI) / 180;
      const fovLength = 80; // 視野線の長さ（ピクセル）

      ctx.strokeStyle = 'rgba(255, 200, 0, 0.4)';
      ctx.fillStyle = 'rgba(255, 200, 0, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(camera.x, camera.y);
      ctx.arc(camera.x, camera.y, fovLength, cameraAngleRad - fovRad, cameraAngleRad + fovRad);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }

    // 建物ポリゴンの可視面をハイライト
    if (camera) {
      for (const item of items) {
        if (!item.polygonPoints || item.polygonPoints.length < 3) continue;

        const visibleFaces = calculateVisibleBuildingFaces(camera, item, pixelsPerMeter);
        for (const face of visibleFaces) {
          const p1 = item.polygonPoints[face.edgeIndex];
          const p2 = item.polygonPoints[(face.edgeIndex + 1) % item.polygonPoints.length];

          ctx.save();
          ctx.strokeStyle = 'rgba(0, 200, 255, 0.8)'; // 水色
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(item.x + p1.x, item.y + p1.y);
          ctx.lineTo(item.x + p2.x, item.y + p2.y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    console.debug('[canvas] アノテーション描画完了');
  }

  return canvas.toDataURL('image/png');
};
