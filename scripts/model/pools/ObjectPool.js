
/**
 * Class for pools of objects. One should create one different pool for each desired object type.
 * @param {function} objCreationCallback Use this callback function to create a new object if there are no more objects stored at the pool
 */
export class ObjectPool {
  constructor(objCreationCallback) {
    this.hiddenCoords = [-10000, -10000];
    this.showingObjects = [];
    this.hiddenObjects = [];

    this.objCreationCallback = objCreationCallback;
  }
  _setObjProperties(obj, properties) {
    if(properties) {
      for(let prop in properties) {
        obj[prop] = properties[prop];
      }
    }
  }
  /**
   * Function used to retrieve an object from the pool. If there are objects stored at the pool, it retrieves the object from the pool and return it, in other case the creation callback function is used to create a new object, add it as a 'showing in screen' object and return it.
   * @param {any} properties Properties to be injected into new object
   */
  getNewObject(properties) {
    //console.warn(this.hiddenObjects)
    if (this.hiddenObjects.length > 0) {
      let obj = this.hiddenObjects.pop();
      this.showingObjects.push(obj);
      obj.elem.style.display = "inline";
      this._setObjProperties(obj, properties);
      console.warn('Get new object from store: ', obj)
      return obj;
    } else {
      let obj = this.objCreationCallback();
      this._setObjProperties(obj, properties);
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
    if(index === -1)
      return;
    console.log(`STORE: objId ${obj.id} ; showingId ${this.showingObjects[index].id}`)
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
    if(obj.hasOwnProperty("collisionable"))
      obj.collisionable = false;
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