import { game, player } from "../main.js";

export class ControllerBackground {
  constructor(){
    this.background = document.getElementById("movingBackg");
    this.backgroundBottom = 5200;
    this.backgroundMoveTimerId;
  }
  /**
   * Start scroll vertical part of the game. Start to move background, start new enemies movements, show message, etc.
   */
  startScrollVertical() {
    /*
    Mover background
    Empiezan a aparecer enemigos de scroll vertical
    */
    game.gameState = "SV";
    player.responsive = false;
    game.stopAllPlayerMovements();
    game.showMessage("Stage 1 cleared. All engines ON");

    for (let i = 0; i < game.model.siEnemies.length; i++) {
      for (let j = 0; j < game.model.siEnemies[i].length; j++) {
        let enemy = game.model.siEnemies[i][j];
        if (enemy.moveAnimationId) {
          cancelAnimationFrame(enemy.moveAnimationId);
          clearTimeout(enemy.moveAnimationId);
        }
        enemy.elem.style.display = "none";
        game.canvas.removeChild(enemy.elem);
      }
    }
    game.model.siEnemies = [];

    setTimeout(() => {
      player.responsive = true;
      this.moveBackgroundDown();
      game.enemiesMovementController.scrollVerticalEnemiesMovements();
    }, 3000);
  }
  /**
   * Move background down. Used in "scroll vertical" part.
   */
  moveBackgroundDown() {
    this.backgroundBottom -= 0.9;
    this.background.style.bottom = `${this.backgroundBottom}px`
    this.backgroundMoveTimerId = window.requestAnimationFrame(() => { this.moveBackgroundDown(); });
  }
  /**
   * Stop background going down. Used to stop the background so the player can face the final boss.
   */
  stopBackground() {
    cancelAnimationFrame(this.backgroundMoveTimerId);
    this.backgroundBottom = 5200;
    this.background.style.bottom = `${this.backgroundBottom}px`
  }
}