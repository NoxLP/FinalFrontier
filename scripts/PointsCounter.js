
/**
 * Class for handle points earned by player, and showing them in screen
 */
export class PointsCounter {
  /**
   * Constructor for PointsCounter
   * @param {number} msPerChange Miliseconds every points change's animation will take to finish
   */
  constructor(msPerChange) {
    this.msPerChange = msPerChange;
    this._counter = document.getElementById("pointsCounter");
    this._pointsQueue = []; //FIFO => first in first out
    this._currentShowedPoints = 0;
    this._timerId = null;
  }
  /**
   * Getter for points showing at screen curently
   */
  get showedPoints() { return this._currentShowedPoints; }
  /**
   * Setter for points showing at screen curently. It initiates the points's counter automatically.
   */
  set showedPoints(total) {
    this._pointsQueue.push(total);

    if (!this._timerId) {
      let msPerNumber = this.msPerChange / (this._pointsQueue[0] - this._currentShowedPoints);
      let number = msPerNumber >= 1 ? 1 : 1 / msPerNumber;
      this._timerId = setInterval(() => { this._animatePoints(number); }, msPerNumber);
    }
  }
  /**
   * Private function to build points string. Minimum 5 digits, always a 0 before the final points number.
   */
  _buildString() {
    let str = "" + this._currentShowedPoints;
    return str.length < 5 ? "0".repeat(5 - str.length) + str : "0" + str;
  }
  /**
   * Private function to animate points earned when showing them at the counter.
   * @param {number} number Number of points to be summed to the showed points at each animation step
   */
  _animatePoints(number) {
    if (this._pointsQueue.length === 0)
      return;

    if (this._currentShowedPoints <= this._pointsQueue[0]) {
      this._currentShowedPoints = Math.round(this._currentShowedPoints + number);
      this._counter.innerText = this._buildString();
    } else {
      this._currentShowedPoints = this._pointsQueue[0];
      this._counter.innerText = this._buildString();
      this._pointsQueue.shift();

      if (this._pointsQueue.length === 0) {
        clearInterval(this._timerId);
        this._timerId = null;
      }
    }
  }
  /**
   * Reset points setting them at 0
   */
  reset() {
    this._pointsQueue = [];
    clearInterval(this._timerId);
    this._timerId = null;
    this._currentShowedPoints = 0;
    this._counter.innerText = "00000";
  }
}