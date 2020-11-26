import { CollisionableObject } from "./base/CollisionableObject.js";
import { game, player } from "./main.js";
import { Tween } from "./tweens/Tween.js";
import { easings } from "./tweens/easings.js";
import { EnemyBullet } from "./bullets/EnemyBullet.js";

/**
 * Boss class
 */
export class Boss extends CollisionableObject {
  constructor() {
    let elem = new Image();
    elem.src = "assets/images/spaceships/bossSpaceship.png";
    elem.classList.add("enemy");
    elem.style.display = "none";
    super(elem, (game.width / 2) - 400, -512, 650, 500);

    this.speed = 0.6;
    this._health = 10;
    this.myMovementTween;
    this._currentPattern = 0;
    this._shootPatterns = [
      [
        [1, 0], [0, 1], [-1, 0], [0, -1]
      ],
      [
        [1, 1], [1, -1], [-1, 1], [-1, -1]
      ],
      [
        [1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]
      ]
    ];
  }
  /**
   * Getter for boss health
   */
  get health() { return this._health; }
  /**
   * Setter for boss health. Do all the animations, explosions, etc.
   */
  set health(value) {
    this._health = value;
    if (this._health === 0) {
      game.createExplosion(this);
      this.hide();
      game.playerWins();
    }
  }

  /**
   * Animation for the boss entering the game for the first time
   */
  enterGame() {
    this.elem.style.display = "inline-block";
    this.collisionable = false;
    this.myMovementTween = new Tween(
      this,
      2,
      [this.x, 50],
      null,
      easings.linear,
      easings.linear,
      null,
      () => {
        setTimeout(() => {
          this.collisionable = true;
          game.bossMovements(0);
        }, 500);
      }
    );
    this.myMovementTween.start();
  }
  /**
   * Simply take the boss out of the screen
   */
  hide() {
    this.x = (game.width / 2) - 400;
    this.y = -512;
    this.elem.style.display = "none";
  }
  /**
   * Boss got hitted
   * @param {PlayerBullet} bullet Bullet that hits the boss
   */
  bossHitted(bullet) {
    game.createExplosion(bullet);
    this.health--;
  }
  /**
   * Move boss to the established point using easing functions that can be found at easings.js file.
   * @param {array} point Array of coordinates [x, y]
   * @param {function} leftEasing Easing function to be applied to the X axis
   * @param {function} topEasing Easing function to be applied to the Y axis
   */
  moveToPoint(point, leftEasing, topEasing) {
    if (this.myMovementTween) {
      //if enemy is already in the middle of a movement tween, better to return false. If want to cancel the current tween, one can always pause or stop it before beginning a new movement
      if (this.myMovementTween.running)
        return false;

      //if enemy was in a tween AND the tween was paused, stopped, or finished, then just check if it was only paused and stop it without calling the final callback
      if (this.myMovementTween.paused) {
        this.myMovementTween.stopWithoutCallback = true;
        this.myMovementTween.stop();
      }
    }

    const checkIfCollideWithPlayerEachFrame = () => {
      if (this.collideWith(player)) {
        game.bossCollideWithPlayer();
      }
    }

    this.myMovementTween = new Tween(
      this,
      this.speed,
      point,
      4,
      topEasing,
      leftEasing,
      () => { checkIfCollideWithPlayerEachFrame(); },
      null
    );

    this.myMovementTween.start();
  }
  /**
   * Boss shoot.
   */
  shoot() {
    this.audio = game.audio.playAudio("assets/music/sounds/enemyLaser.mp3");
    let bullet, bulletInitialCoords = [this.centerX, this.centerY];

    if (this._currentPattern === this._shootPatterns.length)
      this._currentPattern = 0;

    this._shootPatterns[this._currentPattern].forEach(direction => {
      bullet = game.enemiesBulletsPool.getNewObject(() => new EnemyBullet(
        this.centerX, this.centerY, this.x, this.y + this.height - game.bulletSize[1]));
      bullet.move(direction);
    });

    this._currentPattern++;
  }
}