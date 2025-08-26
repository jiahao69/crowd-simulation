import { Card } from "antd";
import type { Team } from "../types/simulation";

interface StatisticsPanelProps {
  teams: Team[];
  currentTime: number;
  totalArea: number;
}

const StatisticsPanel: React.FC<StatisticsPanelProps> = ({
  teams,
  currentTime,
  totalArea,
}) => {
  // 计算当前玩家总数
  const playerCount = teams.reduce((sum, team) => sum + team.size, 0);

  // 计算单位玩家面积
  const areaPerPlayer =
    playerCount > 0 ? Math.round((totalArea / playerCount) * 10) / 10 : 0;

  // 格式化时间
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <Card
      size="small"
      style={{
        position: "absolute",
        top: 15,
        right: 15,
        width: 380,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ textAlign: "center" }}>
          <div
            style={{ fontSize: "24px", fontWeight: "bold", color: "#1890ff" }}
          >
            {formatTime(currentTime)}
          </div>
          <div style={{ fontSize: "13px", color: "#8c8c8c", marginTop: 2 }}>
            模拟时间
          </div>
        </div>

        <div
          style={{ display: "flex", gap: 12, justifyContent: "space-between" }}
        >
          <div style={{ flex: 1, textAlign: "center" }}>
            <div
              style={{ fontSize: "20px", fontWeight: "bold", color: "#52c41a" }}
            >
              {teams.length}
            </div>
            <div style={{ fontSize: "13px", color: "#8c8c8c", marginTop: 2 }}>
              队伍
            </div>
          </div>
          <div style={{ width: 1, backgroundColor: "rgba(0, 0, 0, 0.06)" }} />
          <div style={{ flex: 1, textAlign: "center" }}>
            <div
              style={{ fontSize: "20px", fontWeight: "bold", color: "#722ed1" }}
            >
              {playerCount}
            </div>
            <div style={{ fontSize: "13px", color: "#8c8c8c", marginTop: 2 }}>
              玩家
            </div>
          </div>
          <div style={{ width: 1, backgroundColor: "rgba(0, 0, 0, 0.06)" }} />
          <div style={{ flex: 1, textAlign: "center" }}>
            <div
              style={{ fontSize: "20px", fontWeight: "bold", color: "#fa8c16" }}
            >
              {Math.round(totalArea)}m²
            </div>
            <div style={{ fontSize: "13px", color: "#8c8c8c", marginTop: 2 }}>
              总面积
            </div>
          </div>
          <div style={{ width: 1, backgroundColor: "rgba(0, 0, 0, 0.06)" }} />
          <div style={{ flex: 1, textAlign: "center" }}>
            <div
              style={{ fontSize: "20px", fontWeight: "bold", color: "#13c2c2" }}
            >
              {areaPerPlayer}m²
            </div>
            <div style={{ fontSize: "13px", color: "#8c8c8c", marginTop: 2 }}>
              人均面积
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StatisticsPanel;
