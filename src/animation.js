const Animation = function(id) {

  /*
   * Class Animation
   *
   * Wrapper for all effects & distance animations in the game client.
   *
   * Public API:
   *
   * @Animation.getPattern() - returns the null position (animations have no pattern)
   * @Animation.getFrame() - returns the current frame of the animation
   * @Animation.totalDuration() - returns the total duration of the animation
   * @Animation.expired() - returns true if the animation has expired
   *
   */

  // Inherits from thing and has a data object reference
  Thing.call(this, id);

  // Animations must keep track of when they were created
  this.__created = performance.now();

  // The durations specify how long each frame appears in miliseconds (cumulative array)
  this.__durations = this.__generateDurations();

}

Animation.prototype = Object.create(Thing.prototype);
Animation.prototype.constructor = Animation;

Animation.prototype.DEFAULT_FRAME_LENGTH_MS = 100;

Animation.prototype.getPattern = function() {

  /*
   * Function Animation.getPattern
   * Implements the required getPattern API for drawing (this returns a null position for animations)
   */

  return Position.prototype.NULL;

}

Animation.prototype.getFrame = function() {

  /*
   * Function Animation.getFrame
   * Returns the current frame of the animation
   */

  // Calculate the time between when the animation was created and now
  let delta = this.__getAnimationAge();

  // Compare it to the cumulative duration of all the frames
  for(let i = 0; i < this.__durations.length; i++) {
    if(this.__durations[i] >= delta) {
      return i;
    }
  }

  // Animation was expired: stay on last frame until it is removed
  return this.__durations.length - 1;

}

Animation.prototype.totalDuration = function() {

  /*
   * Function Animation.totalDuration
   * Returns the total duration of the animation (because the durations are cumulative it is the final entry)
   */

  return this.__durations.last();

}

Animation.prototype.expired = function() {

  /*
   * Function Animation.expired
   * Returns true when the animation has expired and can be removed 
   */

  // When all frames have been shown
  return this.__getAnimationAge() >= this.totalDuration();

}

Animation.prototype.__getAnimationAge = function() {

  /*
   * Function Animation.__getAnimationAge
   * Returns the "delta" of the animation that indicates how long it has existed on screen
   */

  return (performance.now() - this.__created);

}

Animation.prototype.__generateDefaultDurations = function() {

  /*
   * Function Animation.__generateDefaultDurations
   * Generates durations for old versions that have no extended animations
   */

  let duration = 0;
  let durations = new Array();

  // Get the number of frames from the framegorup
  let numberFrames = this.getFrameGroup(FrameGroup.prototype.NONE).animationLength;

  // Create an array with durations from the default frame length: cumulative
  for(let i = 0; i < numberFrames; i++) {
    durations.push(duration += this.DEFAULT_FRAME_LENGTH_MS);
  }

  return durations;

}

Animation.prototype.__generateExtendedDurations = function() {

  /*
   * Function Animation.__generateExtendedDurations
   * Generates the cumulative duration for all of the extended frames
   */

  // Fetch the frames
  let durations = this.getFrameGroup(FrameGroup.prototype.NONE).animationLengths;
  let sum = 0;

  // Cumulative sum between the random minimum and maximum of all the frames
  return durations.map(function(duration) {
    return sum += Number.prototype.random(duration.min, duration.max);
  });

}

Animation.prototype.__generateDurations = function() {

  /*
   * Function Animation.__generateDurations
   * Generates the cumulative duration for all of the frames
   */

  // Generate default durations per frame (old versions pre 10.98?)
  if(!gameClient.hasExtendedAnimations()) {
    return this.__generateDefaultDurations();
  }

  // Otherwise generate the animation durations from the configured minimum/maximum
  return this.__generateExtendedDurations();

}

const LoopedAnimation = function(id) {

  Thing.call(this, id);

}

LoopedAnimation.prototype = Object.create(Thing.prototype);
LoopedAnimation.prototype.constructor = LoopedAnimation;

LoopedAnimation.prototype.getPattern = function() {

  return Position.prototype.NULL;

}

LoopedAnimation.prototype.expired = function() {

  return false;

}

LoopedAnimation.prototype.getFrame = function() {

  return this.__getGlobalFrame();

}