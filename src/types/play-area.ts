export interface PlayAreaPoint {
  Point: {
    X: number;
    Y: number;
  };
}

export interface PlayAreaData {
  Name: string;
  Index: number;
  Points: PlayAreaPoint[];
  Entrance: {
    Point: {
      X: number;
      Y: number;
    };
  };
  Exit: {
    Point: {
      X: number;
      Y: number;
    };
  };
  DeltaYaw: number;
}
