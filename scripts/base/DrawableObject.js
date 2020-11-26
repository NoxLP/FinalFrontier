import { game } from "../main.js";
 
/**
 * All objects that should be draw in the DOM, must inherit from this class
 */
export class DrawableObject {
  /**
   * DrawableObject's constructor
   * @param {DOM element} domElement The DOM element to be drawed in screen. Usually an Image object
   * @param {number} x X coordinate where to create the object
   * @param {number} y Y coordinate where to create the enemy
   * @param {number} width Width of the object in pixels
   * @param {number} height Height of the object in pixels
   */
  constructor(domElement, x, y, width, height) {
    this.elem = domElement;
    this.width = width;
    this.height = height;
    this._x = x;
    this._y = y;

    this.update();
    game.canvas.appendChild(this.elem);
  }
  /**
   * Getter for X coodinate.
   */
  get x() { return this._x; }
  /**
   * Setter for X coodinate. Automatically updates the DOM position.
   */
  set x(value) {
    this._x = value;
    this.updateX();
  }
  /**
   * Getter for Y coodinate.
   */
  get y() { return this._y; }
  /**
   * Setter for Y coodinate. Automatically updates the DOM position.
   */
  set y(value) {
    this._y = value;
    this.updateY();
  }
  /**
   * Getter for X coodinate of the DOM element center point.
   */
  get centerX() { return this._x + (this.width / 2); }
  /**
   * Getter for Y coodinate of the DOM element center point.
   */
  get centerY() { return this._y + (this.height / 2); }

  /**
   * Update X coordinate at the DOM.
   */
  updateX() { this.elem.style.left = `${this._x}px`; }
  /**
   * Update X coordinate at the DOM.
   */
  updateY() { this.elem.style.top = `${this._y}px`; }
  /**
   * Update DOM position and size.
   */
  update() {
    this.elem.style.width = `${this.width}px`;
    this.elem.style.height = `${this.height}px`;

    this.elem.style.left = `${this._x}px`;
    this.elem.style.top = `${this._y}px`;
  }
}