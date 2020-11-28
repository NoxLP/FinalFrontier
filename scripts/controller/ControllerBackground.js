import { game, player } from "../main.js";

export class ControllerBackground {
  constructor(){
    this.background = document.getElementById("movingBackg");
    this._backgroundBottom = 5200;
    this.backgroundMoveTimerId;
  }
  get backgroundBottom() { return this._backgroundBottom; }
  set backgroundBottom(value) {
    this._backgroundBottom = value;
    this.background.style.bottom = `${this._backgroundBottom}px`
  }
  /**
   * Move background down. Used in "scroll vertical" part.
   */
  moveBackgroundDown() {
    this.backgroundBottom -= 0.9;
    this.backgroundMoveTimerId = window.requestAnimationFrame(() => { this.moveBackgroundDown(); });
  }
  /**
   * Stop background going down. Used to stop the background so the player can face the final boss.
   */
  stopBackground() {
    cancelAnimationFrame(this.backgroundMoveTimerId);
    this.backgroundBottom = 5200;
  }
}