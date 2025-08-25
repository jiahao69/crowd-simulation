import * as PIXI from "pixi.js";

export interface DragConfig {
  button?: number; // 0: 左键, 1: 中键, 2: 右键
}

export class DragController {
  private container: PIXI.Container;
  private app: PIXI.Application;
  private config: Required<DragConfig>;
  private isDragging: boolean = false;
  private lastPointerPosition: { x: number; y: number } = { x: 0, y: 0 };

  constructor(
    app: PIXI.Application,
    container: PIXI.Container,
    config: DragConfig = {}
  ) {
    this.app = app;
    this.container = container;
    this.config = {
      button: config.button ?? 2,
    };

    this.setupEventListeners();
    this.updateCursor();
  }

  private setupEventListeners() {
    const canvas = this.app.canvas;

    canvas.addEventListener("mousedown", this.onMouseDown.bind(this));
    canvas.addEventListener("mousemove", this.onMouseMove.bind(this));
    canvas.addEventListener("mouseup", this.onMouseUp.bind(this));
    canvas.addEventListener("mouseleave", this.onMouseLeave.bind(this));
  }

  private onMouseDown(event: MouseEvent) {
    if (event.button !== this.config.button) return;

    this.isDragging = true;
    this.lastPointerPosition = { x: event.clientX, y: event.clientY };
    this.updateCursor();
  }

  private onMouseMove(event: MouseEvent) {
    if (this.isDragging) {
      const deltaX = event.clientX - this.lastPointerPosition.x;
      const deltaY = event.clientY - this.lastPointerPosition.y;

      // 移动容器
      this.container.position.x += deltaX;
      this.container.position.y += deltaY;

      // 更新最后位置
      this.lastPointerPosition = { x: event.clientX, y: event.clientY };

      // 触发拖拽事件
      this.onDragChange();
    }
  }

  private onMouseUp(event: MouseEvent) {
    if (event.button !== this.config.button) return;

    if (this.isDragging) {
      this.isDragging = false;
      this.updateCursor();
    }
  }

  private onMouseLeave() {
    if (this.isDragging) {
      this.isDragging = false;
      this.updateCursor();
    }
  }

  private onDragChange() {
    // 触发拖拽变化事件
    this.app.stage.emit("drag-change", {
      position: { x: this.container.position.x, y: this.container.position.y },
      viewport: this.getViewport(),
    });
  }

  private updateCursor() {
    const canvas = this.app.canvas;

    if (this.isDragging) {
      canvas.style.cursor = "grabbing";
    } else {
      canvas.style.cursor = "grab";
    }
  }

  private getViewport(): {
    x: number;
    y: number;
    width: number;
    height: number;
    scale: number;
  } {
    const scale = this.container.scale.x;
    const screenSize = {
      width: this.app.renderer.width,
      height: this.app.renderer.height,
    };

    return {
      x: -this.container.position.x / scale,
      y: -this.container.position.y / scale,
      width: screenSize.width / scale,
      height: screenSize.height / scale,
      scale,
    };
  }

  destroy() {
    const canvas = this.app.canvas;
    canvas.removeEventListener("mousedown", this.onMouseDown.bind(this));
    canvas.removeEventListener("mousemove", this.onMouseMove.bind(this));
    canvas.removeEventListener("mouseup", this.onMouseUp.bind(this));
    canvas.removeEventListener("mouseleave", this.onMouseLeave.bind(this));
    canvas.removeEventListener("contextmenu", () => {});
  }
}
