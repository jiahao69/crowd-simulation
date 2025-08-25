import type { PlayAreaData } from "../types/play-area";
import { calculatePolygonCenter } from "./geometry";

export const mergeBlockData = (
  playAreaData: PlayAreaData[],
  blockData: any[]
) => {
  const simulationBlockData = playAreaData.map((block) => {
    const durationData = blockData.find(
      (d: { BlockName: string; BlockDuration: number }) =>
        d.BlockName === block.Name
    );

    // 计算多边形的中点
    const center = calculatePolygonCenter(block.Points);

    return {
      name: block.Name,
      center: center,
      blockDuration: durationData?.BlockDuration,
    };
  });

  return simulationBlockData;
};
