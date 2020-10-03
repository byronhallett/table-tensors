// declare var tf: typeof import("@tensorflow/tfjs");

export interface Point {
  x: number;
  y: number;
}

export interface Player {
  input: number;
  position: number;
  score: number;
}

export interface Ball {
  active: boolean;
  position: Point;
  velocity: Point;
  speed: number;
}

export interface Input {
  player?: number;
  ball?: number;
}
