// Simple Pong game
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const scoreboard = {
  player: document.getElementById('playerScore'),
  cpu: document.getElementById('cpuScore')
};

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Paddles
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 90;
const PADDLE_SPEED = 6;

const leftPaddle = {
  x: 20,
  y: (HEIGHT - PADDLE_HEIGHT) / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  dy: 0
};

const rightPaddle = {
  x: WIDTH - 20 - PADDLE_WIDTH,
  y: (HEIGHT - PADDLE_HEIGHT) / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT
};

// Ball
const BALL_RADIUS = 8;
let ball = {
  x: WIDTH / 2,
  y: HEIGHT / 2,
  vx: 5 * (Math.random() > 0.5 ? 1 : -1),
  vy: (Math.random() * 4 - 2)
};

let scores = { player: 0, cpu: 0 };

// Controls
const keys = { ArrowUp: false, ArrowDown: false };
let mouseControl = false;

function resetBall(direction = null) {
  ball.x = WIDTH / 2;
  ball.y = HEIGHT / 2;
  const baseSpeed = 5;
  const dir = direction || (Math.random() > 0.5 ? 1 : -1);
  ball.vx = baseSpeed * dir;
  ball.vy = (Math.random() * 4 - 2);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Collision detection: ball vs paddle (rect)
function ballHitsPaddle(ball, paddle) {
  const closestX = clamp(ball.x, paddle.x, paddle.x + paddle.width);
  const closestY = clamp(ball.y, paddle.y, paddle.y + paddle.height);
  const dx = ball.x - closestX;
  const dy = ball.y - closestY;
  return dx * dx + dy * dy <= BALL_RADIUS * BALL_RADIUS;
}

function update() {
  // Move left paddle by keys
  if (!mouseControl) {
    if (keys.ArrowUp) leftPaddle.y -= PADDLE_SPEED;
    if (keys.ArrowDown) leftPaddle.y += PADDLE_SPEED;
  }
  // Clamp paddles
  leftPaddle.y = clamp(leftPaddle.y, 0, HEIGHT - leftPaddle.height);

  // Simple CPU: follow ball with max speed and some smoothing
  const cpuCenter = rightPaddle.y + rightPaddle.height / 2;
  const diff = ball.y - cpuCenter;
  const cpuMaxSpeed = 4.2;
  // Add small inaccuracy when ball is near CPU side
  const followSpeed = clamp(diff * 0.12, -cpuMaxSpeed, cpuMaxSpeed);
  rightPaddle.y += followSpeed;
  rightPaddle.y = clamp(rightPaddle.y, 0, HEIGHT - rightPaddle.height);

  // Move ball
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Wall collision (top/bottom)
  if (ball.y - BALL_RADIUS <= 0) {
    ball.y = BALL_RADIUS;
    ball.vy = -ball.vy;
  } else if (ball.y + BALL_RADIUS >= HEIGHT) {
    ball.y = HEIGHT - BALL_RADIUS;
    ball.vy = -ball.vy;
  }

  // Paddle collisions
  if (ball.vx < 0 && ballHitsPaddle(ball, leftPaddle)) {
    // reflect and adjust angle based on where it hit the paddle
    const relativeY = (leftPaddle.y + leftPaddle.height / 2) - ball.y;
    const normalized = relativeY / (leftPaddle.height / 2);
    const bounceAngle = normalized * (Math.PI / 4); // max 45 degrees
    const speed = Math.min(12, Math.hypot(ball.vx, ball.vy) + 0.5);
    ball.vx = Math.abs(Math.cos(bounceAngle) * speed);
    ball.vy = -Math.sin(bounceAngle) * speed;
    ball.x = leftPaddle.x + leftPaddle.width + BALL_RADIUS + 0.1;
  } else if (ball.vx > 0 && ballHitsPaddle(ball, rightPaddle)) {
    const relativeY = (rightPaddle.y + rightPaddle.height / 2) - ball.y;
    const normalized = relativeY / (rightPaddle.height / 2);
    const bounceAngle = normalized * (Math.PI / 4);
    const speed = Math.min(12, Math.hypot(ball.vx, ball.vy) + 0.5);
    ball.vx = -Math.abs(Math.cos(bounceAngle) * speed);
    ball.vy = -Math.sin(bounceAngle) * speed;
    ball.x = rightPaddle.x - BALL_RADIUS - 0.1;
  }

  // Score
  if (ball.x + BALL_RADIUS < 0) {
    // CPU scores
    scores.cpu++;
    scoreboard.cpu.textContent = scores.cpu;
    resetBall(1);
  } else if (ball.x - BALL_RADIUS > WIDTH) {
    // Player scores
    scores.player++;
    scoreboard.player.textContent = scores.player;
    resetBall(-1);
  }
}

function drawNet() {
  ctx.fillStyle = "#2b475e";
  const step = 16;
  for (let y = 0; y < HEIGHT; y += step * 2) {
    ctx.fillRect(WIDTH / 2 - 2, y, 4, step);
  }
}

function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // Background and net
  drawNet();

  // Paddles
  ctx.fillStyle = "#9dd0ff";
  ctx.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
  ctx.fillStyle = "#ffd08a";
  ctx.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);

  // Ball
  ctx.beginPath();
  ctx.fillStyle = "#ffffff";
  ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
  ctx.fill();

  // Optionally show simple center text
}

let lastTime = 0;
function loop(time) {
  // time is in ms
  update();
  draw();
  requestAnimationFrame(loop);
}

// Event listeners
document.addEventListener('keydown', (e) => {
  if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
    keys[e.code] = true;
    mouseControl = false;
  }
});
document.addEventListener('keyup', (e) => {
  if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
    keys[e.code] = false;
  }
});

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const y = e.clientY - rect.top;
  leftPaddle.y = clamp(y - leftPaddle.height / 2, 0, HEIGHT - leftPaddle.height);
  mouseControl = true;
});
canvas.addEventListener('mouseleave', () => {
  // If you leave the canvas, stop mouse control so keys can be used
  mouseControl = false;
});

// Restart button
document.getElementById('restartBtn').addEventListener('click', () => {
  scores.player = 0;
  scores.cpu = 0;
  scoreboard.player.textContent = 0;
  scoreboard.cpu.textContent = 0;
  leftPaddle.y = (HEIGHT - leftPaddle.height) / 2;
  rightPaddle.y = (HEIGHT - rightPaddle.height) / 2;
  resetBall();
});

// Start the loop
resetBall();
requestAnimationFrame(loop);