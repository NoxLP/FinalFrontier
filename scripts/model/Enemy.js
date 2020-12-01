import { CollisionableObject } from "./base/CollisionableObject.js";
import { EnemyBullet } from "./bullets/EnemyBullet.js";
import { game, player } from "../main.js";
import { Tween } from "../tweens/Tween.js";

/**
 * Used to give each enemy an unique id
 */
var lastId = -1;

/**
 * Class for enemies
 */
export class Enemy extends CollisionableObject {
  /**
   * Enemy's constructor
   * @param {number} type Enemy's type
   * @param {number} x X coordinate where to create the enemy
   * @param {number} y Y coordinate where to create the enemy
   * @param {number} row Row index of enemy if in "space invaders" part
   * @param {number} column Column index of enemy if in "space invaders" part
   */
  constructor(type, x, y, row, column) {
    let elem = new Image();
    elem.src = `assets/images/spaceships/enemy${type}.png`;
    elem.classList.add("enemy");
    super(elem, x, y, game.model.enemiesSize[type][0], game.model.enemiesSize[type][1]);

    this.id = ++lastId;
    this.type = type;

    this.row = row;
    this.column = column;

    this.myMovementTween;
  }
  /**
   * Getter for enemy's type
   */
  get type() { return this._type; }
  /**
   * Setter for enemy's type
   */
  set type(value) {
    this._type = value;
    this.elem.src = `assets/images/spaceships/enemy${this._type}.png`;
    this.width = game.model.enemiesSize[this._type][0];
    this.height = game.model.enemiesSize[this._type][1];
    this.update();
  }
  /**
   * Getter for canvas column in which the enemy are currently positioned. Used in "space invaders" part.
   */
  get canvasColumn() { return Math.round(this.x / game.enemiesMovementController.canvasColumnWidth); }
  /**
   * Getter for canvas row in which the enemy are currently positioned. Used in "space invaders" part.
   */
  get canvasRow() { return Math.round(this.y / game.enemiesMovementController.canvasRowHeight); }
  /**
   * Move enemy to the initial position automatically, without animation. Used in "space invaders" part to reset enemies movement.
   */
  teleportToInitialPosition() {
    let coords = game.model.grid.calculateCoordinatesByPosition(this.type, this.row, this.column);
    this.x = coords[0];
    this.y = coords[1];
    if (this.elem.style.display === "none") {
      this.elem.style.display = "inline";
    }
    if (!this.collisionable)
      this.collisionable = true;
  }
  /**
   * Move enemy to the established point using easing functions that can be found at easings.js file. Used in "scroll vertical" part enemies movement.
   * @param {array} point Array of coordinates [x, y]
   * @param {float} speedFactor Factor of speed of the movement
   * @param {function} leftEasing Easing function to be applied to the X axis
   * @param {function} topEasing Easing function to be applied to the Y axis
   */
  moveToPoint(point, speedFactor, leftEasing, topEasing, finalCallback, shoots = 2) {
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
        game.enemyCollidesWithPlayer(this);
      }
    }

    this.myMovementTween = new Tween(
      this,
      speedFactor,
      point,
      shoots,
      topEasing,
      leftEasing,
      checkIfCollideWithPlayerEachFrame,
      finalCallback
    );

    this.myMovementTween.start();
  }
  /**
   * Normalize a 2d coordinates vector.
   * @param {array} arr Array to normalize
   */
  normalizeVector(arr) {
    var length = Math.sqrt((arr[0] ** 2) + (arr[1] ** 2));
    return [arr[0] / length, arr[1] / length];
  }
  /**
   * Shoot one bullet. It shoots the correct bullet wither if the game is on "space invaders" or "scroll vertical" state.
   */
  shoot() {
    this.audio = game.audio.playAudio("assets/music/sounds/enemyLaser.mp3");
    let bullet, bulletInitialCoords = [this.centerX, this.centerY];
    if (game.gameState === "spaceInvaders") {
      bullet = game.model.enemiesBulletsPool.getNewObject(() => new EnemyBullet(
        this.x, this.y + this.height - game.bulletSize[1]), this.x, this.y + this.height - game.bulletSize[1]);
      bullet.move([0, 1]);
    } else {
      let direction;
      switch (this.type) {
        case 0:
          direction = this.normalizeVector([player.x - this.x, player.y - this.y]);
          bullet = game.model.enemiesBulletsPool.getNewObject({
            x: bulletInitialCoords[0],
            y: bulletInitialCoords[1]
          });/*
            () => 
            new EnemyBullet(bulletInitialCoords[0], bulletInitialCoords[1]), 
            bulletInitialCoords[0], 
            bulletInitialCoords[1]);*/
          bullet.move(direction);
          break;
        case 1:
          if (Math.random() > 0.5) { //horizontal
            bullet = game.model.enemiesBulletsPool.getNewObject({
              x: bulletInitialCoords[0],
              y: bulletInitialCoords[1]
            });
              //() => new EnemyBullet(bulletInitialCoords[0], bulletInitialCoords[1]), bulletInitialCoords[0], bulletInitialCoords[1]);
            bullet.move([1, 0]);
            bullet = game.model.enemiesBulletsPool.getNewObject({
              x: bulletInitialCoords[0],
              y: bulletInitialCoords[1]
            });
              //() => new EnemyBullet(bulletInitialCoords[0], bulletInitialCoords[1]), bulletInitialCoords[0], bulletInitialCoords[1]);
            bullet.move([-1, 0]);
          } else { //vertical
            bullet = game.model.enemiesBulletsPool.getNewObject({
              x: bulletInitialCoords[0],
              y: bulletInitialCoords[1]
            });
              //() => new EnemyBullet(bulletInitialCoords[0], bulletInitialCoords[1]), bulletInitialCoords[0], bulletInitialCoords[1]);
            bullet.move([0, 1]);
            bullet = game.model.enemiesBulletsPool.getNewObject({
              x: bulletInitialCoords[0],
              y: bulletInitialCoords[1]
            });
              //() => new EnemyBullet(bulletInitialCoords[0], bulletInitialCoords[1]), bulletInitialCoords[0], bulletInitialCoords[1]);
            bullet.move([0, -1]);
          }
          break;
        case 2:
          direction = [0, 1];
          for (let i = 0; i < 4; i++) {
            bullet = game.model.enemiesBulletsPool.getNewObject({
              x: bulletInitialCoords[0],
              y: bulletInitialCoords[1]
            });
              //() => new EnemyBullet(bulletInitialCoords[0], bulletInitialCoords[1]), bulletInitialCoords[0], bulletInitialCoords[1]);
            bullet.move(direction);
            direction = [direction[1], -direction[0]];
          }
          break;
      }
    }
  }
}