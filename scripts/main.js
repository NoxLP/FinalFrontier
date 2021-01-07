import { Menu } from "./Menu.js";
import { Game } from "./controller/Game.js";
import { Player } from "./model/Player.js";

/**
 * Object that controls all general aspects of the game
 */
export const game = new Game(8);
/**
 * Object to handle and interact with game's menu
 */
export const menu = new Menu();
/**
 * The player
 */
export const player = new Player();

let lastPressedKey = "";
document.addEventListener("keydown", function (e) {
  if(e.key !== " " && e.key === lastPressedKey)
    return;
  
  lastPressedKey = e.key;
  game.playerInputController.keyDown(e);
});

document.addEventListener("keyup", e => {
  if(e.key === lastPressedKey)
    lastPressedKey = "";
    
  game.playerInputController.keyUp(e.key);
});

window.onload = () => {
  document.getElementById("startButton").onclick = () => { menu.goToGame(); };
  document.getElementById("soundB").onclick = () => { menu.activateSounds(); };
};