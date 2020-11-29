import { Enemy } from "./Enemy.js";

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
  calculateCoordinatesByPosition(row, column) {
    //margen + ((total ancho / numero de naves) * numero nave actual)
    console.log("calculate")
    const enemyType = Math.ceil(row / 2);
    return [
      this.getXOfCanvasColumn(column) - (this._model.enemiesSize[enemyType][0] / 2),
      this.getYOfCanvasRow(row) - (this._model.enemiesSize[enemyType][1] / 2)
    ];
  }
  /**
   * Teleport object to cell
   * @param {DrawableObject} object Object to teleport
   * @param {array} cell Coordinates [x,y] of grid cell to teleport object to
   */
  teleportToCell(object, x, y) {
    if (this._grid[x][y]) throw `Tried to teleport object to cell [${x}, ${y}] when there was an object already at that cell`;

    object.row = y;
    object.column = x;

    let coords = this.calculateCoordinatesByPosition(i, j);
    object.x = coords[0];
    object.y = coords[1];

    this._grid[x][y] = object;
  }
  /**
   * Initialize space invaders enemies location and store it in the correspondent grid cell
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
    console.log("PRE CREACION ", this._grid)
    for (let i = 0; i < 5; i++) {
      console.log("i",i)
      for (let j = 0; j < this._model.siEnemiesPerRow; j++) {
        console.log("j",j)
        let coords = this.calculateCoordinatesByPosition(i, j);
        this._grid[i][j] = this._model.enemiesPool.getNewObject(() => new Enemy(Math.ceil(i / 2), coords[0], coords[1], i, j));
      }
    }
    console.log("ENEMIGOS CREADOS ", this._grid);
  }
}