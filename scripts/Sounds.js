import { menu } from "./main.js";

/**
 * Object to handle of sounds and music of the game
 */
export class Sounds {
  /**
   * Constructor for Sounds object
   * @param {float} volume Overall volume of all sounds and music of the game
   */
  constructor(volume) {
    this.volume = volume;
    this.gamePlayList = [
      "assets/music/KineticFloorWave.mp3",
      "assets/music/CruiseOnPolygon.mp3",
      "assets/music/ASoloGunner.mp3"
    ];
    this.menuPlayList = [
      "assets/music/menu/menu.mp3",
      "assets/music/menu/battle.mp3",
      "assets/music/menu/loading.mp3",
      "assets/music/menu/slow-travel.mp3"
    ];
    this.currentSong = 0;

    this.songsAudio = document.getElementById("musicAudio");
    this.songsAudio.src = this.menuPlayList[0];
    this.songsAudio.volume = this.volume - 0.2;
    this.songsAudio.load();
    this.songsAudio.play();
    this.songsAudio.addEventListener("ended", () => { this.changeMusicByGameState(); });
  }
  /**
   * Change between menu music and in-game music
   */
  changeMusicByGameState() {
    this.songsAudio.src = menu.gameIsInMenu() ?
      this.menuPlayList[(this.currentSong++) % this.menuPlayList.length] :
      this.gamePlayList[(this.currentSong++) % this.gamePlayList.length];
    this.songsAudio.load();
    this.songsAudio.play();
  }
  /**
   * Plays a specific audio file
   * @param {string} path Path to the audio file
   * @param {float} volume If setted it overwrites the overall volume only for this audio
   */
  playAudio(path, volume) {
    let audio = new Audio(path);
    audio.volume = volume ? volume : this.volume;
    audio.play();
  }
}