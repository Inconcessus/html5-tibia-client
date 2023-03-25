const FrameGroup = function() {

  /*
   * Class FrameGroup
   * Container for a single frame group (e.g., GROUP_IDLE or GROUP_MOVING) that defines a number of animated frames
   */

  // All properties to be read
  this.width = 0;
  this.height = 0;

  // Layers concerns blending of two layers (e.g., outfits)
  this.layers = 1;

  // Patterns are for things like void and outfits (addons, mounts)
  this.pattern = new Position(0, 0, 0);
  this.animationLength = 1;
  this.__totalAnimationLength = 0;

  // Array for references to the sprite identifiers
  this.sprites = new Array();

}

FrameGroup.prototype.NONE = 0;
FrameGroup.prototype.GROUP_IDLE = 0;
FrameGroup.prototype.GROUP_MOVING = 1;

FrameGroup.prototype.getAlwaysAnimatedFrame = function() {

  /*
   * Function DataObject.getAlwaysAnimatedFrame
   * Returns the current frame for data objects that are always animated
   */

  // Is not animated
  if(!this.isAnimated()) {
    return 0;
  }

  // Get the currently bounded miliseconds
  let current = gameClient.renderer.__nMiliseconds % this.__totalAnimationLength;
  let sum = 0;

  // For old versions
  if(gameClient.clientVersion === 740) {
    return Math.floor((gameClient.renderer.__nMiliseconds % (BoxAnimation.prototype.DEFAULT_BLINK_LENGTH_MS * this.animationLength)) / BoxAnimation.prototype.DEFAULT_BLINK_LENGTH_MS);
  }

  // Go over all lenghts
  for(let i = 0; i < this.animationLengths.length; i++) {

    // Add the current minimum length
    sum += this.animationLengths[i].min;
 
    // Need this frame
    if(sum >= current) {
      return i;
    }

  }

  return 0;

}

FrameGroup.prototype.isValidIndex = function(index) {

  /*
   * Function FrameGroup.isValidIndex
   * Returns true if the sprite index is valid for the frame group
   */

  return index >= 0 && index < this.sprites.length;

}

FrameGroup.prototype.getSprite = function(index) {

  /*
   * Function FrameGroup.getSprite
   * Returns the sprite of the data object at a given index
   */

  // Must be a valid index
  if(!this.isValidIndex(index)) {
    return null;
  }

  return gameClient.spriteBuffer.get(this.sprites[index]);

}

FrameGroup.prototype.isAnimated = function() {

  /*
   * Function DataObject.isAnimated
   * Returns true if the data object has an animation and multiple frames
   */

  return this.animationLength > 1;

}

FrameGroup.prototype.setAnimation = function(animations) {

  /*
   * Function DataObject.setAnimation
   * Sets the animation state
   */

  this.animationLengths = animations;

  // Save the sum of all the animation lengths
  this.__totalAnimationLength = animations.reduce((a, b) => a + b.min, 0);

}

FrameGroup.prototype.setAnimationLength = function(length) {

  /*
   * Function DataObject.setAnimationLength
   * Sets the animation length
   */

  this.animationLength = length;

}

FrameGroup.prototype.getSpriteId = function(frame, xPattern, yPattern, zPattern, layer, x, y) {

  /*
   * Function DataObject.getSpriteIndex
   * Returns the correct sprite index (copied over from Edubart OTClient)
   */

  let index = this.getSpriteIndex(frame, xPattern, yPattern, zPattern, layer, x, y);

  if(!this.isValidIndex(index)) {
    return 0;
  }

  return this.sprites[index];
	
}

FrameGroup.prototype.getSpriteIndex = function(frame, xPattern, yPattern, zPattern, layer, x, y) {

  /*
   * Function DataObject.getSpriteIndex
   * Returns the correct sprite index (copied over from Edubart OTClient)
   */

  return ((((((frame *
         this.pattern.z + zPattern) *
         this.pattern.y + yPattern) *
         this.pattern.x + xPattern) *
         this.layers + layer) *
         this.height + y) *
         this.width + x);

}

FrameGroup.prototype.setLayers = function(layers) {

  /*
   * Function DataObject.setLayers
   * Sets the number of layers of the data object
   */

  this.layers = layers;

}

FrameGroup.prototype.setPattern = function(x, y, z) {

  /*
   * Function DataObject.setPattern
   * Updates data object properties with the specified pattern (x, y, z)
   */

  this.pattern = new Position(x, y, z);

}

FrameGroup.prototype.setSize = function(width, height) {

  /*
   * Function DataObject.setSize
   * Sets the size of the data object
   */

  this.width = width;
  this.height = height;

}

FrameGroup.prototype.getNumberSprites = function() {

  /*
   * Function DataObject.getNumberSprites
   * Returns the total number of frames (sprites)
   */

  // Calculate the total number of sprites of the thing
  return (this.width *
    this.height *
    this.layers *
    this.pattern.x *
    this.pattern.y *
    this.pattern.z *
    this.animationLength);

}
