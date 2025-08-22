import * as PIXI from "pixi.js";

import type { PlayAreaData } from "../types/play-area";
import type { SimulationConfig, Team } from "../types/simulation";
import { calculatePolygonArea } from "../utils/geometry";

export class PlayAreaRenderer {
  private container: PIXI.Container;
  private playAreaGraphics: PIXI.Graphics;
  private playAreaData: PlayAreaData[] = [];
  private simulationConfig: SimulationConfig | null = null;
  private teams: Team[] = [];

  // 为不同组分配颜色
  private groupColors = [
    0xff6b6b, // 红色
    0x4ecdc4, // 青色
    0x45b7d1, // 蓝色
    0x96ceb4, // 绿色
    0xfeca57, // 黄色
    0xff9ff3, // 粉色
    0x54a0ff, // 天蓝色
    0x5f27cd, // 紫色
    0x00d2d3, // 青绿色
    0xff9f43, // 橙色
  ];

  // 拥挤警告颜色
  private readonly WARNING_COLOR = 0xff0000; // 红色

  constructor(container: PIXI.Container) {
    this.container = container;

    this.playAreaGraphics = new PIXI.Graphics();

    this.container.addChild(this.playAreaGraphics);
  }

  setPlayAreaData(data: PlayAreaData[]) {
    this.playAreaData = data;
    this.renderPlayAreas();
  }

  setSimulationConfig(config: SimulationConfig) {
    this.simulationConfig = config;
    this.renderPlayAreas(); // 更新渲染以反映新的配置
  }

  updateTeams(teams: Team[]) {
    this.teams = teams;
    this.renderPlayAreas(); // 更新渲染以反映新的队伍状态
  }

  /**
   * 计算动块中的人均面积
   * @param areaIndex 动块索引
   * @returns 人均面积（平方厘米）
   */
  private calculateAreaPerPlayer(areaIndex: number) {
    if (!this.playAreaData[areaIndex]) {
      return { areaPerPlayer: Infinity, playerCount: 0 };
    }

    // 计算动块面积
    const area = calculatePolygonArea(this.playAreaData[areaIndex].Points);

    // 统计当前在该动块的玩家数量
    let playerCount = 0;
    this.teams.forEach((team) => {
      if (team.currentBlockIndex === areaIndex && !team.isFinished) {
        playerCount += team.size;
      }
    });

    // 计算人均面积
    const areaPerPlayer = playerCount > 0 ? area / playerCount : Infinity;

    return { areaPerPlayer, playerCount };
  }

  private getGroupNumber(name: string) {
    // 从动块名称中提取组号，如 "1-1" -> 1, "2-3" -> 2
    const groupMatch = name.match(/^(\d+)-/);
    return groupMatch ? parseInt(groupMatch[1]) : 1;
  }

  private getGroupColor(groupNumber: number) {
    // 为每个组分配一个颜色，循环使用颜色数组
    return this.groupColors[(groupNumber - 1) % this.groupColors.length];
  }

  private renderPlayAreas() {
    this.playAreaGraphics.clear();

    // 为每个动块绘制多边形和边框
    this.playAreaData.forEach((area, index) => {
      const groupNumber = this.getGroupNumber(area.Name);
      const baseColor = this.getGroupColor(groupNumber);

      // 计算人均面积
      const { areaPerPlayer, playerCount } = this.calculateAreaPerPlayer(index);

      // 判断是否需要显示拥挤警告（人均面积小于配置的最小值）
      const isOvercrowded =
        this.simulationConfig &&
        playerCount > 0 &&
        areaPerPlayer < this.simulationConfig.minAreaPerPlayer * 10000; // 转换为平方厘米

      // 动块颜色：拥挤时为红色，否则为原组颜色
      const fillColor = isOvercrowded ? this.WARNING_COLOR : baseColor;

      // 绘制多边形
      this.playAreaGraphics.moveTo(
        area.Points[0].Point.X,
        area.Points[0].Point.Y
      );

      for (let i = 1; i < area.Points.length; i++) {
        this.playAreaGraphics.lineTo(
          area.Points[i].Point.X,
          area.Points[i].Point.Y
        );
      }

      // 闭合多边形
      this.playAreaGraphics.lineTo(
        area.Points[0].Point.X,
        area.Points[0].Point.Y
      );

      // 应用填充样式 - 根据拥挤程度设置颜色
      this.playAreaGraphics.fill({
        color: fillColor,
        alpha: isOvercrowded ? 0.3 : 0.1, // 拥挤时透明度更高，更明显
      });

      // 应用边框样式
      this.playAreaGraphics.stroke({
        color: 0xffffff,
        width: 2,
        alpha: 0.8,
      });
    });
  }

  // 计算场地总面积
  getTotalArea() {
    const bounds = this.getPlayAreaBounds();
    if (!bounds) return 0;

    const widthCm = bounds.maxX - bounds.minX;
    const heightCm = bounds.maxY - bounds.minY;
    const areaCm2 = widthCm * heightCm;

    // 转换为平方米（1 像素 = 1 厘米）
    return areaCm2 * 0.0001;
  }

  getPlayAreaBounds() {
    if (this.playAreaData.length === 0) {
      return null;
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    this.playAreaData.forEach((area) => {
      area.Points.forEach((point) => {
        minX = Math.min(minX, point.Point.X);
        minY = Math.min(minY, point.Point.Y);
        maxX = Math.max(maxX, point.Point.X);
        maxY = Math.max(maxY, point.Point.Y);
      });
    });

    return { minX, minY, maxX, maxY };
  }

  getPlayAreaData() {
    return this.playAreaData;
  }

  destroy() {
    this.playAreaGraphics.destroy();
  }
}
