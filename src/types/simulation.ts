// 模拟配置
export interface SimulationConfig {
  // 每队玩家人数：随机(1-4人)或者手动设置人数
  teamSize: "random" | 1 | 2 | 3 | 4;
  // 队伍间隔(秒)：每个队伍间隔多久进入场地
  teamInterval: number;
  // 时间倍数：整个模拟的时间加速倍数
  timeMultiplier: number;
  // 玩家的行走速度
  playerSpeed: number;
  // 最小单位玩家面积
  minAreaPerPlayer: number;
}

// 模拟状态
export interface SimulationState {
  isRunning: boolean;
  currentTime: number;
  teamId: number;
  teams: Team[];
  lastTeamSpawnTime: number;
}

// 动块数据
export interface BlockData {
  name: string;
  blockDuration: number;
  center: { x: number; y: number };
}

// 小队状态
export interface Team {
  id: number;
  name: string;
  size: number;
  currentBlockIndex: number;
  currentPosition: { x: number; y: number };
  targetPosition: { x: number; y: number };
  startTime: number;
  currentBlockStartTime: number;
  isMoving: boolean;
  isFinished: boolean;
}
