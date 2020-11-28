import { Menu } from "./Menu.js";
import { Game } from "./controller/Game.js";
import { Player } from "./model/Player.js";

/**
 * Object that controls all general aspects of the game
 */
export const game = new Game(8);
/**
 * Object to handle and interact tieh game's menu
 */
export const menu = new Menu();
/**
 * The player
 */
export const player = new Player();

document.addEventListener("keydown", function (e) {
  if (!player.responsive)
    return;

  /*
  Keys direction correspondence
  key Left => -1,  0
  right =>     1,  0
  up =>        0, -1
  down =>      0,  1
  */

  switch (e.key) {
    case "ArrowLeft":
      player.playerDirection[0] = -1;
      break;
    case "ArrowRight":
      player.playerDirection[0] = 1;
      break;
    case "ArrowUp":
      if (game.gameState !== "spaceInvaders")
        player.playerDirection[1] = -1;
      break;
    case "ArrowDown":
      if (game.gameState !== "spaceInvaders")
        player.playerDirection[1] = 1;
      break;
    case "t":
      game.cheatToFinal();
      break;
  }
  if (!player.movementAnimationId)
    player.move();

  if (e.key === " " && !player.shooting) {
    player.shooting = true;
    player.shoot();
  }
});

document.addEventListener("keyup", e => {
  if (!player.responsive)
    return;

  switch (e.key) {
    case "ArrowLeft":
      player.playerDirection[0] = 0;
      break;
    case "ArrowRight":
      player.playerDirection[0] = 0;
      break;
    case "ArrowUp":
      player.playerDirection[1] = 0;
      break;
    case "ArrowDown":
      player.playerDirection[1] = 0;
      break;
  }

  if (e.key === " ") {
    player.shooting = false;
  }
});

window.onload = () => {
  document.getElementById("startButton").onclick = () => { menu.goToGame(); };
  document.getElementById("soundB").onclick = () => { menu.activateSounds(); };
};