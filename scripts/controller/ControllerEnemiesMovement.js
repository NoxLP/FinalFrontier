import { game } from "../main.js";
import { easings } from "../tweens/easings.js";
import { Enemy } from "../model/Enemy.js";
import { ControllerEnemMoveSpaceInvaders } from "./ControllerEnemMoveSpaceInvaders.js";

export class ControllerEnemiesMovement {
  constructor(width, height) {
    this.siEnemyFrameStep = 4;
    this.siEnemiesMovementTimeout = 500;
    this.siEnemiesMovementTimerId;
    this.siEnemiesShootsTimerId;

    this.svEnemySpeed = 200;
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

    this.enemyBulletStep = 9;

    this.bonusTimeout = 10000;

    this.bossPaths = [
      [
        [30, 30], [easings.easeOutSine, easings.linear]
      ],
      [[1000, 30], [easings.easeOutSine, easings.linear]]
    ];
    this.bossAnimationTimerId;

    this.grid;
    this._spaceInvadersMovementController = new ControllerEnemMoveSpaceInvaders(this)
  }
  /**
   * Move all enemies in the "space invaders" pattern
   */
  moveSpaceInvadersEnemies() {
    console.log('moveSpaceInvadersEnemies')
    /*
    Si la tween de los enemigos está en pausa (el jugador murió y están esperando a que reaparezca)
      play a todas las tween
      return
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

    //console.warn(this.grid._grid)
    if (!this.grid.someEnemy(x => x)) {
      this._spaceInvadersMovementController.siEnemiesMovementDown = false;
      this._spaceInvadersMovementController.siEnemiesMovementDirection = true;
      return;
    }

    if (this.grid.someEnemy(x => x.myMovementTween && x.myMovementTween.paused)) {
      this.grid.doToEveryEnemies(enemy => { if (x.myMovementTween) x.myMovementTween.play(); })
      return;
    }

    if (this._spaceInvadersMovementController.siEnemiesMovementDown) {
      this._spaceInvadersMovementController.moveAllEnemiesOneCellDown();
    } else if (this._spaceInvadersMovementController.siEnemiesMovementDirection) {
      this._spaceInvadersMovementController.moveAllEnemiesOneCellToTheRight();
    } else {
      this._spaceInvadersMovementController.moveAllEnemiesOneCellToTheLeft();
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
      clearTimeout(this.siEnemiesMovementTimerId);
      clearInterval(this.siEnemiesShootsTimerId);
      /*for (let i = 0; i < game.model.siEnemies.length; i++) {
        for (let j = 0; j < game.model.siEnemies[i].length; j++) {
          cancelAnimationFrame(game.model.siEnemies[i][j].moveAnimationId);
          clearTimeout(game.model.siEnemies[i][j].moveAnimationId);
        }
      }*/
      this.grid.doToEveryEnemies(enemy => {
        enemy.myMovementTween.stopWithoutCallback = true;
        enemy.myMovementTween.pause();
      });
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
      let enemy = game.model.enemiesPool.getNewObject({
        type: shiptype,
        x: initial[0],
        y: initial[1],
        collisionable: true
      });
      enemy.type = shiptype;
      enemy.elem.classList.add("enemy");

      enemy.moveAnimationId = setTimeout(() => {
        enemy.moveToPoint(
          [final[0], final[1]],
          1,
          this.svEnemiesPaths[index][2][0],
          this.svEnemiesPaths[index][2][1],
          () => {
            console.log(enemy)
            game.model.enemiesPool.storeObject(enemy);
          })
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