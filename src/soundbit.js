const SoundBit = function(ids) {

  /*
   * Class SoundBit
   * Wrapper for random soundbits of the same type
   */

  this.ids = ids;

}

SoundBit.prototype.play = function() {

  /*
   * Class SoundBit.play
   * Fully plays one of the soundbits
   */

  // Draw a random audio element from the pool and clone it
  let id = this.ids[Math.floor(Math.random() * this.ids.length)];
  let element = document.getElementById(id).cloneNode();

  // Set the volume to something low and play
  element.volume = 0.5;
  element.play();

}