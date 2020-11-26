import { easings } from "./easings.js";
import { game } from "../main.js";

export class Tween {
  /**
   * Class to animate enemies movement
   * @param {Enemy} enemy Enemy to move
   * @param {number} speedFactor Factor to be multiplied by game.svEnemySpeed 
   * @param {array} finalPoint Array of coorfinates of movements's final point
   * @param {number} numberOfShoots Number of times the enemy shoot dureing the tween
   * @param {function} topEasing Easing for Y coordinate. Usually from easings object defined in easings.js
   * @param {function} leftEasing Easing for X coordinate. Usually from easings object defined in easings.js
   * @param {function} tickCallback Function to be called every tick
   * @param {function} finalCallback Function to be called when tween is over
   */
  constructor(enemy, speedFactor, finalPoint, numberOfShoots, topEasing, leftEasing, tickCallback, finalCallback) {
    this._enemy = enemy;
    this._speedFactor = speedFactor;
    this._initialPoint = [enemy.x, enemy.y];
    this._finalPoint = finalPoint;
    this._topEasing = topEasing;
    this._leftEasing = leftEasing;
    this._tickCallback = tickCallback;
    this._finalCallback = finalCallback;

    this._xDistance = 0;
    this._yDistance = 0;
    this._percentagePerStep;
    this._xPercentage = 0;
    this._yPercentage = 0;

    this._numberOfShoots = numberOfShoots;
    this._shootPercentages = [];

    this._frameRequestId = null;
    this._tweenRunning = false;
    this._tweenPaused = false;
    this.stopWithoutCallback = false;
  }
  //#region getters/setters
  get enemy() { return this._enemy; }
  set enemy(value) {
    if (!this._tweenRunning)
      this._enemy = value;
  }
  get speedFactor() { return this._speedFactor; }
  set speedFactor(value) {
    if (!this._tweenRunning)
      this._speedFactor = value;
  }
  get initialPoint() { return this._initialPoint; }
  set initialPoint(value) {
    if (!this._tweenRunning)
      this._initialPoint = value;
  }
  get finalPoint() { return this._finalPoint; }
  set finalPoint(value) {
    if (!this._tweenRunning)
      this._finalPoint = value;
  }
  get topEasing() { return this._topEasing; }
  set topEasing(value) {
    if (!this._tweenRunning)
      this._topEasing = value;
  }
  get leftEasing() { return this._leftEasing; }
  set leftEasing(value) {
    if (!this._tweenRunning)
      this._leftEasing = value;
  }
  get tickCallback() { return this._tickCallback; }
  set tickCallback(value) {
    if (!this._tweenRunning)
      this._tickCallback = value;
  }
  get finalCallback() { return this._finalCallback; }
  set finalCallback(value) {
    if (!this._tweenRunning)
      this._finalCallback = value;
  }
  get started() { return this._tweenRunning; }
  get running() { return this._tweenRunning && !this._tweenPaused; }
  get paused() { return this._tweenPaused; }
  //#endregion
  /**
   * Start tween
   */
  start() {
    this._xDistance = this._finalPoint[0] - this._enemy.x;
    this._yDistance = this._finalPoint[1] - this._enemy.y;
    this._percentagePerStep = 1 / (game.svEnemySpeed * this._speedFactor);

    if (this._numberOfShoots) {
      /* F.i.:
      shoots
      number of shoots = 2
      1 / (nSh + 1) => shootPercentage => 0.33333, 0.6666 
      */
      let percentagePerShoot = 1 / (this._numberOfShoots + 1);
      for (let i = 1; i <= this._numberOfShoots; i++) {
        this._shootPercentages.push(+(((percentagePerShoot * i) - (Math.random() * this._percentagePerStep * 100)).toFixed(4)));
      }
    }

    this._tweenRunning = true;
    this._tweenPaused = false;

    this._tick();
  }
  /**
   * Pause/unpause tween.
   */
  pause() {
    this._tweenPaused = !this._tweenPaused;
  }
  /**
   * Stop tween.
   */
  stop() {
    this._tweenRunning = false;
  }
  /**
   * Reset tween to original values. Use when you want the tween to restart, but pause or stop it first.
   */
  reset() {
    if (this._tweenRunning && !this._tweenPaused) {
      console.log("Can not reset a tween while running and not paused");
      return;
    }

    this._currentSteps = 0;
    this._totalSteps = 0;
    this._xStep = 0;
    this._yStep = 0;
    this._tweenPaused = false;

    if (this._frameRequestId)
      cancelAnimationFrame(this._frameRequestId);
    this._frameRequestId = null;
  }
  /**
   * Private function to calculate distance from the current point to the final point
   */
  _distanceToFinalPoint() {
    return [Math.abs(this._enemy.x - this._finalPoint[0]), Math.abs(this._enemy.y - this._finalPoint[1])];
  }
  /**
   * Function executed every tick during the animation. It's the function that effectively do the movement animation
   */
  _tick() {
    if (this._tweenRunning && !this._tweenPaused) {
      let currentDistanceToFinal = this._distanceToFinalPoint();

      if (currentDistanceToFinal[0] > this._percentagePerStep ||
        currentDistanceToFinal[1] > this._percentagePerStep) {
        this._xPercentage += this._percentagePerStep;
        this._yPercentage += this._percentagePerStep;
        this._enemy.x = this._initialPoint[0] + (this._leftEasing(this._xPercentage) * this._xDistance);
        this._enemy.y = this._initialPoint[1] + (this._topEasing(this._yPercentage) * this._yDistance);

        if (this._numberOfShoots &&
          this._enemy.x > 0 && this._enemy.x < game.width &&
          this._enemy.y > 0 && this._enemy.y < game.height &&
          this._shootPercentages.some(perc => this._xPercentage > perc - (this._percentagePerStep * 0.5) &&
            this._xPercentage < perc + (this._percentagePerStep * 0.5)))
          this._enemy.shoot();

        if (this._tickCallback)
          this._tickCallback();

        this._frameRequestId = window.requestAnimationFrame(() => { this._tick(); });
      } else {
        this.stop();
        this._frameRequestId = window.requestAnimationFrame(() => { this._tick(); });
      }
    } else if (this._tweenPaused) {
      this._frameRequestId = window.requestAnimationFrame(() => { this._tick(); });
    } else if (!this._tweenRunning) {
      this.reset();
      if (this._finalCallback && !this.stopWithoutCallback) {
        this._finalCallback();
      }
    }
  }
}