import * as PIXI from "pixi.js";
import { predict, train } from "./learn";
import { gameState } from "./state";
import { Constants, Color } from "./constants";

import { normalise, normaliseY } from "./math";

class Game {
  // CREATE APP
  app: PIXI.Application = new PIXI.Application({});
  // init constants
  constants: Constants = new Constants(this.app);

  field: PIXI.Graphics;
  p1: PIXI.Graphics;
  p2: PIXI.Graphics;
  ball: PIXI.Graphics;
  scoreCard: PIXI.Text;
  hintText: PIXI.Text;
  w0Text: PIXI.Text;
  w1Text: PIXI.Text;
  // icon: PIXI.Sprite;s
  icon: HTMLImageElement;

  constructor() {
    document.body.appendChild(this.app.view);

    // GAME OBJECTS
    // Set up some primitives for the objects
    this.field = this.createField();
    this.p1 = this.createPaddle();
    this.p2 = this.createPaddle();
    this.ball = this.createBall();
    this.scoreCard = this.createText();
    this.hintText = this.createText();
    this.w0Text = this.createText();
    this.w1Text = this.createText();

    // async set ups
    this.icon = document.querySelector(".fullscreen") as HTMLImageElement;
    // this.app.view.appendChild(this.icon);

    this.layoutElements();
    this.startGame();
  }

  layoutElements() {
    // Config styles etc
    // this.app.renderer.backgroundColor = Color.TEAL
    this.scoreCard.position.x = this.constants.screen.width / 2;
    this.scoreCard.position.y = this.constants.screen.margin;

    this.hintText.anchor.y = 0.5;
    this.hintText.position.x = this.constants.screen.width / 2;
    this.hintText.position.y = this.constants.screen.height / 2;

    this.w0Text.anchor.y = 1.0;
    this.w0Text.position.x = this.constants.screen.width / 3;
    this.w0Text.position.y = this.constants.screen.height;

    this.w1Text.anchor.y = 1.0;
    this.w1Text.position.x = (2 * this.constants.screen.width) / 3;
    this.w1Text.position.y = this.constants.screen.height;
  }

  startGame() {
    // set up update loop
    this.app.ticker.add(this.Update.bind(this));
    // Set up mouse listener
    this.field.interactive = true;
    this.field.on("pointermove", this.handleMouse.bind(this));
    this.field.on("pointertap", this.handleClick.bind(this));
    // set up fullscreen listener
    this.icon.addEventListener("click", this.handleFull.bind(this));
    // window.onresize = this.layoutElements.bind(this);
  }

  createPaddle() {
    const paddle = new PIXI.Graphics();
    this.app.stage.addChild(paddle);
    paddle.beginFill(Color.MAUVE);
    paddle.drawRect(
      0,
      0,
      this.constants.paddle.width,
      this.constants.paddle.height
    );
    return paddle;
  }

  createField() {
    const field = new PIXI.Graphics();
    this.app.stage.addChild(field);
    field.beginFill(Color.TEAL);
    field.drawRect(
      0,
      0,
      this.constants.field.width,
      this.constants.field.height
    );
    return field;
  }

  async createIcon(url: string) {
    const texture = await PIXI.Texture.fromURL(url);
    const icon = new PIXI.Sprite(texture);
    this.app.stage.addChild(icon);
    return icon;
  }

  createBall() {
    const ball = new PIXI.Graphics();
    this.app.stage.addChild(ball);
    ball.beginFill(Color.MAUVE);
    ball.drawCircle(0, 0, this.constants.ball.radius);
    return ball;
  }

  createText() {
    const text = new PIXI.Text("", {
      fontFamily: "Arial",
      fontSize: this.constants.screen.height / 12,
      fill: Color.MAUVE,
      align: "center",
    });
    text.anchor.x = 0.5;
    text.anchor.y = 0;

    this.app.stage.addChild(text);
    return text;
  }

  newPosition(input: number, pos: number, deltaTime: number) {
    const diff = input - pos;
    const speed = this.constants.paddle.speed * deltaTime;
    const movement = Math.min(Math.abs(diff), speed) * Math.sign(diff);
    const newPos = pos + movement;
    // clamp it before return
    return Math.min(Math.max(newPos, 0), 1);
  }

  score(paddle: PIXI.Graphics) {
    if (paddle === this.p1) {
      gameState.p2.score += 1;
    } else {
      gameState.p1.score += 1;
      this.doLearn(this.p2);
    }
    const oldDirection = Math.sign(gameState.ball.velocity.x);
    // reset ball
    gameState.resetBall();
    // Change ball direction
    gameState.ball.velocity.x *= -oldDirection;
  }

  scoreOrReflect(ball: PIXI.Graphics, paddle: PIXI.Graphics) {
    const ballGlobal = ball.position.y;
    const paddleGlobal = paddle.position.y + this.constants.paddle.height / 2;
    if (
      Math.abs(ballGlobal - paddleGlobal) >
      this.constants.paddle.height / 2
    ) {
      this.score(paddle);
    } else {
      this.hitBall(paddle);
    }
  }

  serveBall() {
    gameState.reflections = { count: 0 };
    this.hitBall(this.p1);
  }

  hitBall(playerPaddle: PIXI.Graphics) {
    // Get the center of the ball minus the center of the paddle
    const vector = {
      x:
        this.ball.position.x -
        (playerPaddle.position.x + this.constants.paddle.width / 2),
      y:
        this.ball.position.y -
        (playerPaddle.position.y + this.constants.paddle.height / 2),
    };
    // Enforce the paddle hitting directiont o avoid clipping
    if (playerPaddle == this.p1 && vector.x < 0) {
      vector.x *= -1;
    }
    if (playerPaddle == this.p2 && vector.x > 0) {
      vector.x *= -1;
    }

    const normVector = normalise(vector);
    gameState.ball.active = true;
    gameState.ball.velocity = {
      x: normVector.x * gameState.ball.speed,
      y: normVector.y * gameState.ball.speed,
    };
    gameState.ball.speed += 0.002;
    this.doLearn(playerPaddle);
    // reset reflections every hit
    gameState.reflections = { count: 0 };
  }

  doLearn(paddle: PIXI.Graphics) {
    // Now predict the resultant Y position
    if (paddle == this.p1) {
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
      const theoreticalY = this.accountForReflections(
        gameState.ball.position.y
      );
      train(gameState.lastHit.player, gameState.lastHit.ball, theoreticalY);
    }
  }

  accountForReflections(yPos: number) {
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

  handleMouse(event: PIXI.InteractionEvent) {
    const newY =
      (event.data.global.y - this.constants.paddle.height / 2) /
      (this.constants.screen.height - this.constants.paddle.height);
    gameState.p1.input = newY;
  }

  handleClick(_: PIXI.InteractionEvent) {
    if (!gameState.ball.active) {
      this.serveBall();
    }
  }

  handleFull(_: PIXI.InteractionEvent) {
    if (gameState.fullscreen) {
      document.exitFullscreen();
      gameState.fullscreen = false;
    } else {
      // document.querySelector(".game-container").requestFullscreen();
      this.app.view.requestFullscreen();
      gameState.fullscreen = true;
    }
  }

  Update(deltaTime: number) {
    // Move players according to their input
    gameState.p1.position = this.newPosition(
      gameState.p1.input,
      gameState.p1.position,
      deltaTime
    );
    gameState.p2.position = this.newPosition(
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
          this.scoreOrReflect(this.ball, this.p2);
        } else {
          this.scoreOrReflect(this.ball, this.p1);
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
    this.p1.position = new PIXI.Point(
      this.constants.screen.margin,
      (this.constants.screen.height - this.constants.paddle.height) *
        gameState.p1.position
    );
    this.p2.position = new PIXI.Point(
      this.constants.screen.width -
        this.constants.screen.margin -
        this.constants.paddle.width,
      (this.constants.screen.height - this.constants.paddle.height) *
        gameState.p2.position
    );
    const xOffset =
      this.constants.screen.margin +
      this.constants.ball.radius +
      this.constants.paddle.width;
    const yOffset = this.constants.ball.radius;
    this.ball.position = new PIXI.Point(
      (this.constants.screen.width - xOffset * 2) * gameState.ball.position.x +
        xOffset,
      (this.constants.screen.height - yOffset * 2) * gameState.ball.position.y +
        yOffset
    );
    // Set label values
    this.scoreCard.text = `${gameState.p1.score} | ${gameState.p2.score}`;
    if (!gameState.ball.active) {
      this.hintText.text = "Click to serve";
    } else {
      this.hintText.text = "";
    }
    this.w0Text.text = `w0 = ${gameState.displayWeights.w0.toFixed(1)}`;
    this.w1Text.text = `w1 = ${gameState.displayWeights.w1.toFixed(1)}`;
  }
}

const game = new Game();
