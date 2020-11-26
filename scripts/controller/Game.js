import { Enemy } from "../Enemy.js";
import { BonusEnemy } from "../BonusEnemy.js";
import { game, player, menu } from "../main.js";
import { PointsCounter } from "../PointsCounter.js";
import { ObjectPool } from "../ObjectPool.js";
import { Sounds } from "../Sounds.js";
import { Boss } from "../Boss.js";
import { ControllerEnemiesMovement } from "./ControllerEnemiesMovement.js";

/**
 * Class for control them all
 */
export class Game {
  /**
   * Game constructor.
   * @param {number} enemiesPerRow Number of enemies per row when the game is at the "space invaders" part.
   */
  constructor(enemiesPerRow) {
    this.gameState = "spaceInvaders";
    this.step = 9;
    this.bulletStep = 15;
    this.bulletTimeout = 250;

    this.background = document.getElementById("movingBackg");
    this.backgroundBottom = 5200;
    this.backgroundMoveTimerId;

    this.canvas = document.getElementById("game");
    this.width = 1900;
    this.height = 870;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.enemiesMovementController = new ControllerEnemiesMovement(enemiesPerRow, this.width, this.height);

    this.siEnemies = [];
    this.siEnemiesPerRow = enemiesPerRow;
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
      (this.width / 2) - (this.playerSize[0] / 2),
      (this.enemiesMovementController.canvasRowHeight * (this.enemiesMovementController.canvasRows - 1)) + (this.enemiesMovementController.canvasRowHeight / 2) - (this.playerSize[1] / 2)
    ];
    this.bulletSize = [60, 50];

    this._points = 0;
    this.pointsCounter = new PointsCounter(50);

    this.svEnemiesPool = new ObjectPool();
    this.enemiesBulletsPool = new ObjectPool();

    this.audio = new Sounds(0.3);

    this.messagePopup = document.createElement("p");
    this.messagePopup.classList.add("levelClearedPopup");
    this.messagePopup.style.display = "none";
    this.messagePopup.style.zIndex = 100000;
    this.canvas.appendChild(this.messagePopup);
  }

  /**
   * Getter for current player points.
   */
  get points() { return this._points; }
  /**
   * Setter for player points. It initiates points earned animation automatically.
   */
  set points(total) {
    this._points = total;
    this.pointsCounter.showedPoints = total;
  }

  /************************************************************************************************************/
  /****************************************** MODEL - CREATE/REMOVE *******************************************/
  //#region
  /**
   * Remove enemy
   * @param {Enemy} enemy Enemy to remove
   */
  removeEnemy(enemy, givePoints = true) {
    if (givePoints)
      this.points += (enemy.type + 1) * 100;

    if (this.gameState === "spaceInvaders") {
      //Remove enemy image from DOM and object from array. No more references are ever created, so garbage collector should remove it rom memory
      enemy.elem.style.display = "none";
      enemy.collisionable = false;

      cancelAnimationFrame(enemy.moveAnimationId);
      clearTimeout(enemy.moveAnimationId);
      this.createExplosion(enemy);

      if (this.siEnemies.every(x => x.every(e => e.elem.style.display === "none"))) {
        this.startScrollVertical();
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
    this.stopAllPlayerMovements();
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
    this.canvas.appendChild(pointsPopup);

    setTimeout(() => { pointsPopup.classList.add("pointsPopupAnimation"); }, 50);
    setTimeout(() => { this.canvas.removeChild(pointsPopup); }, 2000);

    this.points += points;
    this.createExplosion(this.bonus);
    this.bonus.resetPosition();
    setTimeout(() => { this.bonus.move(); }, this.enemiesMovementController.bonusTimeout);
  }
  /**
   * Returns DOM coordinates for initial enemy position. Used in "space invaders" part to calculate the coordinates of an enemy based on its position in the array siEnemies.
   * @param {number} row 
   * @param {number} column 
   */
  calculateCoordinatesByPosition(row, column) {
    //margen + ((total ancho / numero de naves) * numero nave actual)
    const enemyType = Math.ceil(row / 2);
    return [
      (this.enemiesMovementController.canvasColumnWidth * (column + 0.5)) - (this.enemiesSize[enemyType][0] / 2),
      (this.enemiesMovementController.canvasRowHeight * (row + 1.5)) - (this.enemiesSize[enemyType][1] / 2)
    ];
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
        let coords = this.calculateCoordinatesByPosition(i, j);
        this.siEnemies[i].push(new Enemy(Math.ceil(i / 2), coords[0], coords[1], i, j));
      }
    }
  }
  /**
   * Create explosion when enemy gets destroyed
   * @param {CollisionableObject} collidingObject Enemy destroyed
   */
  createExplosion(collidingObject) {
    this.audio.playAudio("assets/music/sounds/explosion.mp3");

    let explosion = new Image();
    explosion.src = "assets/images/spaceships/playerExplosion.gif";
    explosion.classList.add("explosion");
    explosion.style.width = `${collidingObject.width + 25}px`;
    explosion.style.height = `${collidingObject.height + 25}px`;
    explosion.style.top = `${collidingObject.y}px`;
    explosion.style.left = `${collidingObject.x}px`;

    this.canvas.appendChild(explosion);
    setTimeout(() => {
      this.canvas.removeChild(explosion);
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
  //#endregion
  /************************************************************************************************************/
  /********************************************* ENEMIES MOVEMENT *********************************************/
  //#region 
  
  //#endregion
  /************************************************************************************************************/
  /************************************************* HELPERS **************************************************/
  //#region
  /**
   * An enemy collides with player. Kill both the enemy and the player, player lose a live, the game reset or is game over if the player have no more lives.
   * @param {Enemy} enemy Enemy that collides with player
   */
  enemyCollidesWithPlayer(enemy) {
    this.removeEnemy(enemy, false);
    this.playerHitted();
  }
  /**
   * Handles final boss colliding with player.
   */
  bossCollideWithPlayer() {
    this.playerHitted();
    this.finalBoss.bossHitted();
  }
  /**
   * The player gets hitted by an object
   */
  playerHitted() {
    /*
    if vidas > 1
      Explosiones
      desaparece player
      parar enemigos
      parar nave bonus
      Jugador pierde vida => player.lives
      En el contador pierde una vida => classList.add(liveLost)
      ¿mensaje?
      TIMEOUT
      Reset
        jugador volver a position inicial
        enemigos volver a position inicial
          moverlos a su sitio
          dejar de ser transparentes
          vuelvan a ser colisionables
    else
      game over
    */
    player.responsive = false;
    this.createExplosion(player);
    this.removePlayer();
    this.enemiesMovementController.cancelAllEnemiesMovement();

    if (this.bonus) {
      this.bonus.cancelAnimation();
      this.bonus.resetPosition();
    }

    player.loseLive();

    if (player.lives > 0) {
      setTimeout(() => { this.showMessage("You lost a life"); }, 500);

      this.svEnemiesPool.storeAllObjects();
      setTimeout(() => {
        player.responsive = true;

        if (this.finalBoss && this.finalBoss.elem.display !== "none") {
          this.enemiesMovementController.bossMovements(0);
        } else if (this.gameState === "spaceInvaders") {
          this.siReset();
          this.enemiesMovementController.moveSpaceInvadersEnemies();
          this.enemiesMovementController.moveBonusEnemy();
        } else {
          this.enemiesMovementController.scrollVerticalEnemiesMovements();
        }

        player.responsive = true;
        player.collisionable = true;
        player.elem.style.display = "inline";
      }, 5000);
    } else {
      setTimeout(() => { this.gameOver(); }, 1000);
    }
  }
  /**
   * Stop all player movements and shooting. It does NOT make the player unresponsive, just sto pthe current movement and shooting.
   */
  stopAllPlayerMovements() {
    player.playerDirection = [0, 0];
    player.shooting = false;
  }
  //#endregion
  /************************************************************************************************************/
  /*********************************************** GAME STATE *************************************************/
  /**
   * Game over. You know, message, reset all, go back to the menu, etc.
   */
  gameOver() {
    this.enemiesMovementController.cancelAllEnemiesMovement();
    this.audio.changeMusicByGameState();
    this.showMessage("Game Over");
    this.audio.playAudio("assets/music/sounds/gameOver.mp3");

    setTimeout(() => {
      if (this.finalBoss && this.finalBoss.elem.style.display !== "none")
        this.finalBoss.hide();

      player.resetLives();
      this.points = 0;
      this.pointsCounter.reset();
      this.siReset();
      menu.goToMenu();
    }, 2500);
  }
  /**
   * Reset game when in "space invaders" part. Do NOT reset lives and points. Move player to initial coordinates, move enemies and bonus ship to initial coordinates and restart their movement.
   */
  siReset() {
    player.teleportToInitialPosition();

    //All enemies to initial position
    for (let i = 0; i < this.siEnemies.length; i++) {
      for (let j = 0; j < this.siEnemies[i].length; j++) {
        this.siEnemies[i][j].teleportToInitialPosition();
      }
    }

    if (this.bonus) {
      this.bonus.cancelAnimation();
      this.bonus.resetPosition();
    }
  }
  /**
   * Show message text in the middle of the screen.
   * @param {string} message Message to show
   */
  showMessage(message) {
    this.messagePopup.innerText = message;
    this.messagePopup.style.display = "inline-block";
    setTimeout(() => { this.hideMessage() }, 3000);
  }
  /**
   * Hide message showed using showMessage function.
   */
  hideMessage() {
    this.messagePopup.style.display = "none";
  }
  /**
   * Start scroll vertical part of the game. Start to move background, start new enemies movements, show message, etc.
   */
  startScrollVertical() {
    /*
    Mover background
    Empiezan a aparecer enemigos de scroll vertical
    */
    this.gameState = "SV";
    player.responsive = false;
    this.stopAllPlayerMovements();
    this.showMessage("Stage 1 cleared. All engines ON");

    for (let i = 0; i < this.siEnemies.length; i++) {
      for (let j = 0; j < this.siEnemies[i].length; j++) {
        let enemy = this.siEnemies[i][j];
        if (enemy.moveAnimationId) {
          cancelAnimationFrame(enemy.moveAnimationId);
          clearTimeout(enemy.moveAnimationId);
        }
        enemy.elem.style.display = "none";
        this.canvas.removeChild(enemy.elem);
      }
    }
    this.siEnemies = [];

    setTimeout(() => {
      player.responsive = true;
      this.moveBackgroundDown();
      this.enemiesMovementController.scrollVerticalEnemiesMovements();
    }, 3000);
  }
  /**
   * Handle player wins the game when kills the final boss.
   */
  playerWins() {
    /*
    Parar movimientos: enemigos, bonus, ¿player?
    Mensaje "Has ganado! tu puntuación fue de :...." 
    resetear vidas y puntos.
    volver al menú.
    */
    this.enemiesMovementController.cancelAllEnemiesMovement();
    this.stopAllPlayerMovements();
    player.responsive = false;

    setTimeout(() => {
      this.showMessage(`You Won Crack. Your points are: ${this.pointsCounter.showedPoints}`);
      player.resetLives();
      this.pointsCounter.reset();
      setTimeout(() => {
        document.getElementById("menu").style.display = "block";
        document.getElementById("background").style.display = "none";
      }, 3000);
    }, 1000);
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
  /**
   * Start the game. Called when the player clicks on the menu start button.
   */
  start() {
    this.stopBackground();
    this.gameState = "spaceInvaders";
    player.responsive = true;
    player.collisionable = true;
    this.audio.changeMusicByGameState();

    if (!this.siEnemies || this.siEnemies.length === 0)
      this.createEnemies();
    this.enemiesMovementController.moveSpaceInvadersEnemies();
    this.createBonusEnemy();
  }
  /************************************************************************************************************/
  /************************************************* CHEATS ***************************************************/
  /**
   * Cheat to go instantly to the final boss.
   */
  cheatToFinal() {
    this.enemiesMovementController.cancelAllEnemiesMovement();
    cancelAnimationFrame(this.backgroundMoveTimerId);
    this.finalBoss = new Boss();
    this.finalBoss.enterGame();
    this.backgroundBottom = -18625;
    this.background.style.bottom = `${this.backgroundBottom}px`
  }
}