// declare var tf: typeof import("@tensorflow/tfjs");

interface Point {
  x: number;
  y: number;
}

interface Player {
  input: number;
  position: number;
  score: number;
}

interface Ball {
  active: boolean;
  position: Point;
  velocity: Point;
  speed: number;
}

// interface State {
//   ball: Ball;
//   p1: Player;
//   p2: Player;
//   reflections: {
//     count: number;
//     firstDirection?: "up" | "down";
//   };
// }

interface Input {
  player?: number;
  ball?: number;
}
