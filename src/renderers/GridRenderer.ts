import * as PIXI from "pixi.js";

export interface GridConfig {
  gridSize?: number;
}

export class GridRenderer {
  private container: PIXI.Container;
  private config: GridConfig;
  private gridGraphics: PIXI.Graphics;

  constructor(container: PIXI.Container, config: GridConfig = {}) {
    this.container = container;
    this.config = config;

    this.gridGraphics = new PIXI.Graphics();
    this.container.addChild(this.gridGraphics);
  }

  updateGrid(viewport: {
    x: number;
    y: number;
    width: number;
    height: number;
    scale: number;
  }) {
    this.gridGraphics.clear();

    const { gridSize = 100 } = this.config;
    const scaledGridSize = gridSize * viewport.scale;

    // 如果网格太小，不绘制
    if (scaledGridSize < 5) return;

    // 计算可见区域的网格范围
    const startX = Math.floor(viewport.x / gridSize) * gridSize;
    const endX = Math.ceil((viewport.x + viewport.width) / gridSize) * gridSize;
    const startY = Math.floor(viewport.y / gridSize) * gridSize;
    const endY =
      Math.ceil((viewport.y + viewport.height) / gridSize) * gridSize;

    // 绘制垂直网格线
    for (let x = startX; x <= endX; x += gridSize) {
      this.gridGraphics.moveTo(x, startY).lineTo(x, endY);
    }

    // 绘制水平网格线
    for (let y = startY; y <= endY; y += gridSize) {
      this.gridGraphics.moveTo(startX, y).lineTo(endX, y);
    }

    // 应用stroke样式到所有线条
    this.gridGraphics.stroke({
      color: 0x333333,
      alpha: 0.6,
      width: 2,
    });
  }

  destroy() {
    this.gridGraphics.destroy();
  }
}
