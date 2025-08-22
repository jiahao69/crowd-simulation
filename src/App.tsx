import { useRef, useState, useEffect } from "react";
import { Button, message } from "antd";

import type { PlayAreaData } from "./types/play-area";
import type { SimulationConfig, BlockData } from "./types/simulation";
import { PixiApp } from "./core/PixiApp";
import { useSimulation } from "./hooks/useSimulation";
import { mergeBlockData } from "./utils/mergeBlockData";
import { jsonImport } from "./utils/jsonImport";

import PixiCanvas from "./components/PixiCanvas";
import SimulationControlPanel from "./components/SimulationControlPanel";
import StatisticsPanel from "./components/StatisticsPanel";

const initialConfig: SimulationConfig = {
  teamSize: "random",
  teamInterval: 120,
  timeMultiplier: 60,
  playerSpeed: 0.5,
  minAreaPerPlayer: 3,
};

function App() {
  const pixiAppRef = useRef<PixiApp | null>(null);
  const playAreaData = useRef<PlayAreaData[]>([]);

  const [totalArea, setTotalArea] = useState(0);
  const [visible, setVisible] = useState(true);
  const [currentConfig, setCurrentConfig] = useState<SimulationConfig>({
    ...initialConfig,
  });

  const {
    isRunning,
    currentTime,
    teams,
    setBlockData,
    start,
    reset,
    getTeamTimeInField,
    updateConfig,
  } = useSimulation(initialConfig);

  useEffect(() => {
    if (!pixiAppRef.current) return;

    const teamRenderer = pixiAppRef.current.getTeamRenderer();
    if (isRunning) {
      teamRenderer.updateTeams(teams, getTeamTimeInField);
      // 更新PlayAreaRenderer中的队伍数据，用于计算人均面积
      pixiAppRef.current.updateTeams(teams);
    } else if (teams.length === 0) {
      teamRenderer.clear();
    }
  }, [isRunning, currentTime, teams]);

  // 导入PlayArea.json
  const handleImportPlayArea = async () => {
    playAreaData.current = await jsonImport<PlayAreaData[]>();

    if (pixiAppRef.current) {
      pixiAppRef.current.updatePlayAreaData(playAreaData.current);
      setTotalArea(pixiAppRef.current.getTotalArea());
    }

    reset();
  };

  // 导入PlayAreaBlockData.json
  const handleImportBlockData = async () => {
    if (!playAreaData.current.length) {
      message.error("请先导入PlayArea.json");
      return;
    }

    const blockData = await jsonImport<BlockData[]>();

    if (pixiAppRef.current) {
      const playAreaData = pixiAppRef.current.getPlayAreaData();
      const simulationBlockData = await mergeBlockData(playAreaData, blockData);

      setBlockData(simulationBlockData);
    }

    reset();
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <PixiCanvas
        onInitialized={(app) => {
          pixiAppRef.current = app;
          // 设置初始配置
          app.setSimulationConfig(currentConfig);
        }}
      />

      <SimulationControlPanel
        visible={visible}
        initialConfig={currentConfig}
        isRunning={isRunning}
        onConfigChange={(config) => {
          setCurrentConfig(config);
          updateConfig(config);
          if (pixiAppRef.current) {
            pixiAppRef.current.setSimulationConfig(config);
          }
        }}
        onStart={start}
        onReset={() => {
          reset();
          // 重置配置为初始值
          const resetConfig = { ...initialConfig };
          setCurrentConfig(resetConfig);
          updateConfig(resetConfig);
          if (pixiAppRef.current) {
            pixiAppRef.current.setSimulationConfig(resetConfig);
          }
        }}
      />

      <StatisticsPanel
        teams={teams}
        currentTime={currentTime}
        totalArea={totalArea}
      />

      <div
        style={{
          position: "absolute",
          left: 15,
          top: 15,
          display: "flex",
          gap: 10,
        }}
      >
        <Button type="primary" onClick={() => setVisible(!visible)}>
          {visible ? "隐藏模拟配置" : "显示模拟配置"}
        </Button>
        <Button type="primary" onClick={handleImportPlayArea}>
          导入PlayArea.json
        </Button>
        <Button type="primary" onClick={handleImportBlockData}>
          导入PlayAreaBlockData.json
        </Button>
      </div>
    </div>
  );
}

export default App;
