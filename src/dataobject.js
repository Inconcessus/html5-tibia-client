"use strict";

const DataObject = function({ flags, properties }) {

  /*
   * Class DataObject
   * Container for a generic data object class: these definitions are loaded from Tibia.dat
   *
   * API:
   *
   * DataObject.isAlwaysAnimated() - Returns true if the data object is always animated
   * DataObject.setGroupCount(count) - Sets the group count of the data object
   * DataObject.getFrameGroup(group) - Returns the frame group for a particular state
   *
   */

  // Properties inherent to the object
  this.flags = flags;
  this.properties = properties;

  // Frame groups define what sprites to use for idling/walking
  this.frameGroups = new Array();

  // Sprite groups are for idling / walking: always standard a single
  this.groupCount = 1;

}

DataObject.prototype.isAlwaysAnimated = function() {

  /*
   * Function DataObject.isAlwaysAnimated
   * Returns true when the object is supposed to be always animated (not only when moving like flying wasps)
   */

  // Read the respective flag
  return this.flags.get(PropBitFlag.prototype.flags.DatFlagAnimateAlways);

}

DataObject.prototype.setGroupCount = function(count) {

  /*
   * Function DataObject.setGroupCount
   * Sets the group count of the data object
   */

  this.groupCount = count;

}

DataObject.prototype.getFrameGroup = function(group) {

  /*
   * Function DataObject.getFrameGroup
   * Returns the requested frame group
   */

  // Always animated: only one frame group
  if(this.groupCount === 1) {
    return this.frameGroups[FrameGroup.prototype.NONE];
  }

  // Make sure to return a valid frame group
  return this.frameGroups[group.clamp(0, this.groupCount - 1)];

}
