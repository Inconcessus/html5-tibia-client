const Thing = function(id) {

  /*
   * Class Thing
   * Wrapper for things that reference the data object buffer: this is the base object inhereted by e.g. Tile, Item, etc..
   */

  // Each thing has an identifier and a parent
  this.id = id;
  this.__parent = null;

  // Thing can be globally animated
  if(this.id !== 0 && gameClient.hasExtendedAnimations() && this.isAnimated()) {
    this.__generateExtendedDurations();
  }

}

Thing.prototype.DEFAULT_FRAME_LENGTH_MS = 500;

Thing.prototype.setParent = function(parent) {

  /*
   * Function Thing.setParent
   * Sets the parent of a thing: e.g., a tile or container
   */

  // Reference the parent container or tile
  this.__parent = parent;

}

Thing.prototype.isAnimated = function() {

  /*
   * Function Thing.isAnimated
   * Returns true if the thing is animated
   */

  return this.getFrameGroup(FrameGroup.prototype.NONE).animationLength > 1;

}

Thing.prototype.getFrame = function() {

  /*
   * Function Thing.getFrame
   * Sets the parent of the container
   */

  // There are no animations for the thing: return the first frame
  if(!this.isAnimated()) {
    return 0;
  }

  // Return the global frame
  return this.__getGlobalFrame();

}

Thing.prototype.isMultiUse = function() {

  /*
   * Function Item.isMultiUse
   * Returns true if the item can be used with something else
   */

  return this.hasFlag(PropBitFlag.prototype.flags.DatFlagMultiUse);

}

Thing.prototype.isElevation = function() {

  /*
   * Function Thing.isElevation
   * Returns true if the thing has an elevation configured
   */

  return this.hasFlag(PropBitFlag.prototype.flags.DatFlagElevation);

}

Thing.prototype.isRotateable = function() {

  /*
   * Function Thing.isRotateable
   * Returns true if the item is rotateable
   */

  return this.hasFlag(PropBitFlag.prototype.flags.DatFlagRotateable);

}

Thing.prototype.isPickupable = function() {

  /*
   * Function Thing.isPickupable
   * Returns true if the item is pickupable
   */

  return this.hasFlag(PropBitFlag.prototype.flags.DatFlagPickupable);

}

Thing.prototype.isSplash = function() {

  /*
   * Function Thing.isSplash
   * Returns true if the item is a fluid splash
   */

  return this.hasFlag(PropBitFlag.prototype.flags.DatFlagSplash);

}

Thing.prototype.isStackable = function() {

  /*
   * Function Thing.isStackable
   * Returns true if the item is stackable
   */

  return this.hasFlag(PropBitFlag.prototype.flags.DatFlagStackable);

}

Thing.prototype.isFluidContainer = function() {

  /*
   * Function Thing.isFluidContainer
   * Returns true if the item is a fluid container
   */

  return this.hasFlag(PropBitFlag.prototype.flags.DatFlagFluidContainer);

}

Thing.prototype.isLight = function() {

  /*
   * Function Thing.isLight
   * Returns true if the thing is a light emitter
   */

  return this.hasFlag(PropBitFlag.prototype.flags.DatFlagLight)

}

Thing.prototype.__getGlobalFrame = function() {

  /*
   * Function Thing.__getGlobalFrame
   * Returns frame from a global counter that is not specific to a single item (e.g. patterns)
   */

  let frameGroup = this.getFrameGroup(FrameGroup.prototype.NONE);

  // Global animations for old versions
  if(!gameClient.hasExtendedAnimations()) {
    return ((gameClient.renderer.__nMiliseconds / this.DEFAULT_FRAME_LENGTH_MS) % frameGroup.animationLength) | 0;
  }

  // Calculate the delta of the animation
  let delta = gameClient.renderer.__nMiliseconds % this.__durationsSum;

  // Compare it to the cumulative duration of all the frames
  for(let i = 0; i < this.__durations.length; i++) {
    if(this.__durations[i] >= delta) {
      return i;
    }
  }

  return 0;

}

Thing.prototype.getMinimapColor = function() {

  /*
   * Function Thing.getMinimapColor
   * Returns the minimap color of a thing
   */

  if(this.id === 0) {
    return null;
  }

  // The flag is not set: return the nullptr
  if(!this.hasFlag(PropBitFlag.prototype.flags.DatFlagMinimapColor)) {
    return null;
  }

  return this.getDataObject().properties.minimapColor;

}

Thing.prototype.getSprite = function(group, index) {

  /*
   * Function Thing.getSprite
   * Wraps a call to the dataobject
   */

  return this.getDataObject().frameGroups[group].getSprite(index);

}

Thing.prototype.getFrameGroup = function(group) {

  return this.getDataObject().frameGroups[group];

}

Thing.prototype.getDataObject = function() {

  /*
   * Function Thing.getDataObject
   * Returns the data object based on the identifier
   */

  return gameClient.dataObjects.get(this.id);

}

Thing.prototype.hasFlag = function(flag) {

  /*
   * Function Thing.hasFlag
   * Returns whether the flag in the data object is set
   */

  return this.getDataObject().flags.get(flag);

}

Thing.prototype.__generateExtendedDurations = function() {

  /*
   * Function Thing.__generateExtendedDurations
   * Generates the cumulative duration for all of the extended frames
   */

  // Fetch the frames
  let durations = this.getFrameGroup(FrameGroup.prototype.NONE).animationLengths;
  let sum = 0;

  // Cumulative sum between the random minimum and maximum of all the frames
  this.__durations = durations.map(function(duration) {
    return sum += Number.prototype.random(duration.min, duration.max);
  });

  this.__durationsSum = sum;

}
