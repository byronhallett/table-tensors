// CREATE APP
const app = new PIXI.Application();
document.body.appendChild(app.view);

// CONSTANTS
const COLOR = Object.freeze({
  MAUVE: 0xae7178,
  TEAL: 0x71aea7,
  WHITE: 0xFFFFFF,
})
const SCREEN = Object.freeze({
  HEIGHT: app.renderer.height,
  WIDTH: app.renderer.width,
  MARGIN: 10,
})

const PHYSICS = Object.freeze({
  PADDLE_SPEED: 0.025,
})

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
  }
})

// GAME OBJECTS
// Set up some primitives for the objects
const field = createField()
const graph = createGraph()
const p1 = createPaddle()
const p2 = createPaddle()
const ball = createBall()
const scoreCard = createText()
const hintText = createText()

/** @type {State} */
var gameState = {}

/** @type {State} */
var lastPrediction = {}

function resetBall() {
  gameState.ball = {
    active: false,
    position: {
      x: 0.01,
      y: 0.5
    },
    velocity: {
      x: 0,
      y: 0
    },
    speed: 0.01,
  }
}

function resetGameState() {
  gameState = {
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
  resetBall()
}

function startGame() {
  resetGameState()
  // Config styles etc
  // app.renderer.backgroundColor = COLOR.TEAL
  scoreCard.position = {
    x: SCREEN.WIDTH / 2,
    y: SCREEN.MARGIN
  }
  hintText.anchor = {
    x: 0.5,
    y: 0.5
  }
  hintText.position = {
    x: SCREEN.WIDTH / 2,
    y: SCREEN.HEIGHT / 2,
  }
  // set up update loop
  app.ticker.add(Update)
  // app.ticker.FPS = 60
  // Set up mouse listener
  field.interactive = true
  field.on("pointermove", handleMouse)
  field.on("pointertap", handleClick)
}

function createPaddle() {
  const paddle = new PIXI.Graphics();
  app.stage.addChild(paddle)
  paddle.beginFill(COLOR.MAUVE)
  paddle.drawRect(0, 0, DIMENSIONS.PADDLE.WIDTH, DIMENSIONS.PADDLE.HEIGHT)
  return paddle
}

function createField() {
  const field = new PIXI.Graphics();
  app.stage.addChild(field)
  field.beginFill(COLOR.TEAL)
  field.drawRect(0, 0, DIMENSIONS.FIELD.WIDTH, DIMENSIONS.FIELD.HEIGHT)
  return field
}

function createGraph() {
  const graph = new PIXI.Graphics();
  app.stage.addChild(graph)
  graph.beginFill(COLOR.WHITE)
  graph.alpha = 0.15
  graph.drawRect(
    (DIMENSIONS.FIELD.WIDTH - DIMENSIONS.GRAPH.WIDTH) / 2,
    DIMENSIONS.FIELD.HEIGHT - DIMENSIONS.GRAPH.HEIGHT,
    DIMENSIONS.GRAPH.WIDTH,
    DIMENSIONS.GRAPH.HEIGHT)
  return graph
}

function createBall() {
  const ball = new PIXI.Graphics();
  app.stage.addChild(ball)
  ball.beginFill(COLOR.MAUVE)
  ball.drawCircle(0, 0, DIMENSIONS.BALL.RADIUS)
  return ball
}

function createText() {
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
    doLearn(p2)
  }
  const oldDirection = Math.sign(gameState.ball.velocity.x)
  // reset ball
  resetBall()
  // Change ball direction
  gameState.ball.velocity.x *= -oldDirection
}



/**
 *
 * @param {PIXI.Graphics} ball
 * @param {PIXI.Graphics} paddle
 */
function scoreOrReflect(ball, paddle) {
  const ballGlobal = ball.position.y
  const paddleGlobal = paddle.position.y + DIMENSIONS.PADDLE.HEIGHT / 2
  if (Math.abs(ballGlobal - paddleGlobal) > (DIMENSIONS.PADDLE.HEIGHT / 2)) {
    score(paddle)
  } else {
    hitBall(paddle)
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

  // ball logic
  if (gameState.ball.active) {
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

  }

  // Show new state on screen
  p1.position = new PIXI.Point(
    SCREEN.MARGIN,
    (SCREEN.HEIGHT - DIMENSIONS.PADDLE.HEIGHT) * gameState.p1.position
  )
  p2.position = new PIXI.Point(
    SCREEN.WIDTH - SCREEN.MARGIN - DIMENSIONS.PADDLE.WIDTH,
    (SCREEN.HEIGHT - DIMENSIONS.PADDLE.HEIGHT) * gameState.p2.position
  )
  const xOffset = SCREEN.MARGIN + DIMENSIONS.BALL.RADIUS +
    DIMENSIONS.PADDLE.WIDTH
  const yOffset = DIMENSIONS.BALL.RADIUS
  ball.position = new PIXI.Point(
    (SCREEN.WIDTH - xOffset * 2) * gameState.ball.position.x + xOffset,
    (SCREEN.HEIGHT - yOffset * 2) * gameState.ball.position.y + yOffset,
  )
  scoreCard.text = `${gameState.p1.score} | ${gameState.p2.score}`
  if (!gameState.ball.active) {
    hintText.text = "Click to serve"
  } else {
    hintText.text = ""
  }
}

function serveBall() {
  hitBall(p1)
}

/**
 *
 * @param {PIXI.Graphics} playerPaddle
 */
function hitBall(playerPaddle) {
  // Get the center of the ball minus the center of the paddle
  const vector = {
    x: ball.position.x -
      (playerPaddle.position.x + DIMENSIONS.PADDLE.WIDTH / 2),
    y: ball.position.y -
      (playerPaddle.position.y + DIMENSIONS.PADDLE.HEIGHT / 2),
  }
  // Enforce the paddle hitting directiont o avoid clipping
  if (playerPaddle == p1 && vector.x < 0) {
    vector.x *= -1
  }
  if (playerPaddle == p2 && vector.x > 0) {
    vector.x *= -1
  }

  const normVector = normalise(vector)
  gameState.ball.active = true
  gameState.ball.velocity = {
    x: normVector.x * gameState.ball.speed,
    y: normVector.y * gameState.ball.speed,
  }
  gameState.ball.speed += 0.002
  doLearn(playerPaddle)
}

/**
 *
 * @param {PIXI.Graphics} paddle
 */
function doLearn(paddle) {
  // Now predict the resultant Y position
  if (paddle == p1) {
    // Copy the game state at the moment of the p1 hit for training
    lastPrediction = {player: gameState.p1.position, ball: gameState.ball.position.y}
    const yPos = predict(gameState.p1.position, gameState.ball.position.y)
    // Send the bot there exactly
    // TODO, add some spin
    gameState.p2.input = Math.min(Math.max(yPos, 0), 1)
  } else {
    // recall the last player hit for training
    train(lastPrediction.player, lastPrediction.ball, gameState.ball.position.y)
  }
}

/**
 *
 * @param {Point} vector
 * @return {Point}
 */
function normalise(vector) {
  const norm = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2)) || 1
  return {
    x: vector.x / norm,
    y: vector.y / norm
  }
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

/**
 *
 * @param {PIXI.interaction.InteractionEvent} event
 */
function handleClick(event) {
  if (!gameState.ball.active) {
    serveBall()
  }
}

startGame()
