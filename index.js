const canvas = document.getElementsByTagName("canvas")[0];
canvas.width = innerWidth;
canvas.height = innerHeight;

const ctx = canvas.getContext("2d");
const x = canvas.width / 2;
const y = canvas.height / 2;

let score = 0;
const scoreElement = document.getElementById("scoreEl");

//initialize projectiles Array which is initially empty
const projectiles = [];
//initialize enemies array which is initially empty
const enemies = [];
const particles = [];

const friction = 0.99;

class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.radius = radius;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.radius = radius;
    this.velocity = velocity;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }

  update() {
    this.draw();
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.alpha -= 0.01;
  }
}

//intitialoze player
const player = new Player(x, y, 10, "white");

let animationID;

function animate() {
  animationID = requestAnimationFrame(animate);
  ctx.fillStyle = "rgba(0,0,0,0.1)";
  ctx.fillRect(0, 0, 2 * x, 2 * y);
  player.draw();

  particles.forEach((particle, index) => {
    if (particle.alpha <= 0) {
      particles.splice(index, 1);
    } else particle.update();
  });

  projectiles.forEach((projectile, projectileID) => {
    projectile.update();
    //remove projectiles from array as they go out of screen
    if (
      projectile.x + projectile.radius < 0 ||
      projectile.x - projectile.radius > 2 * x ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > 2 * y
    ) {
      setTimeout(() => {
        projectiles.splice(projectileID, 1);
      }, 0);
    }
  });

  enemies.forEach((enemy, enemyID) => {
    enemy.update();

    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    if (dist - enemy.radius - player.radius < 1) {
      cancelAnimationFrame(animationID);
      addEventListener("click", (e) => {
        location.reload();
      });
    }

    projectiles.forEach((projectile, projectileID) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

      //projectiles and enemy collide

      if (dist - enemy.radius - projectile.radius < 1) {
        //increment score

        //create explosions
        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 2,
              enemy.color,
              {
                x: (Math.random() - 0.5) * (Math.random() * 8),
                y: (Math.random() - 0.5) * (Math.random() * 8),
              }
            )
          );
        }
        if (enemy.radius - 10 > 5) {
          //   gsap.to(enemy, {
          //     radius: enemy.radius - 10,
          //   });
          //increment score
          score += 10;
          scoreElement.innerHTML = score;

          enemy.radius -= 10;
          setTimeout(() => {
            projectiles.splice(projectileID, 1);
          }, 0);
        } else {
          score += 30;
          scoreElement.innerHTML = score;
          setTimeout(() => {
            enemies.splice(enemyID, 1);
            projectiles.splice(projectileID, 1);
          });
        }
      }
    });
  });
}

function spawnEnemies() {
  setInterval(() => {
    const radius = Math.random() * 22 + 8;

    let enemyX;
    let enemyY;

    if (Math.random() < 0.5) {
      enemyX = Math.random() < 0.5 ? 0 - radius : 2 * x + radius;
      enemyY = Math.random() * (2 * y);
    } else {
      enemyX = Math.random() * (2 * x);
      enemyY = Math.random() < 0.5 ? 0 - radius : 2 * y + radius;
    }

    color = `hsl(${Math.random() * 360},50%,50%)`;

    const angle = Math.atan2(y - enemyY, x - enemyX);
    const velocity = {
      x: Math.cos(angle) * 1,
      y: Math.sin(angle) * 1,
    };

    enemies.push(new Enemy(enemyX, enemyY, radius, color, velocity));
  }, 1000);
}

addEventListener("click", (e) => {
  //console.log(e);
  console.log(projectiles);

  const angle = Math.atan2(event.clientY - y, event.clientX - x);
  const velocity = {
    x: Math.cos(angle) * 4,
    y: Math.sin(angle) * 4,
  };
  projectiles.push(new Projectile(x, y, 5, "white", velocity));
});

animate();
spawnEnemies();
