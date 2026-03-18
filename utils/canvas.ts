
import { CanvasItem, CustomAssetData } from '../types';

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
  height: number
): Promise<string | null> => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

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
      const img = new Image();
      await new Promise<void>((r) => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0, item.width, item.height);
          r();
        };
        img.onerror = () => r();
        img.src = (item.data as CustomAssetData).image;
      });
    }
    ctx.restore();
  }
  return canvas.toDataURL('image/png');
};
