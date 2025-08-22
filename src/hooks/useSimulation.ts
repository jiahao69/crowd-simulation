import { useState, useRef } from "react";

import type { SimulationConfig, Team, BlockData } from "../types/simulation";

export function useSimulation(initialConfig: SimulationConfig) {
  const lastUpdateTime = useRef(0);
  const lastTeamSpawnTime = useRef(0);
  const currentTimeRef = useRef(0);
  const index = useRef(1);
  const animationFrameId = useRef<number | null>(null);
  const blockData = useRef<BlockData[]>([]);
  const teamsRef = useRef<Team[]>([]);
  const configRef = useRef(initialConfig);

  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [teams, setTeams] = useState<Team[]>([]);

  // 设置动块数据
  const setBlockData = (data: BlockData[]) => {
    blockData.current = data;
  };

  // 更新模拟配置
  const updateConfig = (config: SimulationConfig) => {
    configRef.current = { ...config };
  };

  // 开始模拟
  const start = () => {
    setIsRunning(true);
    lastUpdateTime.current = performance.now();
    lastTeamSpawnTime.current = -configRef.current.teamInterval;
    index.current = 1;

    update();
  };
  // 重置模拟
  const reset = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }

    setIsRunning(false);
    setCurrentTime(0);
    currentTimeRef.current = 0;
    setTeams([]);
    teamsRef.current = [];
  };

  // 主更新循环
  const update = () => {
    const nowTime = performance.now();
    // 上一帧到当前帧的时间间隔(秒)
    const deltaTime = (nowTime - lastUpdateTime.current) / 1000;
    lastUpdateTime.current = nowTime;

    // 更新模拟时间
    const newTime =
      currentTimeRef.current + deltaTime * configRef.current.timeMultiplier;
    currentTimeRef.current = newTime;
    setCurrentTime(newTime);

    // 生成队伍
    spawnTeams();

    // 更新队伍
    updateTeams(deltaTime);

    // 清理已完成的队伍
    cleanupFinishedTeams();

    animationFrameId.current = requestAnimationFrame(update);
  };

  // 生成队伍
  const spawnTeams = () => {
    const currentSimTime = currentTimeRef.current;
    const timeSinceLastSpawn = currentSimTime - lastTeamSpawnTime.current;

    // 到达队伍生成间隔开始生成队伍
    if (timeSinceLastSpawn >= configRef.current.teamInterval) {
      const teamSize =
        configRef.current.teamSize === "random"
          ? Math.floor(Math.random() * 4) + 1
          : configRef.current.teamSize;

      const firstBlock = blockData.current[0];

      const team = {
        id: index.current,
        name: `Team_${index.current.toString().padStart(2, "0")}`,
        size: teamSize,
        currentBlockIndex: 0,
        currentPosition: { ...firstBlock.center },
        targetPosition: { ...firstBlock.center },
        startTime: currentSimTime,
        currentBlockStartTime: currentSimTime,
        isMoving: false,
        isFinished: false,
      };
      const newTeams = [...teamsRef.current, team];
      teamsRef.current = newTeams;
      setTeams(newTeams);
      lastTeamSpawnTime.current = currentSimTime;
      index.current++;
    }
  };

  // 更新队伍
  const updateTeams = (deltaTime: number) => {
    // 使用模拟时间的deltaTime来保持移动与时间倍数同步
    const simulationDeltaTime = deltaTime * configRef.current.timeMultiplier;

    teamsRef.current.forEach((team) => {
      if (team.isFinished) return;

      if (team.isMoving) {
        moveTeam(team, simulationDeltaTime);
      } else {
        checkTeamProgress(team);
      }
    });
  };

  // 移动队伍
  const moveTeam = (team: Team, deltaTime: number) => {
    const dx = team.targetPosition.x - team.currentPosition.x;
    const dy = team.targetPosition.y - team.currentPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= 0.1) {
      // 到达目标位置
      team.currentPosition = { ...team.targetPosition };
      team.isMoving = false;
      team.currentBlockStartTime = currentTimeRef.current;
    } else {
      // 继续移动
      const moveDistance = configRef.current.playerSpeed * 100 * deltaTime;
      const ratio = Math.min(moveDistance / distance, 1);

      team.currentPosition.x += dx * ratio;
      team.currentPosition.y += dy * ratio;
    }
  };

  // 检查队伍进度
  const checkTeamProgress = (team: Team) => {
    const currentBlock = blockData.current[team.currentBlockIndex];
    if (!currentBlock) {
      team.isFinished = true;
      return;
    }

    const timeInCurrentBlock =
      currentTimeRef.current - team.currentBlockStartTime;
    const blockDuration = currentBlock.blockDuration;

    if (timeInCurrentBlock >= blockDuration) {
      // 移动到下一个动块
      const nextBlockIndex = team.currentBlockIndex + 1;
      const nextBlock = blockData.current[nextBlockIndex];

      if (nextBlock) {
        team.currentBlockIndex = nextBlockIndex;
        team.targetPosition = nextBlock.center;
        team.isMoving = true;
      } else {
        // 没有下一个动块，完成
        team.isFinished = true;
      }
    }
  };

  const getTeamTimeInField = (team: Team) => {
    const timeInField = currentTime - team.startTime;
    const minutes = Math.floor(timeInField / 60);
    const seconds = Math.floor(timeInField % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // 清理已完成的队伍
  const cleanupFinishedTeams = () => {
    setTeams(teamsRef.current.filter((team) => !team.isFinished));
  };

  return {
    isRunning,
    currentTime,
    teams,
    setBlockData,
    start,
    reset,
    getTeamTimeInField,
    updateConfig,
  };
}
