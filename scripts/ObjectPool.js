
/**
 * Class for pools of objects. One should create one different pool for each desired object type.
 */
export class ObjectPool {
  constructor() {
    this.hiddenCoords = [-10000, -10000];
    this.showingObjects = [];
    this.hiddenObjects = [];
  }
  /**
   * Function used to retrieve an object from the pool. If there are objects stored at the pool, it retrieves the object from the pool and return it, in other case the creation callback function is used to create a new object, add it as a 'showing in screen' object and return it.
   * @param {function} objCreationCallback Use this callback function to create a new object if there are no more objects stored at the pool
   * @param {number} x X coordinate where to send the retrieved object in case there are objects stored in the pool
   * @param {number} y Y coordinate where to send the retrieved object in case there are objects stored in the pool
   */
  getNewObject(objCreationCallback, x, y) {
    if (this.hiddenObjects.length > 0) {
      let obj = this.hiddenObjects.pop();
      this.showingObjects.push(obj);
      obj.elem.style.display = "inline";
      obj.x = x;
      obj.y = y;
      return obj;
    } else {
      let obj = objCreationCallback();
      this.showingObjects.push(obj);
      return obj;
    }
  }
  /**
   * Store an object in the object pool and hide it from screen. It does NOT check if the object exists in the internal showing objects array. The object must have been created by the pool at first instance and retrieved lately, so the pool has stored the object as a 'showing in screen' object.
   * @param {object} obj Object to store at the pool
   */
  storeObject(obj) {
    let index = this.showingObjects.findIndex(x => x.id === obj.id);
    this.showingObjects.splice(index, 1);
    this._hideObject(obj);
  }
  /**
   * Private function used to hide objects stored at the pool.
   * @param {object} obj Object to hide
   */
  _hideObject(obj) {
    this.hiddenObjects.push(obj);
    obj.elem.style.display = "none";
    obj.elem.style.transition = "";
    obj.x = this.hiddenCoords[0];
    obj.y = this.hiddenCoords[1];
  }
  /**
   * Store an object in the object pool and hide it from screen, ONLY if it founds the object already in the internal showing objects array. For the rest it works the same as storeObject function.
   * @param {object} obj Object to store at the pool
   */
  storeIfNotStored(obj) {
    let index;
    if ((index = this.showingObjects.findIndex(x => x.id === obj.id)) !== -1) {
      this.showingObjects.splice(index, 1);
      this._hideObject(obj);
    }
  }
  /**
   * Store and hide all objects in showing objects array
   */
  storeAllObjects() {
    this.showingObjects.forEach(x => this._hideObject(x));
    this.showingObjects = [];
  }
}