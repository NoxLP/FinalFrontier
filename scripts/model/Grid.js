import { Enemy } from "./Enemy.js";
import { easings } from "../tweens/easings.js";

/*
2 ways

1
Use grid only to do columns/coordinates calculations in space invaders mode => easier and less memory and cpu
2
Make a complete grid that will store all enemies in their respective cell => could be useful to move enemies to grid coordinates instead of canvas coordinates, and to calculate collisions if the game scalates
*/

export class Grid {
  constructor(width, height, model) {
    this.canvasRows = 10;
    this.canvasColumns = 12;
    this.canvasRowHeight = height / this.canvasRows;
    this.canvasColumnWidth = width / this.canvasColumns;

    this._model = model;
    this._grid = [...Array(this.canvasRows)].map(x => [...Array(this.canvasColumns)]);
  }
  cellIsValid(row, column) {
    return row > 0 && row < this.canvasRows && column > 0 && column < this.canvasColumns;
  }
  getCell(row, column) { return this._grid[row][column]; }
  getCellByCoordinates(x, y) {
    let row = Math.floor(y / this.canvasRowHeight);
    let col = Math.floor(x / this.canvasColumnWidth);
    console.log('getCellByCoordinates ', x, y, ' RC ', row, col)
    return this.cellIsValid(row, col) ? this._grid[row][col] : null;
  }
  getCellAndAdjacentsByCoordinates(x, y) {
    let row = Math.floor(y / this.canvasRowHeight);
    let col = Math.floor(x / this.canvasColumnWidth);
    return [
      this.cellIsValid(row, col) ? this.getCell(row, col) : null,
      this.cellIsValid(row, col) ? this.getCell(row - 1, col) : null,
      this.cellIsValid(row, col) ? this.getCell(row, col + 1) : null,
      this.cellIsValid(row, col) ? this.getCell(row + 1, col) : null,
      this.cellIsValid(row, col) ? this.getCell(row, col - 1) : null
    ]
  }
  /**
   * Get center x coordinate of column
   * @param {number} column Column index
   */
  getXOfCanvasColumn(column) { return this.canvasColumnWidth * (column + 0.5); }
  /**
   * Get center y coordinate of row
   * @param {number} row Row index
   */
  getYOfCanvasRow(row) { return this.canvasRowHeight * (row + 0.5); }
  /**
   * Returns DOM coordinates for initial enemy position. Used in "space invaders" part to calculate the coordinates of an enemy based on its position in the array siEnemies.
   * @param {number} row 
   * @param {number} column 
   */
  calculateCoordinatesByPosition(type, row, column) {
    //margen + ((total ancho / numero de naves) * numero nave actual)
    return [
      this.getXOfCanvasColumn(column) - (this._model.enemiesSize[type][0] / 2),
      this.getYOfCanvasRow(row) - (this._model.enemiesSize[type][1] / 2)
    ];
  }
  /**
   * Teleport object to cell
   * @param {DrawableObject} object Object to teleport
   * @param {array} cell Coordinates [x,y] of _grid cell to teleport object to
   */
  teleportToCell(object, x, y) {
    if (this._grid[x][y]) throw `Tried to teleport object to cell [${x}, ${y}] when there was an object already at that cell`;

    object.row = y;
    object.column = x;

    let coords = this.calculateCoordinatesByPosition(object.type, i, j);
    object.x = coords[0];
    object.y = coords[1];

    this._grid[x][y] = object;
  }
  /**
   * Initialize space invaders enemies location and store it in the correspondent _grid cell
   * @param {array} enemies 2d array with si enemies. 3 rows with the 3 types of enemies, and "enemiesPerRow" columns
   */
  initSIEnemiesLocations() {
    /*
    tipo 1 => row 1, 2
    tipo 2 => row 3, 4
    
    tipo 1 => (tipo * 2) - 1, tipo * 2 => 2 - 1, 2 => 1, 2
    tipo 2 => (tipo * 2) - 1, tipo * 2 => 4 - 1, 4 => 3, 4
    
    row_1 = (tipo * 2) - 1
    row_2 = tipo * 2
    
    type = roundUp(row / 2)
    */
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < this._model.siEnemiesPerRow; j++) {
        let type = Math.ceil(i / 2);
        let coords = this.calculateCoordinatesByPosition(type, i + 1, j);
        this._grid[i + 1][j] = this._model.enemiesPool.getNewObject({
          x: coords[0],
          y: coords[1],
          type: type,
          row: i + 1,
          column: j,
          collisionable: true
        });
        console.log(`CREADO en ${i + 1}, ${j}: `, this._grid[i + 1][j])
      }
    }
  }
  removeEnemy(enemy) {
    this._grid[enemy.row][enemy.column] = null;
  }
  someEnemyIsAlive() {
    return this._grid.some(x => x.some(x => x));
  }
  getMostTopEnemy() {
    for (let row = 0; row < this.canvasRows; row++) {
      let index = this._grid[row].findIndex(x => x);
      if (index !== -1)
        return this._grid[row][index];
    }
    return null;
  }
  getMostRightEnemy() {
    for (let column = this.canvasColumns - 1; column >= 0; column--) {
      for (let row = 0; row < this.canvasRows; row++) {
        if (this._grid[row][column])
          return this._grid[row][column];
      }
    }
    return null;
  }
  getMostLeftEnemy() {
    for (let column = 0; column < this.canvasColumns; column++) {
      for (let row = 0; row < this.canvasRows; row++) {
        if (this._grid[row][column])
          return this._grid[row][column];
      }
    }
    return null;
  }
  moveEnemyTo(originCell, destinationCell, finalCallback) {
    console.log("_moveEnemyTo ", originCell, destinationCell);

    let enemy = this._grid[originCell[0]][originCell[1]];

    if (destinationCell[0] > this.canvasRows - 1) {
      if (finalCallback) {
        finalCallback = () => {
          this._model.enemiesPool.storeObject(enemy);
          finalCallback();
        };
      } else {
        finalCallback = () => { this._model.enemiesPool.storeObject(enemy); };
      }
    } else {
      this._grid[destinationCell[0]][destinationCell[1]] = enemy;
      enemy.row = destinationCell[0];
      enemy.column = destinationCell[1];
    }
    this._grid[originCell[0]][originCell[1]] = null;

    enemy.moveToPoint(
      this.calculateCoordinatesByPosition(enemy.type, destinationCell[0], destinationCell[1]),
      0.2,
      easings.linear,
      easings.linear,
      finalCallback,
      0);
  }
}