import * as PIXI from "pixi.js";
import { CanvasRenderer } from "../renderers/CanvasRenderer";
import { GridRenderer } from "../renderers/GridRenderer";
import { DragController } from "../controllers/DragController";
import { ZoomController } from "../controllers/ZoomController";
import { PlayAreaRenderer } from "../renderers/PlayAreaRenderer";
import { TeamRenderer } from "../renderers/TeamRenderer";
import type { PlayAreaData } from "../types/play-area";
import type { Team } from "../types/simulation";

export class PixiApp {
  private app!: PIXI.Application;
  private container: HTMLElement;
  private worldContainer!: PIXI.Container;

  // 渲染器
  private canvasRenderer!: CanvasRenderer;
  private gridRenderer!: GridRenderer;
  private playAreaRenderer!: PlayAreaRenderer;
  private teamRenderer!: TeamRenderer;

  // 控制器
  private zoomController!: ZoomController;
  private dragController!: DragController;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  async initialize() {
    // 1.初始化pixi应用
    this.canvasRenderer = new CanvasRenderer(this.container);
    await this.canvasRenderer.initialize();

    this.app = this.canvasRenderer.getApp();
    const mainContainer = this.canvasRenderer.getMainContainer();
    this.worldContainer = new PIXI.Container();
    mainContainer.addChild(this.worldContainer);

    // 2.初始化网格
    this.gridRenderer = new GridRenderer(this.worldContainer);

    // 3.初始化拖拽控制器
    this.dragController = new DragController(this.app, this.worldContainer);

    // 4.初始化缩放控制器
    this.zoomController = new ZoomController(this.app, this.worldContainer);

    // 5.初始化绘制动块模块
    this.playAreaRenderer = new PlayAreaRenderer(this.worldContainer);

    // 6.初始化绘制队伍模块
    this.teamRenderer = new TeamRenderer(this.worldContainer);

    // 首次更新网格
    this.updateGrid();
    // 在缩放，拖拽，窗口大小变化时更新网格
    this.setupEventListeners();
  }

  private updateGrid() {
    const viewport = this.zoomController.getViewport();
    this.gridRenderer.updateGrid(viewport);
  }

  private setupEventListeners() {
    this.app.stage.on("zoom-change", () => this.updateGrid());
    this.app.stage.on("drag-change", () => this.updateGrid());
    window.addEventListener("resize", () => this.updateGrid());
  }

  // 将画布中心移动到动块区域中心
  private centerToPlayArea() {
    const bounds = this.playAreaRenderer.getPlayAreaBounds();
    if (!bounds) return;

    const screenWidth = this.app.screen.width;
    const screenHeight = this.app.screen.height;
    const playAreaCenterX = (bounds.minX + bounds.maxX) / 2;
    const playAreaCenterY = (bounds.minY + bounds.maxY) / 2;
    const playAreaWidth = bounds.maxX - bounds.minX;
    const playAreaHeight = bounds.maxY - bounds.minY;

    const margin = 50;
    const topMargin = 150;
    const scaleX = (screenWidth - margin * 2) / playAreaWidth;
    const scaleY = (screenHeight - topMargin - margin) / playAreaHeight;
    const scale = Math.min(scaleX, scaleY, 1.5);

    this.worldContainer.scale.set(scale);
    this.worldContainer.x = screenWidth / 2 - playAreaCenterX * scale;
    this.worldContainer.y =
      screenHeight / 2 - playAreaCenterY * scale + topMargin / 2;

    this.zoomController.syncScale(scale);
    this.updateGrid();
  }

  updatePlayAreaData(data: PlayAreaData[]) {
    this.playAreaRenderer.setPlayAreaData(data);
    this.centerToPlayArea();
    this.updateGrid();
  }

  getTotalArea() {
    return this.playAreaRenderer.getTotalArea();
  }

  getTeamRenderer() {
    return this.teamRenderer;
  }

  setMinAreaPerPlayer(minAreaPerPlayer: number) {
    this.playAreaRenderer.setMinAreaPerPlayer(minAreaPerPlayer);
  }

  updateTeams(teams: Team[]) {
    this.playAreaRenderer.updateTeams(teams);
  }

  destroy() {
    this.canvasRenderer.destroy();
    this.gridRenderer.destroy();
    this.dragController.destroy();
    this.zoomController.destroy();
    this.playAreaRenderer.destroy();
    this.teamRenderer.destroy();
    window.removeEventListener("resize", () => this.updateGrid());
  }
}
