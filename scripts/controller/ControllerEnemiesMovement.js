import { game } from "../main.js";
import { easings } from "../tweens/easings.js";
import { Enemy } from "../model/Enemy.js";

export class ControllerEnemiesMovement {
  constructor(enemiesPerRow, width, height) {
    this.siEnemyFrameStep = 4;
    this.svEnemySpeed = 200;
    this.enemyBulletStep = 9;
    this.svEnemiesMoveTimerId = null;
    this.svEnemiesPaths = [
      [
        [width + 80, 0],
        [-80, height * 0.9],
        [easings.easeInOutSine, easings.easeInOutBack]
      ],
      [[-80, height * 0.2], [width + 80, height * 0.85], [easings.linear, easings.easeInOutBack]],
      [[width + 80, height * 0.2], [-80, height * 0.7], [easings.linear, easings.easeInOutBack]],
      [[-80, height * 0.7], [width + 80, height * 0.2], [easings.linear, easings.easeInOutBack]],

      [[-80, height * 0.7], [width + 80, height * 0.5], [easings.easeInOutSine, easings.easeInOutBack]],
      [[-80, height * 0.7], [width + 80, height * 0.5], [easings.easeInCirc, easings.easeInOutBack]],

      [[-80, -80], [width, height + 80], [easings.easeOutCirc, easings.linear]], //arriba izq => abajo der
      [[-80, -80], [width, height + 80], [easings.easeOutCirc, easings.easeOutCirc]], //arriba izq => abajo der
      [[-80, -80], [width, height + 80], [easings.linear, easings.easeInCirc]], //arriba izq => abajo der

      [[width, -80], [-80, height + 80], [easings.linear, easings.easeOutCirc]], //arriba der => abajo izq
      [[width, -80], [-80, height + 80], [easings.easeOutBack, easings.easeOutCirc]], //arriba der => abajo izq
      [[width, -80], [-80, height + 80], [easings.easeOutCirc, easings.easeOutCirc]], //arriba der => abajo izq
      [[width, -80], [-80, height + 80], [easings.easeInCirc, easings.linear]], //arriba der => abajo izq

      [[-80, height * 0.25], [width * 0.8, height + 80], [easings.easeOutBack, easings.easeInOutBack]], //abajo izq1/4 => arriba der1/4
      [[-80, height * 0.25], [width * 0.8, height + 80], [easings.easeOutBack, easings.easeInCirc]], //abajo izq1/4 => arriba der1/4
      [[-80, height * 0.25], [width * 0.8, height + 80], [easings.linear, easings.easeInCirc]], //abajo izq1/4 => arriba der1/4
      [[-80, height * 0.25], [width * 0.8, height + 80], [easings.easeOutBack, easings.linear]], //abajo izq1/4 => arriba der1/4
      [[-80, height * 0.25], [width * 0.8, height + 80], [easings.linear, easings.easeInOutBack]], //abajo izq1/4 => arriba der1/4
      [[-80, height * 0.25], [width * 0.8, height + 80], [easings.linear, easings.easeInBack]], //abajo izq1/4 => arriba der1/4

      [[width * 0.8, height + 80], [-80, -80], [easings.easeInBack, easings.linear]], //abajo der3/4 => arriba izq
      [[width * 0.8, height + 80], [-80, -80], [easings.easeInCirc, easings.linear]], //abajo der3/4 => arriba izq
      [[width * 0.8, height], [-80, -80], [easings.linear, easings.easeInBack]], //abajo der3/4 => arriba izq      
      [[width * 0.8, height + 80], [-80, -80], [easings.linear, easings.easeOutCirc]], //abajo der3/4 => arriba izq      

      [[-80, height * 0.75], [width * 0.8, -80], [easings.linear, easings.easeInOutCirc]],//abajo izq3/4 => arriba der3/4
      [[-80, height * 0.75], [width * 0.8, -80], [easings.easeInCirc, easings.easeInCirc]],
      [[-80, height * 0.75], [width * 0.8, -80], [easings.linear, easings.easeInOutBack]],
      [[-80, height * 0.75], [width * 0.8, -80], [easings.linear, easings.easeInBack]],
      [[-80, height * 0.75], [width * 0.8, -80], [easings.linear, easings.easeInCirc]]
    ];

    this.spaceInvadersEnemiesShootsTimerId;

    this.bonusTimeout = 10000;

    this.bossPaths = [
      [
        [30, 30], [easings.easeOutSine, easings.linear]
      ],
      [[1000, 30], [easings.easeOutSine, easings.linear]]
    ];
    this.bossAnimationTimerId;
  }
  /**
   * Used in "space invaders" part to check if the enemies from the most left column are at the left limit of the screen, so enemies should move down.
   */
  leftColumnEnemyIsInCanvasLeftColumn() {
    var mostLeftColumnWithEnemyAlive;
    for (let j = 0; j < game.model.siEnemiesPerRow; j++) {
      for (let i = 0; i < game.model.siEnemies.length; i++) {
        mostLeftColumnWithEnemyAlive = game.model.siEnemies[i][j];
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
    for (let j = game.model.siEnemiesPerRow - 1; j >= 0; j--) {
      for (let i = 0; i < game.model.siEnemies.length; i++) {
        mostLeftColumnWithEnemyAlive = game.model.siEnemies[i][j];
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
      let shootColumn = Math.ceil(Math.random() * game.model.siEnemiesPerRow) - 1;
      let lastEnemy;
      for (let i = 0; i < game.model.siEnemies.length; i++) {
        let enemy = game.model.siEnemies[i][shootColumn];
        if (enemy && enemy.elem.style.display !== "none") {
          lastEnemy = enemy;
        } else {
          continue;
        }
      }

      if (lastEnemy)
        lastEnemy.shoot();
    }, 1500);

    for (let i = 0; i < game.model.siEnemies.length; i++) {
      for (let j = 0; j < game.model.siEnemies[i].length; j++) {
        let enemy = game.model.siEnemies[i][j];
        enemy.collisionable = true;
        enemy.elem.style.display = "inline";
        enemy.moveEnemyLeftToRight();
      }
    }
  }
  /**
   * Move bonus enemy
   */
  moveBonusEnemy() { setTimeout(() => { game.model.bonus.move(); }, (Math.random() * this.bonusTimeout * 0.5) + (this.bonusTimeout * 0.5)); }
  /**
   * Cancel movement of all enemies
   */
  cancelAllEnemiesMovement() {
    if (game.model.bonus) {
      game.model.bonus.cancelAnimation();
      game.model.bonus.resetPosition();
    }

    if (game.model.finalBoss && game.model.finalBoss.elem.style.display !== "none") {
      game.model.finalBoss.myMovementTween.stop();
      clearTimeout(this.bossAnimationTimerId);
      this.bossAnimationTimerId = null;
    }

    if (game.gameState === "spaceInvaders") {
      for (let i = 0; i < game.model.siEnemies.length; i++) {
        for (let j = 0; j < game.model.siEnemies[i].length; j++) {
          cancelAnimationFrame(game.model.siEnemies[i][j].moveAnimationId);
          clearTimeout(game.model.siEnemies[i][j].moveAnimationId);
        }
      }
      clearInterval(this.spaceInvadersEnemiesShootsTimerId);
    } else {
      clearTimeout(this.svEnemiesMoveTimerId);
      this.svEnemiesMoveTimerId = null;
      game.model.enemiesPool.showingObjects.forEach(x => {
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
      let enemy = game.model.enemiesPool.getNewObject(() => new Enemy(shiptype, initial[0], initial[1]), initial[0], initial[1]);
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

    game.model.finalBoss.moveToPoint(
      this.bossPaths[index][0],
      this.bossPaths[index][1][0],
      this.bossPaths[index][1][1]
    )
    index++;

    this.bossAnimationTimerId = setTimeout(() => { this.bossMovements(index); }, 3000);
  }
}