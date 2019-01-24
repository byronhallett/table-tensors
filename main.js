// CREATE APP
const app = new PIXI.Application();
document.body.appendChild(app.view);

// CONSTANTS
const COLOR = Object.freeze({
  MAUVE: 0xae7178,
  TEAL: 0x71aea7,
})
const SCREEN = Object.freeze({
  HEIGHT: app.renderer.height,
  WIDTH: app.renderer.width
})

const PHYSICS = Object.freeze({
  PADDLE_SPEED: 0.025,
})

const DIMENSIONS = Object.freeze({
  PADDLE: {
    WIDTH: SCREEN.WIDTH / 24,
    HEIGHT: SCREEN.HEIGHT / 5,
  },
  BALL: {
    RADIUS: SCREEN.WIDTH / 48,
  }
})

// GAME OBJECTS
// Set up some primitives for the objects
const p1 = createPaddle()
const p2 = createPaddle()
const ball = createBall()
const scoreCard = createScoreCard()

/** @type {State} */
var gameState = {}

function resetGameState() {
  gameState = {
    ball: {
      position: {
        x: 0.5,
        y: 0.5
      },
      velocity: {
        x: 0.003,
        y: 0.01
      },
      speed: 0.01
    },
    p1: {
      input: 0.5,
      position: 0.5,
      score: 0
    },
    p2: {
      position: 0.5,
      input: 0.5,
      score: 0
    }
  }
}

function startGame() {
  resetGameState()
  // Config styles etc
  app.renderer.backgroundColor = COLOR.TEAL
  scoreCard.position = {
    x: SCREEN.WIDTH / 2,
    y: 10
  }
  // set up update loop
  app.ticker.add(Update)
  // app.ticker.FPS = 60
  // Set up mouse listener
  app.stage.interactive = true
  app.stage.on("pointermove", handleMouse)
}

function createPaddle() {
  const paddle = new PIXI.Graphics();
  app.stage.addChild(paddle)
  paddle.beginFill(COLOR.MAUVE)
  paddle.drawRect(0, 0, DIMENSIONS.PADDLE.WIDTH, DIMENSIONS.PADDLE.HEIGHT)
  return paddle
}

function createBall() {
  const ball = new PIXI.Graphics();
  app.stage.addChild(ball)
  ball.beginFill(COLOR.MAUVE)
  ball.drawCircle(0, 0, DIMENSIONS.BALL.RADIUS)
  return ball
}

function createScoreCard() {
  const card = new PIXI.Text(
    '', {
      fontFamily: 'Arial',
      fontSize: SCREEN.HEIGHT / 12,
      fill: COLOR.MAUVE,
      align: 'center'
    })
  card.anchor = {
    x: 0.5,
    y: 0
  }
  app.stage.addChild(card)
  return card
}

/**
 *
 * @param {number} input
 * @param {number} pos
 * @param {number} deltaTime
 */
function newPosition(input, pos, deltaTime) {
  const diff = input - pos
  const speed = PHYSICS.PADDLE_SPEED * deltaTime
  const movement = Math.min(Math.abs(diff), speed) * Math.sign(diff)
  const newPos = pos + movement
  // clamp it before return
  return Math.min(Math.max(newPos, 0), 1)
}

/**
 *
 * @param {PIXI.Graphics} paddle
 */
function score(paddle) {
  if (paddle === p1) {
    gameState.p2.score += 1
  } else {
    gameState.p1.score += 1
  }
  const oldDirection = Math.sign(gameState.ball.velocity.x)
  // reset ball
  resetGameState()
  // Change ball direction
  gameState.ball.velocity.x *= -oldDirection
}

function reflect(ballGlobal, paddleGlobal) {

}

/**
 *
 * @param {Ball} ball
 * @param {PIXI.Graphics} paddle
 */
// TODO
function scoreOrReflect(ball, paddle) {
  const ballGlobal = ball.position
  const paddleGlobal = paddle.position
  if (Math.abs(ballGlobal.y - paddleGlobal.y) > DIMENSIONS.PADDLE.HEIGHT / 2) {
    score(paddle)
  } else {
    reflect(ballGlobal, paddleGlobal)
  }
}

/**
 *
 * @param {number} deltaTime
 */
function Update(deltaTime) {
  // Move players according to their input
  gameState.p1.position = newPosition(
    gameState.p1.input, gameState.p1.position, deltaTime)
  gameState.p2.position = newPosition(
    gameState.p2.input, gameState.p2.position, deltaTime)

  // Look at ball position
  let pos = gameState.ball.position
  let vel = gameState.ball.velocity

  if (pos.x <= 0 || pos.x >= 1) {
    // Detect if a point was scored or reflected
    if (pos.x > 0.5) {
      scoreOrReflect(ball, p2)
    } else {
      scoreOrReflect(ball, p1)
    }
  }
  if (pos.y <= 0 || pos.y >= 1) {
    // reflect if hits walls
    vel.y *= -1
  }

  // read state again
  pos = gameState.ball.position
  vel = gameState.ball.velocity

  // move ball
  gameState.ball.position = {
    x: pos.x + vel.x * deltaTime,
    y: pos.y + vel.y * deltaTime,
  }

  // Show new state on screen
  p1.position = new PIXI.Point(
    10,
    (SCREEN.HEIGHT - DIMENSIONS.PADDLE.HEIGHT) * gameState.p1.position
  )
  p2.position = new PIXI.Point(
    SCREEN.WIDTH - 10 - DIMENSIONS.PADDLE.WIDTH,
    (SCREEN.HEIGHT - DIMENSIONS.PADDLE.HEIGHT) * gameState.p2.position
  )
  ball.position = new PIXI.Point(
    (SCREEN.WIDTH - DIMENSIONS.BALL.RADIUS * 2) * gameState.ball.position.x +
    DIMENSIONS.BALL.RADIUS,
    (SCREEN.HEIGHT - DIMENSIONS.BALL.RADIUS * 2) * gameState.ball.position.y +
    DIMENSIONS.BALL.RADIUS,
  )
  scoreCard.text = `${gameState.p1.score} | ${gameState.p2.score}`
}

/**
 *
 * @param {PIXI.interaction.InteractionEvent} event
 */
function handleMouse(event) {
  const newY = (event.data.global.y - DIMENSIONS.PADDLE.HEIGHT / 2) /
    (SCREEN.HEIGHT - DIMENSIONS.PADDLE.HEIGHT)
  gameState.p1.input = newY
}

startGame()
