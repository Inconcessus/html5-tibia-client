const BoxAnimation = function(color) {

  /*
   * Function BoxAnimation
   * Wrapper for a box animation that is displayed on a character
   */

  // Inherits from animation with identifier 0
  Animation.call(this, 0);

  // The box animation has a color
  this.color = color;

}

BoxAnimation.prototype = Object.create(Animation.prototype);
BoxAnimation.prototype.constructor = BoxAnimation;

BoxAnimation.prototype.DEFAULT_BLINK_LENGTH_MS = 500;

BoxAnimation.prototype.__generateDurations = function() {

  /*
   * Function BoxAnimation.__generateDurations
   * Generates the duration for the box animation to display on screen
   */

  return [this.DEFAULT_BLINK_LENGTH_MS];

}