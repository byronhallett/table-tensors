class State {
  ball: Ball;
  p1: Player;
  p2: Player;
  reflections: {
    count: number;
    firstDirection?: "up" | "down";
  };
  lastHit: Input = {};
  displayWeights: {
    w0: number;
    w1: number;
  };

  resetBall() {
    this.ball = {
      active: false,
      position: {
        x: 0.01,
        y: 0.5,
      },
      velocity: {
        x: 0,
        y: 0,
      },
      speed: 0.01,
    };
  }

  constructor() {
    this.p1 = {
      input: 0.5,
      position: 0.5,
      score: 0,
    };
    this.p2 = {
      position: 0.5,
      input: 0.5,
      score: 0,
    };
    this.ball = null;
    this.reflections = { count: 0 };
    this.displayWeights = {
      w0: 0.0,
      w1: 0.0,
    };

    this.resetBall();
  }
}

export const gameState = new State();
