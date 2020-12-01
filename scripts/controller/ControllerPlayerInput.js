import { game, player } from "../main.js";

/*
Keys direction correspondence
key Left => -1,  0
right =>     1,  0
up =>        0, -1
down =>      0,  1
*/
/*
At keydown push player input key into horizontal or vertical key
At keyup remove only up key from correspondent keys array
*/

/**
 * Controller for player keys input. Remember keys pressed so the player ship doesn't do strange things if player accidentally or purposedfully press multiple keys at the same time.
 */
export class ControllerPlayerInput {
  constructor() {
    this.keysHorizontal = [0];
    this.keysVertical = [0];
    this._responsive = false;
  }
  get responsive() {return this._responsive; }
  set responsive(value) {
    this._responsive = value;
    if(!this._responsive) {
      this.keysHorizontal = [0];
      this.keysVertical = [0];
      this.setPlayerDirection();
    }
  }
  setPlayerDirection(){
    player.playerDirection = [
      this.keysHorizontal[this.keysHorizontal.length - 1], 
      this.keysVertical[this.keysVertical.length - 1]
    ];
  }
  keyDown(key) {
    if (!this.responsive)
      return;

    switch (key) {
      case "ArrowLeft"://player.playerDirection[0] = -1;
        if(!this.keysHorizontal.includes(-1))
          this.keysHorizontal.push(-1);
        break;
      case "ArrowRight"://player.playerDirection[0] = 1;
        if(!this.keysHorizontal.includes(1))
          this.keysHorizontal.push(1);
        break;
      case "ArrowUp"://player.playerDirection[1] = -1;
        if (game.gameState !== "spaceInvaders" && !this.keysVertical.includes(-1)) {
          this.keysVertical.push(-1);
        }
        break;
      case "ArrowDown"://player.playerDirection[1] = 1;
        if (game.gameState !== "spaceInvaders" && !this.keysVertical.includes(1)) {
          this.keysVertical.push(1);
        }
        break;
      case "t":
        game.cheatToFinal();
        break;
      case " ":
        if (!player.shooting) {
          player.shooting = true;
          player.shoot();
        }
    }

    this.setPlayerDirection();
    if (!player.movementAnimationId)
      player.move();
  }
  keyUp(key) {
    if (!this.responsive)
      return;

    let index;
    switch (key) {
      case "ArrowLeft"://player.playerDirection[0] = -1;        
        if((index = this.keysHorizontal.indexOf(-1)) !== -1)
          this.keysHorizontal.splice(index, 1);
        break;
      case "ArrowRight"://player.playerDirection[0] = 1;
        if((index = this.keysHorizontal.indexOf(1)) !== -1)
          this.keysHorizontal.splice(index, 1);
        break;
      case "ArrowUp"://player.playerDirection[1] = -1;
        if (game.gameState !== "spaceInvaders") {
          if((index = this.keysVertical.indexOf(-1)) !== -1)
            this.keysVertical.splice(index, 1); 
        }
        break;
      case "ArrowDown"://player.playerDirection[1] = 1;
        if (game.gameState !== "spaceInvaders") {
          if((index = this.keysVertical.indexOf(1)) !== -1)
            this.keysVertical.splice(index, 1); 
        }
        break;
      case " ":
        if (player.shooting) {
          player.shooting = false;
        }
    }

    this.setPlayerDirection();
  }
}