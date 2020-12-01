import { CollisionableObject } from "../base/CollisionableObject.js";
import { game } from "../../main.js";

/**
 * Class for player bullets
 */
export class PlayerBullet extends CollisionableObject {
  constructor(x, y) {
    let elem = new Image();
    elem.src = "assets/images/bullets/playerBullet.png";
    elem.classList.add("bullet");
    super(elem, x, y, game.bulletSize[0], game.bulletSize[1]);

    this.audio = game.audio.playAudio("assets/music/sounds/playerLaser.mp3");
  }
  /**
   * Iterates all "space invaders" part enemies to see if collides with one of them
   */
  isCollidingWithAnEnemy() {
    /*
    Check for collisions only in the cell the bullet is right now and adjacents
    */
    let cells = game.model.grid.getCellAndAdjacentsByCoordinates(this.x, this.y);
    for(let enemy of cells) {
      if (enemy && this.collideWith(enemy)) {
        return enemy;
      }
    }
    return null;
  }
  /**
   * Returns true if the bullet is colliding with a "scroll vertical" part enemy
   */
  isCollidingWithASVEnemy() {
    for (let i = 0; i < game.model.enemiesPool.showingObjects.length; i++) {
      if (this.collideWith(game.model.enemiesPool.showingObjects[i]))
        return game.model.enemiesPool.showingObjects[i];
    }
  }
  /**
   * move the bullet always up
   */
  move() {
    /*
    Aumentas y en x pixeles (game.bulletStep)
    
    Si la bala llega a arriba (game.height)
      para y destruye la bala
    else Si colisiona con enemigo
      para, destruyela bala, destruye enemigo
    de otra forma
      window.requestAnimationFrame(this.move)
    */
    if (this.y + this.height > 0) {
      this.y -= game.bulletStep;
      if (!game.model.finalBoss || game.model.finalBoss.elem.style.display === "none") {
        var collidingEnemy = game.gameState === "spaceInvaders" ? this.isCollidingWithAnEnemy() : this.isCollidingWithASVEnemy();

        if (collidingEnemy) {
          //game.canvas.removeChild(this.elem);
          game.model.playerBulletsPool.storeObject(this);
          game.model.removeEnemy(collidingEnemy);
        } else if (this.collideWith(game.model.bonus)) {
          game.model.removeBonusEnemy();
          //game.canvas.removeChild(this.elem);
          game.model.playerBulletsPool.storeObject(this);
        } else {
          window.requestAnimationFrame(() => { this.move(); });
        }
      } else {
        if (this.collideWith(game.model.finalBoss)) {
          game.model.finalBoss.bossHitted(this);
          //game.canvas.removeChild(this.elem);
          game.model.playerBulletsPool.storeObject(this);
        } else {
          window.requestAnimationFrame(() => { this.move(); });
        }
      }
    } else {
      //game.canvas.removeChild(this.elem);
      game.model.playerBulletsPool.storeObject(this);
    }
  }
}