import * as PIXI from "pixi.js";

export interface CanvasConfig {
  backgroundColor?: number;
}

export class CanvasRenderer {
  private app: PIXI.Application;
  private container: HTMLElement;
  private mainContainer: PIXI.Container;

  constructor(container: HTMLElement) {
    this.container = container;

    // 创建pixi应用
    this.app = new PIXI.Application();
    // 创建自定义容器
    this.mainContainer = new PIXI.Container();
    // 添加自定义容器到舞台
    this.app.stage.addChild(this.mainContainer);
  }

  async initialize(config: CanvasConfig = {}) {
    const { backgroundColor = "0x1a1a1a" } = config;

    // 初始化应用
    await this.app.init({
      background: backgroundColor,
      width: this.container.clientWidth,
      height: this.container.clientHeight,
      antialias: true,
    });

    // 将canvas添加到容器
    this.container.appendChild(this.app.canvas);

    // 设置全屏样式
    this.app.canvas.style.width = "100%";
    this.app.canvas.style.height = "100%";
    this.app.canvas.style.display = "block";

    // 禁用右键菜单
    this.app.canvas.addEventListener("contextmenu", (event) => {
      event.preventDefault();
    });

    this.setupResize();
  }

  private setupResize() {
    const resizeObserver = new ResizeObserver(() => {
      this.app.renderer.resize(
        this.container.clientWidth,
        this.container.clientHeight
      );
    });
    resizeObserver.observe(this.container);
  }

  getApp(): PIXI.Application {
    return this.app;
  }

  getMainContainer(): PIXI.Container {
    return this.mainContainer;
  }

  destroy() {
    this.app.destroy(true, { children: true, texture: true });
  }
}
