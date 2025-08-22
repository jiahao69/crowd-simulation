import * as PIXI from "pixi.js";

export interface ZoomConfig {
  minScale?: number;
  maxScale?: number;
  zoomSpeed?: number;
}

export class ZoomController {
  private container: PIXI.Container;
  private app: PIXI.Application;
  private config: Required<ZoomConfig>;
  private currentScale: number = 1;

  constructor(
    app: PIXI.Application,
    container: PIXI.Container,
    config: ZoomConfig = {}
  ) {
    this.app = app;
    this.container = container;
    this.config = {
      minScale: config.minScale ?? 0.1,
      maxScale: config.maxScale ?? 5,
      zoomSpeed: config.zoomSpeed ?? 0.1,
    };

    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.app.canvas.addEventListener("wheel", this.onWheel.bind(this), {
      passive: false,
    });
  }

  private onWheel(event: WheelEvent) {
    const { zoomSpeed, minScale, maxScale } = this.config;

    // 获取鼠标在画布上的位置
    const rect = this.app.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // 计算鼠标在世界坐标中的位置（缩放前）
    const worldPos = this.container.toLocal(new PIXI.Point(mouseX, mouseY));

    // 计算缩放因子
    const scaleFactor = event.deltaY > 0 ? 1 - zoomSpeed : 1 + zoomSpeed;
    const newScale = Math.max(
      minScale,
      Math.min(maxScale, this.currentScale * scaleFactor)
    );

    if (newScale !== this.currentScale) {
      // 应用缩放
      this.currentScale = newScale;
      this.container.scale.set(this.currentScale);

      // 计算鼠标在世界坐标中的新位置（缩放后）
      const newWorldPos = this.container.toLocal(
        new PIXI.Point(mouseX, mouseY)
      );

      // 调整容器位置，使鼠标指向的世界坐标点保持不变
      this.container.position.x +=
        (newWorldPos.x - worldPos.x) * this.currentScale;
      this.container.position.y +=
        (newWorldPos.y - worldPos.y) * this.currentScale;

      // 触发缩放事件
      this.onZoomChange();
    }
  }

  private onZoomChange() {
    // 可以在这里添加缩放变化的回调
    this.app.stage.emit("zoom-change", {
      scale: this.currentScale,
      viewport: this.getViewport(),
    });
  }

  getViewport(): {
    x: number;
    y: number;
    width: number;
    height: number;
    scale: number;
  } {
    const screenSize = {
      width: this.app.renderer.width,
      height: this.app.renderer.height,
    };

    return {
      x: -this.container.position.x / this.currentScale,
      y: -this.container.position.y / this.currentScale,
      width: screenSize.width / this.currentScale,
      height: screenSize.height / this.currentScale,
      scale: this.currentScale,
    };
  }

  syncScale(scale: number) {
    this.currentScale = scale;
  }

  destroy() {
    this.app.canvas.removeEventListener("wheel", this.onWheel.bind(this));
  }
}
