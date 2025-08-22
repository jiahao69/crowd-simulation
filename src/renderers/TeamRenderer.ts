import * as PIXI from "pixi.js";
import type { Team } from "../types/simulation";

export interface TeamRendererConfig {
  labelColor?: number;
  labelSize?: number;
  timeLabelColor?: number;
  timeLabelSize?: number;
  playerRadius?: number;
  playerColor?: number;
}

export class TeamRenderer {
  private container: PIXI.Container;
  private config: TeamRendererConfig;
  private teams: Map<number, PIXI.Container> = new Map();

  constructor(container: PIXI.Container, config: TeamRendererConfig = {}) {
    this.container = container;
    this.config = {
      labelColor: config.labelColor ?? 0xffffff,
      labelSize: config.labelSize ?? 19,
      timeLabelColor: config.timeLabelColor ?? 0xffff00,
      timeLabelSize: config.timeLabelSize ?? 18,
      playerRadius: config.playerRadius ?? 30,
      playerColor: config.playerColor ?? 0x00ff00,
    };
  }

  // 更新配置
  updateConfig(newConfig: Partial<TeamRendererConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  // 根据队伍人数和playerRadius计算实际的teamRadius
  private getTeamRadius(teamSize: number): number {
    if (teamSize <= 1) return this.config.playerRadius! * 1.2;
    if (teamSize === 2)
      return this.getPlayerSpacing() / 2 + this.config.playerRadius!;
    if (teamSize === 3) return this.getPlayerSpacing() * 0.65;
    if (teamSize === 4) return this.getPlayerSpacing() * 0.7;
    // 超过4人时使用圆环布局的半径
    return this.getPlayerSpacing();
  }

  // 根据playerRadius计算playerSpacing
  private getPlayerSpacing(): number {
    // 固定间距为6px，确保队员之间有合适的距离
    return this.config.playerRadius! * 2 + 6;
  }

  // 更新小队显示
  updateTeams(teams: Team[], formatTime: (team: Team) => string) {
    // 清理不存在的小队
    this.cleanupTeams(teams);

    // 更新或创建小队
    teams.forEach((team) => {
      let teamContainer = this.teams.get(team.id);

      if (!teamContainer) {
        teamContainer = this.createTeamContainer(team);
        this.teams.set(team.id, teamContainer);
        this.container.addChild(teamContainer);
      }

      this.updateTeamContainer(teamContainer, team, formatTime(team));
    });
  }

  // 清理不存在的小队
  private cleanupTeams(teams: Team[]) {
    const currentTeamIds = new Set(teams.map((team) => team.id));
    for (const [teamId, teamContainer] of this.teams) {
      if (!currentTeamIds.has(teamId)) {
        this.container.removeChild(teamContainer);
        this.teams.delete(teamId);
      }
    }
  }

  // 创建小队容器
  private createTeamContainer(team: Team): PIXI.Container {
    const container = new PIXI.Container();
    const teamRadius = this.getTeamRadius(team.size);

    // 创建玩家点簇
    const playersContainer = new PIXI.Container();
    playersContainer.name = "players";
    container.addChild(playersContainer);
    this.createPlayerDots(playersContainer, team.size);

    // 创建小队名称标签
    const nameLabel = new PIXI.Text(team.name, {
      fontSize: this.config.labelSize,
      fill: this.config.labelColor,
      align: "center",
    });
    nameLabel.anchor.set(0.5, 1);
    nameLabel.name = "nameLabel";
    nameLabel.position.set(0, -teamRadius - 5);
    container.addChild(nameLabel);

    // 创建时间标签
    const timeLabel = new PIXI.Text("0:00", {
      fontSize: this.config.timeLabelSize,
      fill: this.config.timeLabelColor,
      align: "center",
    });
    timeLabel.anchor.set(0.5, 0);
    timeLabel.name = "timeLabel";
    timeLabel.position.set(0, teamRadius + 5);
    container.addChild(timeLabel);

    return container;
  }

  // 更新小队容器
  private updateTeamContainer(
    container: PIXI.Container,
    team: Team,
    timeText: string
  ) {
    // 更新位置
    container.position.set(team.currentPosition.x, team.currentPosition.y);

    // 更新时间标签
    const timeLabel = container.getChildByName("timeLabel") as PIXI.Text;
    timeLabel.text = timeText;

    // 若队伍人数发生变化，更新玩家点簇和标签位置
    const playersContainer = container.getChildByName(
      "players"
    ) as PIXI.Container;
    if (playersContainer && playersContainer.children.length !== team.size) {
      this.createPlayerDots(playersContainer, team.size);

      // 重新计算并更新标签位置
      const teamRadius = this.getTeamRadius(team.size);
      const nameLabel = container.getChildByName("nameLabel") as PIXI.Text;
      const timeLabelElement = container.getChildByName(
        "timeLabel"
      ) as PIXI.Text;

      nameLabel.position.set(0, -teamRadius - 5);
      timeLabelElement.position.set(0, teamRadius + 5);
    }
  }

  // 清理所有小队
  clear() {
    this.teams.forEach((teamContainer) => {
      this.container.removeChild(teamContainer);
    });
    this.teams.clear();
  }

  // 销毁渲染器
  destroy() {
    this.clear();
  }

  // 根据人数创建玩家圆点
  private createPlayerDots(playersContainer: PIXI.Container, count: number) {
    playersContainer.removeChildren();
    const spacing = this.getPlayerSpacing();
    const offsets = this.computeOffsets(count, spacing);

    for (let i = 0; i < count; i++) {
      const dot = new PIXI.Graphics();
      dot.circle(0, 0, this.config.playerRadius!).fill({
        color: this.config.playerColor,
      });
      dot.position.set(offsets[i].x, offsets[i].y);
      playersContainer.addChild(dot);
    }
  }

  // 计算紧凑布局偏移
  private computeOffsets(
    count: number,
    spacing: number
  ): Array<{ x: number; y: number }> {
    if (count <= 1) return [{ x: 0, y: 0 }];
    if (count === 2)
      return [
        { x: -spacing / 2, y: 0 },
        { x: spacing / 2, y: 0 },
      ];
    if (count === 3)
      return [
        { x: 0, y: -spacing * 0.5 },
        { x: -spacing * 0.5, y: spacing * 0.4 },
        { x: spacing * 0.5, y: spacing * 0.4 },
      ];
    if (count === 4)
      return [
        { x: -spacing / 2, y: -spacing / 2 },
        { x: spacing / 2, y: -spacing / 2 },
        { x: -spacing / 2, y: spacing / 2 },
        { x: spacing / 2, y: spacing / 2 },
      ];

    // 通用：超过4人时按圆环均匀分布
    const result: Array<{ x: number; y: number }> = [];
    const radius = spacing;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      result.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      });
    }

    return result;
  }
}
