import { Point } from "./types";
export function normalise(vector: Point): Point {
  const norm = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2)) || 1;
  return {
    x: vector.x / norm,
    y: vector.y / norm,
  };
}

export function normaliseY(yPos: number) {
  // Reflect negatives to make modulo easier
  yPos = yPos < 0 ? -yPos : yPos;
  // pattern repeats every 2
  yPos = yPos % 2;
  if (yPos > 1) {
    return 2 - yPos;
  }
  return yPos;
}
