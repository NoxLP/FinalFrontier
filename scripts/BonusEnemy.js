import { CollisionableObject } from "./base/CollisionableObject.js";
import { game } from "./main.js";

/**
 * Class for bonus enemy
 */
export class BonusEnemy extends CollisionableObject {
  constructor() {
    let elem = new Image();
    elem.src = `assets/images/spaceships/bonus.png`;
    elem.classList.add("bonusEnemy");
    super(elem, -game.bonusSize[0] - 15, 0, game.bonusSize[0], game.bonusSize[1]);

    this.animationFrameId = null;
  }
  /**
   * Sends the bonus enemy to the initial position instantly.
   */
  resetPosition() {
    this.elem.style.display = "none";
    this.x = -this.elem.width - 15;
    this.y = 0;
    this.collisionable = false;
  }
  /**
   * Cancel move anmiation.
   */
  cancelAnimation() {
    cancelAnimationFrame(this.animationFrameId);
    clearTimeout(this.animationFrameId);
  }
  /**
   * Executes bonus enemy movement(horizontal from left to right).
   */
  move() {
    if(this.x < game.width){
      this.x += game.siEnemyFrameStep;
      this.animationFrameId = window.requestAnimationFrame(() => {this.move();});
    } else {
      this.resetPosition();
      this.cancelAnimation();
      this.animationFrameId = setTimeout(() => { 
        this.animationFrameId = window.requestAnimationFrame(() => {
          this.x = - this.width;
          this.elem.style.display = "inline";
          this.collisionable = true;
          this.move();
        });
      }, game.bonusTimeout);
    }
  }
}