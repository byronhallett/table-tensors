"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var pixi_js_1 = __importDefault(require("pixi.js"));
var learn_1 = require("./learn");
// CREATE APP
var app = new pixi_js_1.default.Application();
document.body.appendChild(app.view);
// CONSTANTS
var COLOR = Object.freeze({
    MAUVE: 0xae7178,
    TEAL: 0x71aea7,
    WHITE: 0xffffff
});
var SCREEN = Object.freeze({
    HEIGHT: app.renderer.height,
    WIDTH: app.renderer.width,
    MARGIN: 10
});
var PHYSICS = Object.freeze({
    PADDLE_SPEED: 0.025
});
var DIMENSIONS = Object.freeze({
    PADDLE: {
        WIDTH: SCREEN.WIDTH / 24,
        HEIGHT: SCREEN.HEIGHT / 5
    },
    FIELD: {
        WIDTH: SCREEN.WIDTH,
        HEIGHT: SCREEN.HEIGHT
    },
    GRAPH: {
        WIDTH: SCREEN.WIDTH * 0.4,
        HEIGHT: SCREEN.HEIGHT * 0.3
    },
    BALL: {
        RADIUS: SCREEN.WIDTH / 48
    }
});
// GAME OBJECTS
// Set up some primitives for the objects
var field = createField();
var graph = createGraph();
var p1 = createPaddle();
var p2 = createPaddle();
var ball = createBall();
var scoreCard = createText();
var hintText = createText();
var gameState;
var lastPrediction;
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
        speed: 0.01
    };
}
function resetGameState() {
    gameState.p1 = {
        input: 0.5,
        position: 0.5,
        score: 0
    };
    gameState.p2 = {
        position: 0.5,
        input: 0.5,
        score: 0
    };
    resetBall();
}
function startGame() {
    resetGameState();
    // Config styles etc
    // app.renderer.backgroundColor = COLOR.TEAL
    scoreCard.position.x = SCREEN.WIDTH / 2;
    scoreCard.position.y = SCREEN.MARGIN;
    hintText.anchor.x = 0.5;
    hintText.anchor.y = 0.5;
    hintText.position.x = SCREEN.WIDTH / 2;
    hintText.position.y = SCREEN.HEIGHT / 2;
    // set up update loop
    app.ticker.add(Update);
    // app.ticker.FPS = 60
    // Set up mouse listener
    field.interactive = true;
    field.on('pointermove', handleMouse);
    field.on('pointertap', handleClick);
}
function createPaddle() {
    var paddle = new pixi_js_1.default.Graphics();
    app.stage.addChild(paddle);
    paddle.beginFill(COLOR.MAUVE);
    paddle.drawRect(0, 0, DIMENSIONS.PADDLE.WIDTH, DIMENSIONS.PADDLE.HEIGHT);
    return paddle;
}
function createField() {
    var field = new pixi_js_1.default.Graphics();
    app.stage.addChild(field);
    field.beginFill(COLOR.TEAL);
    field.drawRect(0, 0, DIMENSIONS.FIELD.WIDTH, DIMENSIONS.FIELD.HEIGHT);
    return field;
}
function createGraph() {
    var graph = new pixi_js_1.default.Graphics();
    app.stage.addChild(graph);
    graph.beginFill(COLOR.WHITE);
    graph.alpha = 0.15;
    graph.drawRect((DIMENSIONS.FIELD.WIDTH - DIMENSIONS.GRAPH.WIDTH) / 2, DIMENSIONS.FIELD.HEIGHT - DIMENSIONS.GRAPH.HEIGHT, DIMENSIONS.GRAPH.WIDTH, DIMENSIONS.GRAPH.HEIGHT);
    return graph;
}
function createBall() {
    var ball = new pixi_js_1.default.Graphics();
    app.stage.addChild(ball);
    ball.beginFill(COLOR.MAUVE);
    ball.drawCircle(0, 0, DIMENSIONS.BALL.RADIUS);
    return ball;
}
function createText() {
    var card = new pixi_js_1.default.Text('', {
        fontFamily: 'Arial',
        fontSize: SCREEN.HEIGHT / 12,
        fill: COLOR.MAUVE,
        align: 'center'
    });
    card.anchor.x = 0.5;
    card.anchor.y = 0;
    app.stage.addChild(card);
    return card;
}
function newPosition(input, pos, deltaTime) {
    var diff = input - pos;
    var speed = PHYSICS.PADDLE_SPEED * deltaTime;
    var movement = Math.min(Math.abs(diff), speed) * (diff >= 0 ? 1 : -1);
    var newPos = pos + movement;
    // clamp it before return
    return Math.min(Math.max(newPos, 0), 1);
}
function score(paddle) {
    if (paddle === p1) {
        gameState.p2.score += 1;
    }
    else {
        gameState.p1.score += 1;
        doLearn(p2);
    }
    var oldDirection = gameState.ball.velocity.x >= 0 ? 1 : -1;
    // reset ball
    resetBall();
    // Change ball direction
    gameState.ball.velocity.x *= -oldDirection;
}
function scoreOrReflect(ball, paddle) {
    var ballGlobal = ball.position.y;
    var paddleGlobal = paddle.position.y + DIMENSIONS.PADDLE.HEIGHT / 2;
    if (Math.abs(ballGlobal - paddleGlobal) > DIMENSIONS.PADDLE.HEIGHT / 2) {
        score(paddle);
    }
    else {
        hitBall(paddle);
    }
}
function Update(deltaTime) {
    // Move players according to their input
    gameState.p1.position = newPosition(gameState.p1.input, gameState.p1.position, deltaTime);
    gameState.p2.position = newPosition(gameState.p2.input, gameState.p2.position, deltaTime);
    // Look at ball position
    var pos = gameState.ball.position;
    var vel = gameState.ball.velocity;
    // ball logic
    if (gameState.ball.active) {
        if (pos.x <= 0 || pos.x >= 1) {
            // Detect if a point was scored or reflected
            if (pos.x > 0.5) {
                scoreOrReflect(ball, p2);
            }
            else {
                scoreOrReflect(ball, p1);
            }
        }
        if (pos.y <= 0 || pos.y >= 1) {
            // reflect if hits walls
            vel.y *= -1;
        }
        // read state again
        pos = gameState.ball.position;
        vel = gameState.ball.velocity;
        // move ball
        gameState.ball.position = {
            x: pos.x + vel.x * deltaTime,
            y: pos.y + vel.y * deltaTime
        };
    }
    // Show new state on screen
    p1.position = new pixi_js_1.default.Point(SCREEN.MARGIN, (SCREEN.HEIGHT - DIMENSIONS.PADDLE.HEIGHT) * gameState.p1.position);
    p2.position = new pixi_js_1.default.Point(SCREEN.WIDTH - SCREEN.MARGIN - DIMENSIONS.PADDLE.WIDTH, (SCREEN.HEIGHT - DIMENSIONS.PADDLE.HEIGHT) * gameState.p2.position);
    var xOffset = SCREEN.MARGIN + DIMENSIONS.BALL.RADIUS + DIMENSIONS.PADDLE.WIDTH;
    var yOffset = DIMENSIONS.BALL.RADIUS;
    ball.position = new pixi_js_1.default.Point((SCREEN.WIDTH - xOffset * 2) * gameState.ball.position.x + xOffset, (SCREEN.HEIGHT - yOffset * 2) * gameState.ball.position.y + yOffset);
    scoreCard.text = gameState.p1.score + " | " + gameState.p2.score;
    if (!gameState.ball.active) {
        hintText.text = 'Click to serve';
    }
    else {
        hintText.text = '';
    }
}
function serveBall() {
    hitBall(p1);
}
function hitBall(playerPaddle) {
    // Get the center of the ball minus the center of the paddle
    var vector = {
        x: ball.position.x - (playerPaddle.position.x + DIMENSIONS.PADDLE.WIDTH / 2),
        y: ball.position.y - (playerPaddle.position.y + DIMENSIONS.PADDLE.HEIGHT / 2)
    };
    // Enforce the paddle hitting directiont o avoid clipping
    if (playerPaddle == p1 && vector.x < 0) {
        vector.x *= -1;
    }
    if (playerPaddle == p2 && vector.x > 0) {
        vector.x *= -1;
    }
    var normVector = normalise(vector);
    gameState.ball.active = true;
    gameState.ball.velocity = {
        x: normVector.x * gameState.ball.speed,
        y: normVector.y * gameState.ball.speed
    };
    gameState.ball.speed += 0.002;
    doLearn(playerPaddle);
}
function doLearn(paddle) {
    // Now predict the resultant Y position
    if (paddle == p1) {
        // Copy the game state at the moment of the p1 hit for training
        lastPrediction.player = gameState.p1.position;
        lastPrediction.ball = gameState.ball.position.y;
        var yPos = learn_1.predict(lastPrediction.player, lastPrediction.ball);
        // Send the bot there exactly
        gameState.p2.input = Math.min(Math.max(yPos, 0), 1);
    }
    else {
        // recall the last player hit for training
        learn_1.train(lastPrediction.player, lastPrediction.ball, gameState.ball.position.y);
    }
}
function normalise(vector) {
    var norm = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2)) || 1;
    return {
        x: vector.x / norm,
        y: vector.y / norm
    };
}
function handleMouse(event) {
    var newY = (event.data.global.y - DIMENSIONS.PADDLE.HEIGHT / 2) /
        (SCREEN.HEIGHT - DIMENSIONS.PADDLE.HEIGHT);
    gameState.p1.input = newY;
}
function handleClick(event) {
    if (!gameState.ball.active) {
        serveBall();
    }
}
startGame();