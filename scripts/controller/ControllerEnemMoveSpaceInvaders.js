/**
 * Object to handle space invaders enemies movement
 */
export class ControllerEnemMoveSpaceInvaders {
  constructor(movementController) {
    this._movementController = movementController;
    this._lastShotEnemies = []

    this.siEnemiesMovementDirection = true;
    this.siEnemiesMovementDown = false;
    this.siEnemiesShootsPerMove = 2
    this.firstTime = true
  }
  /**
   * Move enemies from left to right
   */
  moveAllEnemiesOneCellToTheRight() {
    let enemies = this.selectEnemiesInOrder('right')
    if(!this.firstTime) {
      this.chooseOneEnemyAndShoot(enemies)
    } else {
      this.firstTime = false
    }
    enemies.forEach((enemy, idx, arr) => this.moveEnemyInArray(enemy, idx, arr));
  }
  /**
   * Move enemies from right to left
   */
  moveAllEnemiesOneCellToTheLeft() {
    let enemies = this.selectEnemiesInOrder('left')
    if(!this.firstTime) {
      this.chooseOneEnemyAndShoot(enemies)
    } else {
      this.firstTime = false
    }
    enemies.forEach((enemy, idx, arr) => this.moveEnemyInArray(enemy, idx, arr));
  }
  /**
   * Move enemies down
   */
  moveAllEnemiesOneCellDown() {
    this.selectEnemiesInOrder('down').forEach((enemy, idx, arr) => this.moveEnemyInArray(enemy, idx, arr));
  }
  /**
   * Get 1 dimension array with surviving enemies in the correct order for the corresponding movement specified in order parameter
   * @param {string} order 'right'|'left'|'down'
   */
  selectEnemiesInOrder(order) {
    let enemies = []
    switch(order) {
      case 'right':
        for (let column = this._movementController.grid.canvasColumns - 1; column >= 0; column--) {
          for (let row = 0; row < this._movementController.grid.canvasRows; row++) {
            let enemy = this._movementController.grid.getCell(row, column);
            if (enemy)
              enemies.push(enemy);
          }
        }
        break
      case 'left':
        for (let column = 0; column < this._movementController.grid.canvasColumns; column++) {
          for (let row = 0; row < this._movementController.grid.canvasRows; row++) {
            let enemy = this._movementController.grid.getCell(row, column);
            if (enemy)
              enemies.push(enemy);
          }
        }
        break
      case 'down':
        for (let row = this._movementController.grid.canvasRows - 1; row >= 0; row--) {
          for (let column = this._movementController.grid.canvasColumns - 1; column >= 0; column--) {
            let enemy = this._movementController.grid.getCell(row, column);
            if (enemy)
              enemies.push(enemy);
          }
        }
        break
    }
    return enemies
  }
  /**
   * Change direction of enemies if needed: if enemies goes from left to right and reach the screen's right limit, changes direction to down, after that
   * it will change direction to left
   */
  updateDirectionIfNeeded() {
    if (this.siEnemiesMovementDown) {
      this.siEnemiesMovementDown = false;
      this.siEnemiesMovementDirection = !this.siEnemiesMovementDirection;
    } else {
      if ((this.siEnemiesMovementDirection && this._movementController.grid.getMostRightEnemy().column === this._movementController.grid.canvasColumns - 1) ||
        (!this.siEnemiesMovementDirection && this._movementController.grid.getMostLeftEnemy().column === 0)) {
        this.siEnemiesMovementDown = true;
      }
    }
  }
  /**
   * Callback for forEach statement of an array usually returned from selectEnemiesInOrder function, that contains all enemies to be moved. Handles the final move the 
   * enemy must perform.
   * @param {Enemy} enemy Corresponding enemy in forEach loop
   * @param {int} idx Index of enemy
   * @param {array} arr forEach loop array
   */
  moveEnemyInArray(enemy, idx, arr) {
    let destination = this.siEnemiesMovementDown ? [enemy.row + 1, enemy.column] :
      this.siEnemiesMovementDirection ? [enemy.row, enemy.column + 1] : [enemy.row, enemy.column - 1];
    if (idx === arr.length - 1) {
      this._movementController.grid.moveEnemyTo([enemy.row, enemy.column], destination, () => {
        this._movementController.siEnemiesMovementTimerId = setTimeout(() => { this._movementController.moveSpaceInvadersEnemies(); }, 500);
      });
      this.updateDirectionIfNeeded();
    } else {
      this._movementController.grid.moveEnemyTo([enemy.row, enemy.column], destination);
    }
  }
  /**
   * Choose randomly a number of enemies (this.siEnemiesShootsPerMove) from an array of enemies usually returned from selectEnemiesInOrder function, and shoot with that enemies.
   * @param {array} enemies Array of enemies
   */
  chooseOneEnemyAndShoot(enemies) {
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
    console.log(enemies)
    if(!enemies || enemies.length === 0)
      return

    if(enemies.length <= this.siEnemiesShootsPerMove) {
      if(this._lastShotEnemies.length > 0)
        this._lastShotEnemies = []

      enemies.forEach(enemy => enemy.shoot())
      return
    }
    
    let toRemove = this._lastShotEnemies.length
    for(let i = 0; i < this.siEnemiesShootsPerMove; i++) {
      let idx;
      if(this._lastShotEnemies.length < this.siEnemiesShootsPerMove) {
        while(this._lastShotEnemies.includes((idx = Math.floor(Math.random() * enemies.length))));  
      } else {
        idx = Math.floor(Math.random() * enemies.length)
      }
      this._lastShotEnemies.push(idx)
      console.log(idx)
      enemies[idx].shoot()
    }
    this._lastShotEnemies.splice(0, toRemove)
  }
}