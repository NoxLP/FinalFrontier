import { game } from "../main.js";
import { easings } from "../tweens/easings.js";
import { Enemy } from "../model/Enemy.js";

export class ControllerEnemiesMovement {
  constructor(width, height) {
    this.siEnemyFrameStep = 4;
    this.siEnemiesMovementDirection = true;
    this.siEnemiesMovementDown = false;
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
  }
  /**
   * Move all enemies in the "space invaders" pattern
   */
  moveSpaceInvadersEnemies() {
    console.log('moveSpaceInvadersEnemies')
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

    //this.siEnemiesShootsTimerId = setInterval(() => {
    /*
    Elegimos una columna aleatoria
    El último enemigo de esa columna 
    Dispara

    0 1 2 3
    ceil(rand*4) => [1, 4] -1 => [0, 3]
     */
    /*let shootColumn = Math.ceil(Math.random() * game.model.siEnemiesPerRow) - 1;
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
  }, 1500);*/

    /*for (let i = 0; i < game.model.siEnemies.length; i++) {
      for (let j = 0; j < game.model.siEnemies[i].length; j++) {
        let enemy = game.model.siEnemies[i][j];
        enemy.collisionable = true;
        enemy.elem.style.display = "inline";
        enemy.moveEnemyLeftToRight();
      }
    }*/

    //console.warn(this.grid._grid)
    if (!this.grid.someEnemyIsAlive()) {
      this.siEnemiesMovementDown = false;
      this.siEnemiesMovementDirection = true;
      return;
    }

    const updateDirectionIfNeeded = () => {
      //console.warn("most right ", this.grid.getMostRightEnemy().column)
      //console.warn("most left ", this.grid.getMostLeftEnemy().column)
      if (this.siEnemiesMovementDown) {
        //console.warn("ABAJO LISTO")
        this.siEnemiesMovementDown = false;
        this.siEnemiesMovementDirection = !this.siEnemiesMovementDirection;
      } else {
        if ((this.siEnemiesMovementDirection && this.grid.getMostRightEnemy().column === this.grid.canvasColumns - 1) ||
          (!this.siEnemiesMovementDirection && this.grid.getMostLeftEnemy().column === 0)) {
          //console.warn("ABAJO")
          this.siEnemiesMovementDown = true;
        }
      }
    };
    const moveAllInArray = (x, idx, arr) => {
      let destination = this.siEnemiesMovementDown ? [x.row + 1, x.column] :
        this.siEnemiesMovementDirection ? [x.row, x.column + 1] : [x.row, x.column - 1];
      if (idx === arr.length - 1) {
        this.grid.moveEnemyTo([x.row, x.column], destination, () => { this.siEnemiesMovementTimerId = setTimeout(() => { this.moveSpaceInvadersEnemies(); }, 500); });
        updateDirectionIfNeeded(x);
      } else {
        this.grid.moveEnemyTo([x.row, x.column], destination);
      }
    }
    const moveAllEnemiesOneCellToTheRight = () => {
      let enemies = [];
      for (let column = this.grid.canvasColumns - 1; column >= 0; column--) {
        for (let row = 0; row < this.grid.canvasRows; row++) {
          let enemy = this.grid.getCell(row, column);
          if (enemy)
            enemies.push(enemy);
        }
      }
      enemies.forEach(moveAllInArray);
    };
    const moveAllEnemiesOneCellToTheLeft = () => {
      let enemies = [];
      for (let column = 0; column < this.grid.canvasColumns; column++) {
        for (let row = 0; row < this.grid.canvasRows; row++) {
          let enemy = this.grid.getCell(row, column);
          if (enemy)
            enemies.push(enemy);
        }
      }
      enemies.forEach(moveAllInArray);
    };
    const moveAllEnemiesOneCellDown = () => {
      let enemies = [];
      for (let row = this.grid.canvasRows - 1; row >= 0; row--) {
        for (let column = this.grid.canvasColumns - 1; column >= 0; column--) {
          let enemy = this.grid.getCell(row, column);
          if (enemy)
            enemies.push(enemy);
        }
      }
      enemies.forEach(moveAllInArray);
    };

    if (this.siEnemiesMovementDown) {
      moveAllEnemiesOneCellDown();
    } else if (this.siEnemiesMovementDirection) {
      moveAllEnemiesOneCellToTheRight();
    } else {
      moveAllEnemiesOneCellToTheLeft();
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
      for (let i = 0; i < game.model.siEnemies.length; i++) {
        for (let j = 0; j < game.model.siEnemies[i].length; j++) {
          cancelAnimationFrame(game.model.siEnemies[i][j].moveAnimationId);
          clearTimeout(game.model.siEnemies[i][j].moveAnimationId);
        }
      }
      clearInterval(this.siEnemiesShootsTimerId);
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
            game.model.enemiesPool.storeObject(enemy); })
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