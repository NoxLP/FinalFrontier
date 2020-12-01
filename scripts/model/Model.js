import { game, player } from "../main.js";
import { Enemy } from "../model/Enemy.js";
import { BonusEnemy } from "../model/BonusEnemy.js";
import { ObjectPool } from "../model/ObjectPool.js";
import { Grid } from "./Grid.js";

export class Model {
  constructor(enemiesPerRow, canvasWidth, canvasHeight) {
    this.siEnemiesPerRow = enemiesPerRow;
    //this.siEnemies = [];
    this.enemiesSize = [
      [50, 50],
      [65, 65],
      [80, 80]
    ];

    this.grid = new Grid(canvasWidth, canvasHeight, this);

    this.finalBoss;

    this.bonus;
    this.bonusSize = [80, 100];
    this.bonusPointsRange = [50, 450];

    this.playerSize = [80, 80];
    this.playerInitialCoords = [
      (canvasWidth / 2) - (this.playerSize[0] / 2),
      (this.grid.canvasRowHeight * (this.grid.canvasRows - 1)) + (this.grid.canvasRowHeight / 2) - (this.playerSize[1] / 2)
    ];

    this.enemiesPool = new ObjectPool();
    this.enemiesBulletsPool = new ObjectPool();
    this.playerBulletsPool = new ObjectPool();
  }
  /**
   * Remove enemy
   * @param {Enemy} enemy Enemy to remove
   */
  removeEnemy(enemy, givePoints = true) {
    if (givePoints)
      game.points += (enemy.type + 1) * 100;

    console.log("Enemy destroyed ", enemy)

    if(enemy.myMovementTween)
      enemy.myMovementTween.stop();
    this.createExplosion(enemy);
    this.enemiesPool.storeObject(enemy);

    if (game.gameState === "spaceInvaders") {
      this.grid.removeEnemy(enemy);
      
      cancelAnimationFrame(enemy.moveAnimationId);
      clearTimeout(enemy.moveAnimationId);

      if (!this.grid.someEnemyIsAlive()) {
        game.startScrollVertical();
      }
    }
  }
  /**
   * Player killed, remove player
   */
  removePlayer() {
    player.elem.style.display = "none";
    game.playerInputController.responsive = false;
    player.collisionable = false;
    game.stopAllPlayerMovements();
  }
  /**
   * Remove bonus ship
   */
  removeBonusEnemy() {
    let points = Math.round((Math.random() * this.bonusPointsRange[1]) + this.bonusPointsRange[0]);
    let pointsPopup = document.createElement("p");
    pointsPopup.innerText = points;
    pointsPopup.style.left = `${this.bonus.x + this.bonus.width + 25}px`;
    pointsPopup.style.top = `${this.bonus.y}px`;
    pointsPopup.classList.add("pointsPopup");
    game.canvas.appendChild(pointsPopup);

    setTimeout(() => { pointsPopup.classList.add("pointsPopupAnimation"); }, 50);
    setTimeout(() => { game.canvas.removeChild(pointsPopup); }, 2000);

    game.points += points;
    this.createExplosion(this.bonus);
    this.bonus.resetPosition();
    setTimeout(() => { this.bonus.move(); }, game.enemiesMovementController.bonusTimeout);
  }
  /**
   * Create explosion when enemy gets destroyed
   * @param {CollisionableObject} collidingObject Enemy destroyed
   */
  createExplosion(collidingObject) {
    game.audio.playAudio("assets/music/sounds/explosion.mp3");

    let explosion = new Image();
    explosion.src = "assets/images/spaceships/playerExplosion.gif";
    explosion.classList.add("explosion");
    explosion.style.width = `${collidingObject.width + 25}px`;
    explosion.style.height = `${collidingObject.height + 25}px`;
    explosion.style.top = `${collidingObject.y}px`;
    explosion.style.left = `${collidingObject.x}px`;

    game.canvas.appendChild(explosion);
    setTimeout(() => {
      game.canvas.removeChild(explosion);
    },
      400);
  }
  /**
   * Create bonus ship and starts movement
   */
  createBonusEnemy() {
    /* 
    Creamos la nave.
    Se mueve hasta salirse del canvas y se para.
    Cuando salga de la pantalla se hace transparente.
    Despues de 30 seg vuelve a ser visible en la posición de salida.
    */
    this.bonus = new BonusEnemy();
    setTimeout(() => { this.bonus.move(); }, (Math.random() * game.enemiesMovementController.bonusTimeout * 0.5) + (game.enemiesMovementController.bonusTimeout * 0.5));
  }
  /**
   * TODO: Create the final boss
   * @todo create the final boss
   */
  createFinalBoss() {

  }
}