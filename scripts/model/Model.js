import { game, player } from "../main.js";
import { Enemy } from "../model/Enemy.js";
import { BonusEnemy } from "../model/BonusEnemy.js";
import { ObjectPool } from "../model/ObjectPool.js";

export class Model {
  constructor(enemiesPerRow, canvasWidth, canvasRows, canvasRowHeight) {
    this.siEnemiesPerRow = enemiesPerRow;
    this.siEnemies = [];
    this.enemiesSize = [
      [50, 50],
      [65, 65],
      [80, 80]
    ];

    this.finalBoss;

    this.bonus;
    this.bonusSize = [80, 100];
    this.bonusPointsRange = [50, 450];

    this.playerSize = [80, 80];
    this.playerInitialCoords = [
      (canvasWidth / 2) - (this.playerSize[0] / 2),
      (canvasRowHeight * (canvasRows - 1)) + (canvasRowHeight / 2) - (this.playerSize[1] / 2)
    ];

    this.svEnemiesPool = new ObjectPool();
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

    if (game.gameState === "spaceInvaders") {
      //Remove enemy image from DOM and object from array. No more references are ever created, so garbage collector should remove it rom memory
      enemy.elem.style.display = "none";
      enemy.collisionable = false;

      cancelAnimationFrame(enemy.moveAnimationId);
      clearTimeout(enemy.moveAnimationId);
      this.createExplosion(enemy);

      if (this.siEnemies.every(x => x.every(e => e.elem.style.display === "none"))) {
        game.startScrollVertical();
      }
    } else {
      this.createExplosion(enemy);
      this.svEnemiesPool.storeObject(enemy);
    }
  }
  /**
   * Player killed, remove player
   */
  removePlayer() {
    player.elem.style.display = "none";
    player.responsive = false;
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
   * Create all "space invaders" part's enemies in their initial position
   */
  createEnemies() {
    /*
    tipo 1 => row 1, 2
    tipo 2 => row 3, 4
    
    tipo 1 => (tipo * 2) - 1, tipo * 2 => 2 - 1, 2 => 1, 2
    tipo 2 => (tipo * 2) - 1, tipo * 2 => 4 - 1, 4 => 3, 4
    
    row_1 = (tipo * 2) - 1
    row_2 = tipo * 2
    
    type = roundUp(row / 2)
    */
    /*
    enemies = []
    i = 0 => enemies = [[]]
    j = 0 => 
    j = 1 =>
    ...
    i = 1 => enemies = [[], []]
    i = 2 => enemies = [[], [], []]
    */
    for (let i = 0; i < 5; i++) {
      this.siEnemies.push([]);
      for (let j = 0; j < this.siEnemiesPerRow; j++) {
        let coords = game.calculateCoordinatesByPosition(i, j);
        this.siEnemies[i].push(new Enemy(Math.ceil(i / 2), coords[0], coords[1], i, j));
      }
    }
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