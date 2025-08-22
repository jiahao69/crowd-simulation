import type { PlayAreaPoint } from "../types/play-area";

/**
 * 计算多边形的中点
 * @param points 多边形各个定点坐标
 * @returns 多边形的中点坐标
 */
export function calculatePolygonCenter(points: PlayAreaPoint[]) {
  const sumX = points.reduce((sum, p) => sum + p.Point.X, 0);
  const sumY = points.reduce((sum, p) => sum + p.Point.Y, 0);

  return {
    x: sumX / points.length,
    y: sumY / points.length,
  };
}

/**
 * 计算多边形面积
 * @param points 多边形各个顶点坐标
 * @returns 多边形面积（平方厘米）
 */
export function calculatePolygonArea(points: PlayAreaPoint[]): number {
  // 使用鞋带公式(Shoelace formula)计算多边形面积
  let area = 0;
  const n = points.length;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += points[i].Point.X * points[j].Point.Y;
    area -= points[j].Point.X * points[i].Point.Y;
  }

  area = Math.abs(area) / 2;
  return area;
}
