import * as PIXI from "pixi.js";
import { predict, train } from "./learn";
import { gameState } from "./state";
// CREATE APP
const app = new PIXI.Application();
document.body.appendChild(app.view);

const COLOR = Object.freeze({
  MAUVE: 0xae7178,
  TEAL: 0x71aea7,
  WHITE: 0xffffff,
});

const PHYSICS = Object.freeze({
  PADDLE_SPEED: 0.025,
});

const SCREEN = {
  MARGIN: 10,
  WIDTH: app.renderer.width,
  HEIGHT: app.renderer.height,
};

const DIMENSIONS = Object.freeze({
  PADDLE: {
    WIDTH: SCREEN.WIDTH / 24,
    HEIGHT: SCREEN.HEIGHT / 5,
  },
  FIELD: {
    WIDTH: SCREEN.WIDTH,
    HEIGHT: SCREEN.HEIGHT,
  },
  GRAPH: {
    WIDTH: SCREEN.WIDTH * 0.4,
    HEIGHT: SCREEN.HEIGHT * 0.3,
  },
  BALL: {
    RADIUS: SCREEN.WIDTH / 48,
  },
});

// GAME OBJECTS
// Set up some primitives for the objects
const field = createField();
// const graph = createGraph();
const p1 = createPaddle();
const p2 = createPaddle();
const ball = createBall();
const scoreCard = createText();
const hintText = createText();
const w0Text = createText();
const w1Text = createText();

function resetBall() {
  gameState.resetBall();
}

function startGame() {
  // Config styles etc
  // app.renderer.backgroundColor = COLOR.TEAL
  scoreCard.position.x = SCREEN.WIDTH / 2;
  scoreCard.position.y = SCREEN.MARGIN;

  hintText.anchor.y = 0.5;
  hintText.position.x = SCREEN.WIDTH / 2;
  hintText.position.y = SCREEN.HEIGHT / 2;

  w0Text.anchor.y = 1.0;
  w0Text.position.x = SCREEN.WIDTH / 3;
  w0Text.position.y = SCREEN.HEIGHT;

  w1Text.anchor.y = 1.0;
  w1Text.position.x = (2 * SCREEN.WIDTH) / 3;
  w1Text.position.y = SCREEN.HEIGHT;

  // set up update loop
  app.ticker.add(Update);
  // app.ticker.FPS = 60
  // Set up mouse listener
  field.interactive = true;
  field.on("pointermove", handleMouse);
  field.on("pointertap", handleClick);
}

function createPaddle() {
  const paddle = new PIXI.Graphics();
  app.stage.addChild(paddle);
  paddle.beginFill(COLOR.MAUVE);
  paddle.drawRect(0, 0, DIMENSIONS.PADDLE.WIDTH, DIMENSIONS.PADDLE.HEIGHT);
  return paddle;
}

function createField() {
  const field = new PIXI.Graphics();
  app.stage.addChild(field);
  field.beginFill(COLOR.TEAL);
  field.drawRect(0, 0, DIMENSIONS.FIELD.WIDTH, DIMENSIONS.FIELD.HEIGHT);
  return field;
}

// function createGraph() {
//   const graph = new PIXI.Graphics();
//   app.stage.addChild(graph);
//   graph.beginFill(COLOR.WHITE);
//   graph.alpha = 0.15;
//   graph.drawRect(
//     (DIMENSIONS.FIELD.WIDTH - DIMENSIONS.GRAPH.WIDTH) / 2,
//     DIMENSIONS.FIELD.HEIGHT - DIMENSIONS.GRAPH.HEIGHT,
//     DIMENSIONS.GRAPH.WIDTH,
//     DIMENSIONS.GRAPH.HEIGHT
//   );
//   return graph;
// }

function createBall() {
  const ball = new PIXI.Graphics();
  app.stage.addChild(ball);
  ball.beginFill(COLOR.MAUVE);
  ball.drawCircle(0, 0, DIMENSIONS.BALL.RADIUS);
  return ball;
}

function createText() {
  const text = new PIXI.Text("", {
    fontFamily: "Arial",
    fontSize: SCREEN.HEIGHT / 12,
    fill: COLOR.MAUVE,
    align: "center",
  });
  text.anchor.x = 0.5;
  text.anchor.y = 0;

  app.stage.addChild(text);
  return text;
}

function newPosition(input: number, pos: number, deltaTime: number) {
  const diff = input - pos;
  const speed = PHYSICS.PADDLE_SPEED * deltaTime;
  const movement = Math.min(Math.abs(diff), speed) * Math.sign(diff);
  const newPos = pos + movement;
  // clamp it before return
  return Math.min(Math.max(newPos, 0), 1);
}

function score(paddle: PIXI.Graphics) {
  if (paddle === p1) {
    gameState.p2.score += 1;
  } else {
    gameState.p1.score += 1;
    doLearn(p2);
  }
  const oldDirection = Math.sign(gameState.ball.velocity.x);
  // reset ball
  resetBall();
  // Change ball direction
  gameState.ball.velocity.x *= -oldDirection;
}

function scoreOrReflect(ball: PIXI.Graphics, paddle: PIXI.Graphics) {
  const ballGlobal = ball.position.y;
  const paddleGlobal = paddle.position.y + DIMENSIONS.PADDLE.HEIGHT / 2;
  if (Math.abs(ballGlobal - paddleGlobal) > DIMENSIONS.PADDLE.HEIGHT / 2) {
    score(paddle);
  } else {
    hitBall(paddle);
  }
}

function Update(deltaTime: number) {
  // Move players according to their input
  gameState.p1.position = newPosition(
    gameState.p1.input,
    gameState.p1.position,
    deltaTime
  );
  gameState.p2.position = newPosition(
    gameState.p2.input,
    gameState.p2.position,
    deltaTime
  );

  // Look at ball position
  let pos = gameState.ball.position;
  let vel = gameState.ball.velocity;

  // ball logic
  if (gameState.ball.active) {
    if (pos.x <= 0 || pos.x >= 1) {
      // Detect if a point was scored or reflected
      if (pos.x > 0.5) {
        scoreOrReflect(ball, p2);
      } else {
        scoreOrReflect(ball, p1);
      }
    }
    if (pos.y <= 0 || pos.y >= 1) {
      // reflect if hits walls
      vel.y *= -1;
      // also store reflect count
      gameState.reflections.count += 1;
      if (gameState.reflections.count == 1) {
        gameState.reflections.firstDirection = pos.y <= 0 ? "up" : "down";
      }
    }

    // read state again
    pos = gameState.ball.position;
    vel = gameState.ball.velocity;

    // move ball
    gameState.ball.position = {
      x: pos.x + vel.x * deltaTime,
      y: pos.y + vel.y * deltaTime,
    };
  }

  // Show new state on screen
  p1.position = new PIXI.Point(
    SCREEN.MARGIN,
    (SCREEN.HEIGHT - DIMENSIONS.PADDLE.HEIGHT) * gameState.p1.position
  );
  p2.position = new PIXI.Point(
    SCREEN.WIDTH - SCREEN.MARGIN - DIMENSIONS.PADDLE.WIDTH,
    (SCREEN.HEIGHT - DIMENSIONS.PADDLE.HEIGHT) * gameState.p2.position
  );
  const xOffset =
    SCREEN.MARGIN + DIMENSIONS.BALL.RADIUS + DIMENSIONS.PADDLE.WIDTH;
  const yOffset = DIMENSIONS.BALL.RADIUS;
  ball.position = new PIXI.Point(
    (SCREEN.WIDTH - xOffset * 2) * gameState.ball.position.x + xOffset,
    (SCREEN.HEIGHT - yOffset * 2) * gameState.ball.position.y + yOffset
  );
  // Set label values
  scoreCard.text = `${gameState.p1.score} | ${gameState.p2.score}`;
  if (!gameState.ball.active) {
    hintText.text = "Click to serve";
  } else {
    hintText.text = "";
  }
  w0Text.text = `w0 = ${gameState.displayWeights.w0.toFixed(1)}`;
  w1Text.text = `w1 = ${gameState.displayWeights.w1.toFixed(1)}`;
}

function serveBall() {
  gameState.reflections = { count: 0 };
  hitBall(p1);
}

function hitBall(playerPaddle: PIXI.Graphics) {
  // Get the center of the ball minus the center of the paddle
  const vector = {
    x:
      ball.position.x - (playerPaddle.position.x + DIMENSIONS.PADDLE.WIDTH / 2),
    y:
      ball.position.y -
      (playerPaddle.position.y + DIMENSIONS.PADDLE.HEIGHT / 2),
  };
  // Enforce the paddle hitting directiont o avoid clipping
  if (playerPaddle == p1 && vector.x < 0) {
    vector.x *= -1;
  }
  if (playerPaddle == p2 && vector.x > 0) {
    vector.x *= -1;
  }

  const normVector = normalise(vector);
  gameState.ball.active = true;
  gameState.ball.velocity = {
    x: normVector.x * gameState.ball.speed,
    y: normVector.y * gameState.ball.speed,
  };
  gameState.ball.speed += 0.002;
  doLearn(playerPaddle);
  // reset reflections every hit
  gameState.reflections = { count: 0 };
}

function doLearn(paddle: PIXI.Graphics) {
  // Now predict the resultant Y position
  if (paddle == p1) {
    // Copy the game state at the moment of the p1 hit for training
    gameState.lastHit.player = gameState.p1.position;
    gameState.lastHit.ball = gameState.ball.position.y;
    const yPos = predict(gameState.lastHit.player, gameState.lastHit.ball);
    // yPOS needs to be normalised to field
    const adjustedY = normaliseY(yPos);
    gameState.p2.input = Math.min(Math.max(adjustedY, 0), 1);
  } else {
    // recall the last player hit for training
    // also compute the out-of-bounds position of the ball based on reflections
    const theoreticalY = accountForReflections(gameState.ball.position.y);
    train(gameState.lastHit.player, gameState.lastHit.ball, theoreticalY);
  }
}

function normaliseY(yPos: number) {
  // Reflect negatives to make modulo easier
  yPos = yPos < 0 ? -yPos : yPos;
  // pattern repeats every 2
  yPos = yPos % 2;
  if (yPos > 1) {
    return 2 - yPos;
  }
  return yPos;
}
function accountForReflections(yPos: number) {
  const isUp = gameState.reflections.firstDirection == "up";
  const count = isUp
    ? gameState.reflections.count - 1
    : gameState.reflections.count;
  if (count % 2 == 1) {
    yPos = 1 - yPos;
  }
  const result = yPos + gameState.reflections.count;
  return isUp ? -result : result;
}

function normalise(vector: Point): Point {
  const norm = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2)) || 1;
  return {
    x: vector.x / norm,
    y: vector.y / norm,
  };
}

function handleMouse(event: PIXI.InteractionEvent) {
  const newY =
    (event.data.global.y - DIMENSIONS.PADDLE.HEIGHT / 2) /
    (SCREEN.HEIGHT - DIMENSIONS.PADDLE.HEIGHT);
  gameState.p1.input = newY;
}

function handleClick(event: PIXI.InteractionEvent) {
  if (!gameState.ball.active) {
    serveBall();
  }
}

startGame();
