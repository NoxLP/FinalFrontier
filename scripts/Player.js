import { CollisionableObject } from "./base/CollisionableObject.js";
import { game } from "./main.js";
import { PlayerBullet } from "./bullets/PlayerBullet.js";

/**
 * Player class
 */
export class Player extends CollisionableObject {
  constructor() {
    let elem = new Image();
    elem.src = "assets/images/spaceships/player1.png";
    elem.id = "player";
    super(elem, game.playerInitialCoords[0], game.playerInitialCoords[1], game.playerSize[0], game.playerSize[1]);

    this.lastBulletTime = null;
    this.shootTimer;
    this._lives = 3;
    this.responsive = true;
    this.playerDirection = [0, 0];
    this.movementAnimationId;
    this.shooting = false;
  }
  /**
   * Getter for current player's lives
   */
  get lives() { return this._lives; }
  /**
   * Call this function every time the player lose a live
   */
  loseLive() {
    game.audio.playAudio("assets/music/sounds/playerLoseLive.wav", 0.3);

    let live = document.getElementById(`live${this._lives}`);
    live.style.filter = "brightness(0.3)";
    live.style.transition = "filter 1s ease-out";
    this._lives--;
    this.x = game.playerInitialCoords[0];
    this.y = game.playerInitialCoords[1];
  }
  /**
   * Reset player lives to 3
   */
  resetLives() {
    this._lives = 3;
    for (let i = 1; i < 4; i++) {
      let live = document.getElementById(`live${i}`);
      live.style.filter = "";
    }
  }
  /**
   * Move player spaceship while a movement key is pressed
   */
  move() {
    if (this.playerDirection[0] === 0 && this.playerDirection[1] === 0) {
      this.movementAnimationId = null;
      return;
    }

    let nextX = this.x + (this.playerDirection[0] * game.step);
    let nextY = this.y + (this.playerDirection[1] * game.step);

    if (nextX > 5 && nextX < game.width - this.width &&
      nextY > 5 && nextY < game.height - this.height) {
      this.x = nextX;
      this.y = nextY;
    }
    this.movementAnimationId = window.requestAnimationFrame(() => { this.move(); });
  }
  /**
   * Create bullets while the spacebar is pressed
   */
  shoot() {
    if (this.shooting) {
      const bullet = new PlayerBullet(
        this.centerX - (game.bulletSize[0] / 2),
        this.y - (game.bulletSize[1] * 0.5));
      /*
      Para mover la bala hacia arriba:
      1.- window.requestAnimationFrame(bullet.move)
      */
      bullet.move();
      if (!this.shootTimer)
        this.shootTimer = setInterval(() => { this.shoot(); }, game.bulletTimeout);
    } else {
      clearInterval(this.shootTimer);
      this.shootTimer = null;
    }
  }
  /**
   * Move the player spacechip automatically(without animation) to the player initial position
   */
  teleportToInitialPosition() {
    this.x = game.playerInitialCoords[0];
    this.y = game.playerInitialCoords[1];
    this.elem.style.display = "inline";
    this.responsive = true;
  }
}