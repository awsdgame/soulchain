const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const healthEl = document.getElementById("health");
const scoreEl = document.getElementById("score");

let score = 0;

// Spirit/player state
let spirit = { x: 100, y: 250, radius: 12, speed: 3, active: true };

// Current host (enemy possessed)
let host = null;
let hostHealth = 100;

// Enemy template
class Enemy {
  constructor(x, y, type = "basic") {
    this.x = x;
    this.y = y;
    this.radius = 18;
    this.type = type;
    this.speed = type === "fast" ? 3 : 1.5;
    this.color = type === "fast" ? "orange" : "green";
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  update() {
    // Simple wandering AI
    this.x += (Math.random() - 0.5) * this.speed;
    this.y += (Math.random() - 0.5) * this.speed;
    this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
    this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));
  }
}

let enemies = [];
for (let i = 0; i < 6; i++) {
  enemies.push(new Enemy(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() < 0.3 ? "fast" : "basic"));
}

const keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// Possession mechanic
function possess() {
  if (host) return; // already inside
  for (let enemy of enemies) {
    let dist = Math.hypot(spirit.x - enemy.x, spirit.y - enemy.y);
    if (dist < spirit.radius + enemy.radius + 5) {
      host = enemy;
      hostHealth = 100;
      spirit.active = false;
      break;
    }
  }
}

document.addEventListener("keydown", e => {
  if (e.code === "Space") {
    possess();
  }
});

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update/draw enemies
  enemies.forEach(e => {
    if (e !== host) {
      e.update();
      e.draw();
    }
  });

  if (host) {
    // Control the host
    if (keys["w"] || keys["ArrowUp"]) host.y -= host.speed;
    if (keys["s"] || keys["ArrowDown"]) host.y += host.speed;
    if (keys["a"] || keys["ArrowLeft"]) host.x -= host.speed;
    if (keys["d"] || keys["ArrowRight"]) host.x += host.speed;

    host.x = Math.max(host.radius, Math.min(canvas.width - host.radius, host.x));
    host.y = Math.max(host.radius, Math.min(canvas.height - host.radius, host.y));

    host.draw();

    // Host health drain
    hostHealth -= 0.2;
    if (hostHealth <= 0) {
      // Host dies, spirit pops out
      enemies = enemies.filter(e => e !== host);
      host = null;
      spirit.active = true;
      hostHealth = 0;
      score += 10;
    }
  } else {
    // Control spirit
    if (keys["w"] || keys["ArrowUp"]) spirit.y -= spirit.speed;
    if (keys["s"] || keys["ArrowDown"]) spirit.y += spirit.speed;
    if (keys["a"] || keys["ArrowLeft"]) spirit.x -= spirit.speed;
    if (keys["d"] || keys["ArrowRight"]) spirit.x += spirit.speed;

    ctx.fillStyle = "cyan";
    ctx.beginPath();
    ctx.arc(spirit.x, spirit.y, spirit.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // HUD
  healthEl.textContent = host ? Math.floor(hostHealth) : "—";
  scoreEl.textContent = score;

  requestAnimationFrame(gameLoop);
}

gameLoop();
