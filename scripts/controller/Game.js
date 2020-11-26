import { Enemy } from "./Enemy.js";
import { BonusEnemy } from "./BonusEnemy.js";
import { game, player, menu } from "./main.js";
import { PointsCounter } from "./PointsCounter.js";
import { ObjectPool } from "./ObjectPool.js";
import { Sounds } from "./Sounds.js";
import { easings } from "./tweens/easings.js";
import { Boss } from "./Boss.js";

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

    this.canvasRows = 10;
    this.canvasColumns = enemiesPerRow + 3;
    this.canvasRowHeight = this.height / this.canvasRows;
    this.canvasColumnWidth = this.width / this.canvasColumns;

    this.finalBoss;
    this.bossPaths = [
      [
        [30, 30], [easings.easeOutSine, easings.linear]
      ],
      [[1000, 30], [easings.easeOutSine, easings.linear]]
    ];
    this.bossAnimationTimerId;

    this.bonus;
    this.bonusSize = [80, 100];
    this.bonusTimeout = 10000;
    this.bonusPointsRange = [50, 450];

    this.enemiesSize = [
      [50, 50],
      [65, 65],
      [80, 80]
    ];
    this.siEnemyFrameStep = 4;
    this.svEnemySpeed = 200;
    this.enemyBulletStep = 9;
    this.siEnemies = [];
    this.siEnemiesPerRow = enemiesPerRow;
    this.svEnemiesMoveTimerId = null;
    this.svEnemiesPaths = [
      [
        [this.width + 80, 0],
        [-80, this.height * 0.9],
        [easings.easeInOutSine, easings.easeInOutBack]
      ],
      [[-80, this.height * 0.2], [this.width + 80, this.height * 0.85], [easings.linear, easings.easeInOutBack]],
      [[this.width + 80, this.height * 0.2], [-80, this.height * 0.7], [easings.linear, easings.easeInOutBack]],
      [[-80, this.height * 0.7], [this.width + 80, this.height * 0.2], [easings.linear, easings.easeInOutBack]],

      [[-80, this.height * 0.7], [this.width + 80, this.height * 0.5], [easings.easeInOutSine, easings.easeInOutBack]],
      [[-80, this.height * 0.7], [this.width + 80, this.height * 0.5], [easings.easeInCirc, easings.easeInOutBack]],

      [[-80, -80], [this.width, this.height + 80], [easings.easeOutCirc, easings.linear]], //arriba izq => abajo der
      [[-80, -80], [this.width, this.height + 80], [easings.easeOutCirc, easings.easeOutCirc]], //arriba izq => abajo der
      [[-80, -80], [this.width, this.height + 80], [easings.linear, easings.easeInCirc]], //arriba izq => abajo der

      [[this.width, -80], [-80, this.height + 80], [easings.linear, easings.easeOutCirc]], //arriba der => abajo izq
      [[this.width, -80], [-80, this.height + 80], [easings.easeOutBack, easings.easeOutCirc]], //arriba der => abajo izq
      [[this.width, -80], [-80, this.height + 80], [easings.easeOutCirc, easings.easeOutCirc]], //arriba der => abajo izq
      [[this.width, -80], [-80, this.height + 80], [easings.easeInCirc, easings.linear]], //arriba der => abajo izq

      [[-80, this.height * 0.25], [this.width * 0.8, this.height + 80], [easings.easeOutBack, easings.easeInOutBack]], //abajo izq1/4 => arriba der1/4
      [[-80, this.height * 0.25], [this.width * 0.8, this.height + 80], [easings.easeOutBack, easings.easeInCirc]], //abajo izq1/4 => arriba der1/4
      [[-80, this.height * 0.25], [this.width * 0.8, this.height + 80], [easings.linear, easings.easeInCirc]], //abajo izq1/4 => arriba der1/4
      [[-80, this.height * 0.25], [this.width * 0.8, this.height + 80], [easings.easeOutBack, easings.linear]], //abajo izq1/4 => arriba der1/4
      [[-80, this.height * 0.25], [this.width * 0.8, this.height + 80], [easings.linear, easings.easeInOutBack]], //abajo izq1/4 => arriba der1/4
      [[-80, this.height * 0.25], [this.width * 0.8, this.height + 80], [easings.linear, easings.easeInBack]], //abajo izq1/4 => arriba der1/4

      [[this.width * 0.8, this.height + 80], [-80, -80], [easings.easeInBack, easings.linear]], //abajo der3/4 => arriba izq
      [[this.width * 0.8, this.height + 80], [-80, -80], [easings.easeInCirc, easings.linear]], //abajo der3/4 => arriba izq
      [[this.width * 0.8, this.height], [-80, -80], [easings.linear, easings.easeInBack]], //abajo der3/4 => arriba izq      
      [[this.width * 0.8, this.height + 80], [-80, -80], [easings.linear, easings.easeOutCirc]], //abajo der3/4 => arriba izq      

      [[-80, this.height * 0.75], [this.width * 0.8, -80], [easings.linear, easings.easeInOutCirc]],//abajo izq3/4 => arriba der3/4
      [[-80, this.height * 0.75], [this.width * 0.8, -80], [easings.easeInCirc, easings.easeInCirc]],
      [[-80, this.height * 0.75], [this.width * 0.8, -80], [easings.linear, easings.easeInOutBack]],
      [[-80, this.height * 0.75], [this.width * 0.8, -80], [easings.linear, easings.easeInBack]],
      [[-80, this.height * 0.75], [this.width * 0.8, -80], [easings.linear, easings.easeInCirc]]
    ];

    this.playerSize = [80, 80];
    this.playerInitialCoords = [
      (this.width / 2) - (this.playerSize[0] / 2),
      (this.canvasRowHeight * (this.canvasRows - 1)) + (this.canvasRowHeight / 2) - (this.playerSize[1] / 2)
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
    setTimeout(() => { this.bonus.move(); }, this.bonusTimeout);
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
      (this.canvasColumnWidth * (column + 0.5)) - (this.enemiesSize[enemyType][0] / 2),
      (this.canvasRowHeight * (row + 1.5)) - (this.enemiesSize[enemyType][1] / 2)
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
    setTimeout(() => { this.bonus.move(); }, (Math.random() * game.bonusTimeout * 0.5) + (game.bonusTimeout * 0.5));
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
  /**
   * Get left-most x coordinate of column
   * @param {number} column Column index
   */
  getXOfCanvasColumn(column) { return this.canvasColumnWidth * (column + 0.5); }
  /**
   * Get top-most y coordinate of row
   * @param {number} row Row index
   */
  getYOfCanvasRow(row) { return this.canvasRowHeight * (row + 0.5); }
  /**
   * Used in "space invaders" part to check if the enemies from the most left column are at the left limit of the screen, so enemies should move down.
   */
  leftColumnEnemyIsInCanvasLeftColumn() {
    var mostLeftColumnWithEnemyAlive;
    for (let j = 0; j < this.siEnemiesPerRow; j++) {
      for (let i = 0; i < this.siEnemies.length; i++) {
        mostLeftColumnWithEnemyAlive = this.siEnemies[i][j];
        if (mostLeftColumnWithEnemyAlive.elem.style.display !== "none") {
          break;
        }
      }
      if (mostLeftColumnWithEnemyAlive.elem.style.display !== "none") {
        break;
      }
    }

    if (!mostLeftColumnWithEnemyAlive)
      return false;

    return mostLeftColumnWithEnemyAlive.x > 0 && mostLeftColumnWithEnemyAlive.x < this.canvasColumnWidth;
  }
  /**
   * Used in "space invaders" part to check if the enemies from the most right column are at the right limit of the screen, so enemies should move down.
   */
  rightColumnEnemyIsInCanvasRightColumn() {
    let mostLeftColumnWithEnemyAlive;
    for (let j = this.siEnemiesPerRow - 1; j >= 0; j--) {
      for (let i = 0; i < this.siEnemies.length; i++) {
        mostLeftColumnWithEnemyAlive = this.siEnemies[i][j];
        if (mostLeftColumnWithEnemyAlive.elem.style.display !== "none") {
          break;
        }
      }
      if (mostLeftColumnWithEnemyAlive.elem.style.display !== "none") {
        break;
      }
    }

    if (!mostLeftColumnWithEnemyAlive)
      return false;

    return mostLeftColumnWithEnemyAlive.x > this.canvasColumnWidth * (this.canvasColumns - 1) &&
      mostLeftColumnWithEnemyAlive.x < this.canvasColumnWidth * this.canvasColumns;
  }
  /**
   * Move all enemies in the "space invaders" pattern
   */
  moveSpaceInvadersEnemies() {
    /*
    Van de izquierda a derecha
    mientras que la esquina derecha del enemigo de la derecha no colisione con el límite de la derecha
      sumas a x
    bajan
      sumas una fila a y 
    van de derecha a izquierda
      mientras que la esquina izquierda del enemigo de la izquierda no colisione con el límite de la izquierda
    restas a x
      bajan
    sumas una fila a y 
    REPITE hasta que un enemigo de la fila inferior colisione con player
    */

    this.spaceInvadersEnemiesShootsTimerId = setInterval(() => {
      /*
      Elegimos una columna aleatoria
      El último enemigo de esa columna 
      Dispara

      0 1 2 3
      ceil(rand*4) => [1, 4] -1 => [0, 3]
       */
      let shootColumn = Math.ceil(Math.random() * this.siEnemiesPerRow) - 1;
      let lastEnemy;
      for (let i = 0; i < this.siEnemies.length; i++) {
        if (this.siEnemies[i][shootColumn] && this.siEnemies[i][shootColumn].elem.style.display !== "none") {
          lastEnemy = this.siEnemies[i][shootColumn];
        } else {
          continue;
        }
      }

      if (lastEnemy)
        lastEnemy.shoot();
    }, 1500);

    for (let i = 0; i < this.siEnemies.length; i++) {
      for (let j = 0; j < this.siEnemies[i].length; j++) {
        let enemy = this.siEnemies[i][j];
        enemy.collisionable = true;
        enemy.elem.style.display = "inline";
        enemy.moveEnemyLeftToRight();
      }
    }
  }
  /**
   * Move bonus enemy
   */
  moveBonusEnemy() { setTimeout(() => { this.bonus.move(); }, (Math.random() * game.bonusTimeout * 0.5) + (game.bonusTimeout * 0.5)); }
  /**
   * Cancel movement of all enemies
   */
  cancelAllEnemiesMovement() {
    if (this.bonus) {
      this.bonus.cancelAnimation();
      this.bonus.resetPosition();
    }

    if (this.finalBoss && this.finalBoss.elem.style.display !== "none") {
      this.finalBoss.myMovementTween.stop();
      clearTimeout(this.bossAnimationTimerId);
      this.bossAnimationTimerId = null;
    }

    if (this.gameState === "spaceInvaders") {
      for (let i = 0; i < this.siEnemies.length; i++) {
        for (let j = 0; j < this.siEnemies[i].length; j++) {
          cancelAnimationFrame(this.siEnemies[i][j].moveAnimationId);
          clearTimeout(this.siEnemies[i][j].moveAnimationId);
        }
      }
      clearInterval(this.spaceInvadersEnemiesShootsTimerId);
    } else {
      clearTimeout(this.svEnemiesMoveTimerId);
      this.svEnemiesMoveTimerId = null;
      this.svEnemiesPool.showingObjects.forEach(x => {
        clearTimeout(x.moveAnimationId);
        if (x.myMovementTween)
          x.myMovementTween.stop();
      });
    }
  }
  /**
   * Function to handle "scroll vertical" part's enemies movement. Call it once and works recursively with setInterval. Cancel it with function cancelAllEnemiesMovements.
   * @param {number} lastIndex Index of last path used. Used to recursive calls, no need to set it at first call
   */
  scrollVerticalEnemiesMovements(lastIndex) {
    let index;
    while ((index = Math.round(Math.random() * (this.svEnemiesPaths.length - 1))) === lastIndex);

    let initial = this.svEnemiesPaths[index][0];
    let final = this.svEnemiesPaths[index][1];
    let shiptype = Math.round(Math.random() * 2);
    let numberOfEnemies = Math.round((Math.random() * 3) + 2);

    for (let i = 0; i < numberOfEnemies; i++) {
      let enemy = this.svEnemiesPool.getNewObject(() => new Enemy(shiptype, initial[0], initial[1]), initial[0], initial[1]);
      enemy.type = shiptype;
      enemy.elem.classList.add("enemy");

      enemy.moveAnimationId = setTimeout(() => {
        enemy.moveToPoint(
          [final[0], final[1]],
          1,
          this.svEnemiesPaths[index][2][0],
          this.svEnemiesPaths[index][2][1])
      },
        1000 + (500 * i)
      );
    }

    if (!this.svEnemiesMoveTimerId) {
      this.svEnemiesMoveTimerId = setInterval(() => { this.scrollVerticalEnemiesMovements(index); }, (Math.random() * 6000) + 2000);
    }
  }
  /**
   * Function to handle final boss movement. Call it once and works recursively with setTimeouts. Cancel it with function cancelAllEnemiesMovements.
   * @param {number} index Index of last movement pattern used. Start with 0 the first tiem it's called
   */
  bossMovements(index) {
    /*
    Sigue un patrón de movimientos => Hacer paths en this.bossPaths(array) hasta el final, y repetir
      Bucle:
      Hacer un path
      Esperar 3 segundos
    */

    if (index === this.bossPaths.length)
      index = 0;

    this.finalBoss.moveToPoint(
      this.bossPaths[index][0],
      this.bossPaths[index][1][0],
      this.bossPaths[index][1][1]
    )
    index++;

    this.bossAnimationTimerId = setTimeout(() => { this.bossMovements(index); }, 3000);
  }
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
    this.cancelAllEnemiesMovement();

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
          this.bossMovements(0);
        } else if (this.gameState === "spaceInvaders") {
          this.siReset();
          this.moveSpaceInvadersEnemies();
          this.moveBonusEnemy();
        } else {
          this.scrollVerticalEnemiesMovements();
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
    this.cancelAllEnemiesMovement();
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
      this.scrollVerticalEnemiesMovements();
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
    this.cancelAllEnemiesMovement();
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
      game.createEnemies();
    game.moveSpaceInvadersEnemies();
    game.createBonusEnemy();
  }
  /************************************************************************************************************/
  /************************************************* CHEATS ***************************************************/
  /**
   * Cheat to go instantly to the final boss.
   */
  cheatToFinal() {
    this.cancelAllEnemiesMovement();
    cancelAnimationFrame(this.backgroundMoveTimerId);
    this.finalBoss = new Boss();
    this.finalBoss.enterGame();
    this.backgroundBottom = -18625;
    this.background.style.bottom = `${this.backgroundBottom}px`
  }
}