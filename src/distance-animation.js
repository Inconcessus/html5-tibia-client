"use strict";

const DistanceAnimation = function(id, fromPosition, toPosition) {

  /*
   * Class DistanceAnimation
   * Container for animations that go from one position to another
   */

  Animation.call(this, id);

  // Save from and to positions
  this.fromPosition = fromPosition;
  this.toPosition = toPosition;

}

DistanceAnimation.prototype = Object.create(Animation.prototype);
DistanceAnimation.prototype.constructor = DistanceAnimation;

DistanceAnimation.prototype.__generateDurations = function() {

  /*
   * Function DistanceAnimation.__generateDurations
   * Generates durations for the distance animation to exist on screen
   */

  return [2 * Animation.prototype.DEFAULT_FRAME_LENGTH_MS];

}

DistanceAnimation.prototype.getFraction = function() {

  /*
   * Function DistanceAnimation.getFraction
   * Returns the fraction of how far the distance animation has completed
   */

  return Math.min(1, (performance.now() - this.__created) / (2 * Animation.prototype.DEFAULT_FRAME_LENGTH_MS));

}

DistanceAnimation.prototype.getPosition = function() {

  /*
   * Function DistanceAnimation.getPosition
   * Implements the getPosition API for distance animations and return the position the animation started on
   */

  return this.fromPosition;

}

DistanceAnimation.prototype.getPattern = function() {

  /*
   * Function DistanceAnimation.getPattern
   * Maps the distance projection from position to position
   */

  // Calculate the difference vector
  let x = this.fromPosition.x - this.toPosition.x;
  let y = this.fromPosition.y - this.toPosition.y;

  // Same tile.. return the sprite null pointer (which happens to be in the middle of the pattern)
  if(x === 0 && y === 0) {
    return new Position(4, 0, 0);
  }

  // Determine the angle of the residual vector scaled between 0 and 8
  let angle = Math.floor(8 * (1.125 * Math.PI + Math.atan2(y, x)) / (2 * Math.PI));
 
  /*
   * Map to the correct sprite index
   * The angle is calculated from 0 to 2 PI starting but scaled from 0 to 8
   * The phase is shifted by 1/8th because it is conceptually easier to understand
   *
   *  1/2PI
   *    |
   * 0 -+- PI
   *    |
   *  3/2PI
   *
   * Sprite indices are as follows (go clockwise):
   * +-------+
   * | 0 1 2 |
   * | 3 4 5 |
   * | 6 7 8 |
   * +-------+
   *
   * Where 4 is the nullptr
   */

  // Do the mapping
  switch(angle % 8) {
    case 0:
      return new Position(5, 0, 0);
    case 1:
      return new Position(8, 0, 0);
    case 2:
      return new Position(7, 0, 0);
    case 3:
      return new Position(6, 0, 0);
    case 4:
      return new Position(3, 0, 0);
    case 5:
      return new Position(0, 0, 0);
    case 6:
      return new Position(1, 0, 0);
    case 7:
      return new Position(2, 0, 0);
  }

}
