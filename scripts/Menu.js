import { game } from "./main.js";

/**
 * Class for handle game's menu
 */
export class Menu {
  constructor() {
    this._menuSection = document.getElementById("menu");
    this._gameSection = document.getElementById("background");

    this._gifs = [
      document.getElementById("fGif"),
      document.getElementById("nGif"),
      document.getElementById("aGif")
    ];
    this._gifsTimerId;
    this.gifsAnimation = true;
    this._lastAnimation;
  }
  /**
   * Activate music and menu GIF's animations.
   */
  activateSounds() {
    game.audio.changeMusicByGameState();
    if (this.gifsAnimation) {
      this._animateGifs();
      this._gifsTimerId = setInterval(() => { this._animateGifs(); }, 10000);
    }
  }
  /**
   * Show menu.
   */
  goToMenu() {
    this._menuSection.style.display = "block";
    this._gameSection.style.display = "none";
    if (this.gifsAnimation) {
      this._animateGifs();
      this._gifsTimerId = setInterval(() => { this._animateGifs(); }, 10000);
    }
  }
  /**
   * Show game.
   */
  goToGame() {
    clearInterval(this._gifsTimerId);
    this._menuSection.style.display = "none";
    this._gameSection.style.display = "block";
    player.responsive = false;
    setTimeout(() => { game.start(); }, 300);
  }
  /**
   * Returns true if the menu is showing right now, false otherwise.
   */
  gameIsInMenu() {
    return this._menuSection.style.display === "block";
  }
  /**
   * Private function to animate the menu's GIFs.
   */
  _animateGifs() {
    let animation;
    while ((animation = Math.round(Math.random() * 2)) === this._lastAnimation);

    setTimeout(() => { game.audio.playAudio(`assets/music/sounds/alien-talk-${animation}.mp3`, 0.15); }, 1500);
    for (let i = 0; i < this._gifs.length; i++) {
      this._gifs[i].classList.remove(`menuGifsFinal${this._lastAnimation}`);
      setTimeout(() => {
        this._gifs[i].classList.add(`menuGifsFinal${animation}`);
      }, 1500 * i);
    }
    this._lastAnimation = animation;
  }
}