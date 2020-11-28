import { Enemy } from "../model/Enemy.js";
import { player, menu } from "../main.js";
import { PointsCounter } from "../PointsCounter.js";
import { Sounds } from "../Sounds.js";
import { Boss } from "../model/Boss.js";
import { ControllerEnemiesMovement } from "./ControllerEnemiesMovement.js";
import { ControllerBackground } from "./ControllerBackground.js";
import { Model } from "../model/Model.js";

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
    this.bulletSize = [60, 50];

    this.canvas = document.getElementById("game");
    this.canvasRows = 10;
    this.width = 1900;
    this.height = 870;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.enemiesMovementController = new ControllerEnemiesMovement(enemiesPerRow, this.width, this.height, this.canvasRows);
    this.backgroundController = new ControllerBackground();
    this.model = new Model(enemiesPerRow, this.width, this.canvasRows, this.enemiesMovementController.canvasRowHeight);

    this._points = 0;
    this.pointsCounter = new PointsCounter(50);

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
  /************************************************* HELPERS **************************************************/
  //#region
  /**
   * Returns DOM coordinates for initial enemy position. Used in "space invaders" part to calculate the coordinates of an enemy based on its position in the array siEnemies.
   * @param {number} row 
   * @param {number} column 
   */
  calculateCoordinatesByPosition(row, column) {
    //margen + ((total ancho / numero de naves) * numero nave actual)
    const enemyType = Math.ceil(row / 2);
    return [
      (this.enemiesMovementController.canvasColumnWidth * (column + 0.5)) - (this.model.enemiesSize[enemyType][0] / 2),
      (this.enemiesMovementController.canvasRowHeight * (row + 1.5)) - (this.model.enemiesSize[enemyType][1] / 2)
    ];
  }
  /**
   * An enemy collides with player. Kill both the enemy and the player, player lose a live, the game reset or is game over if the player have no more lives.
   * @param {Enemy} enemy Enemy that collides with player
   */
  enemyCollidesWithPlayer(enemy) {
    this.model.removeEnemy(enemy, false);
    this.playerHitted();
  }
  /**
   * Handles final boss colliding with player.
   */
  bossCollideWithPlayer() {
    this.playerHitted();
    this.model.finalBoss.bossHitted();
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
    this.model.removePlayer();
    this.model.createExplosion(player);
    this.enemiesMovementController.cancelAllEnemiesMovement();

    if (this.model.bonus) {
      this.model.bonus.cancelAnimation();
      this.model.bonus.resetPosition();
    }

    player.loseLive();

    if (player.lives > 0) {
      setTimeout(() => { this.showMessage("You lost a life"); }, 500);

      this.model.svEnemiesPool.storeAllObjects();
      setTimeout(() => {
        if (this.model.finalBoss && this.model.finalBoss.elem.display !== "none") {
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
      if (this.model.finalBoss && this.model.finalBoss.elem.style.display !== "none")
        this.model.finalBoss.hide();

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
    for (let i = 0; i < this.model.siEnemies.length; i++) {
      for (let j = 0; j < this.model.siEnemies[i].length; j++) {
        this.model.siEnemies[i][j].teleportToInitialPosition();
      }
    }

    if (this.model.bonus) {
      this.model.bonus.cancelAnimation();
      this.model.bonus.resetPosition();
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
   * Start the game. Called when the player clicks on the menu start button.
   */
  start() {
    this.backgroundController.stopBackground();
    this.gameState = "spaceInvaders";
    player.responsive = true;
    player.collisionable = true;
    this.audio.changeMusicByGameState();

    if (!this.model.siEnemies || this.model.siEnemies.length === 0)
      this.model.createEnemies();
    this.enemiesMovementController.moveSpaceInvadersEnemies();
    this.model.createBonusEnemy();
  }
  /************************************************************************************************************/
  /************************************************* CHEATS ***************************************************/
  /**
   * Cheat to go instantly to the final boss.
   */
  cheatToFinal() {
    this.enemiesMovementController.cancelAllEnemiesMovement();
    cancelAnimationFrame(this.backgroundMoveTimerId);
    this.model.finalBoss = new Boss();
    this.model.finalBoss.enterGame();
    this.backgroundBottom = -18625;
    this.backgroundController.background.style.bottom = `${this.backgroundBottom}px`
  }
}