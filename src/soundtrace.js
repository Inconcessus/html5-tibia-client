const SoundTrace = function(id) {

  /*
   * Class SoundTrace
   * Wrapper for a single sound trace
   */

  this.element = document.getElementById(id);
  this.element.loop = true;

  this.__volume = 0;
  this.__volumeTarget = 0;
  this.__volumeStart = 0;

  this.__steps = 0;
  this.__counter = 0;
  this.__playing = false;


}

SoundTrace.prototype.start = function() {

  this.element.play();
  this.__playing = true;

}

SoundTrace.prototype.stop = function() {

  this.element.pause();
  this.element.currentTime = 0;
  this.__playing = false;

}

SoundTrace.prototype.tick = function() {

  /*
   * Function SoundTrace.tick
   * Single tick for a sound trace
   */

  if(this.__counter === 0) {
    return;
  }

  // Linear interpolation
  this.__volume = this.__volumeTarget + ((this.__counter - 1) / this.__steps) * (this.__volumeStart - this.__volumeTarget);
  this.__counter--;

  this.element.volume = this.__volume;

  // Whether to start or stop the music
  if(this.__volume === 0) {
    this.stop();
  } else if(!this.__playing) {
    this.start();
  }

}

SoundTrace.prototype.setVolume = function(volume) {

  /*
   * Function SoundTrace.setVolume
   * Sets the volume of a single sound trace
   */

  this.__volumeStart = this.__volume
  // Do not exceed the master volume
  this.__volumeTarget = Math.min(gameClient.interface.soundManager.__masterVolume, volume);

  this.__steps = (1E3 * Math.abs(this.__volume - this.__volumeTarget)) | 0;
  this.__counter = this.__steps;

  return this;

}