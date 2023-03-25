const Item = function(id, count) {

  /*
   * Class Item
   * Container for an item with an identifier and count
   *
   * API:
   *
   * @Item.getCount() - returns the count of the item
   * @Item.isHookSouth() - returns true if the item is a hookable item south
   * @Item.isHookEast() - returns true if the item is a hookable item east
   * @Item.isHangable() - returns true if the item is hangable
   *
   */

  // Inherits from thing
  Thing.call(this, id);

  // The count of an item (defaults to 0 with no count)
  this.count = count;

}

Item.prototype = Object.create(Thing.prototype);
Item.prototype.constructor = Item;

Item.prototype.getPattern = function() {

  /*
   * Function Item.getPattern
   * Returns the pattern of an item: this may be different for various types of items (e.g., stackables, hangables, and liquids)
   */

  // Things have no frame group
  let frameGroup = this.getFrameGroup(FrameGroup.prototype.NONE);

  // If hangable get the hanging pattern instead
  if(this.isHangable()) {
    return this.__getHangablePattern();
  }

  // If stackable get the stackable pattern instead
  if(this.isStackable() && frameGroup.pattern.x == 4 && frameGroup.pattern.y == 2) {
    return this.__getCountPattern();
  }

  // No pattern
  return Position.prototype.NULL;

}

Item.prototype.getCount = function() {

  /*
   * Function Item.getCount
   * Returns the count of an item
   */

  return this.count;

}

Item.prototype.isHookSouth = function() {

  /*
   * Function Item.isHookSouth
   * Returns true if the item can be hooked on south-facing walls
   */

  return this.hasFlag(PropBitFlag.prototype.flags.DatFlagHookSouth);

}

Item.prototype.isHookEast = function() {

  /*
   * Function Item.isHookEast
   * Returns true if the item can be hooked on east-facing walls
   */

  return this.hasFlag(PropBitFlag.prototype.flags.DatFlagHookEast);

}

Item.prototype.isHangable = function() {

  /*
   * Function Item.isHangable
   * Returns true if the item can be used with something else
   */

  return this.hasFlag(PropBitFlag.prototype.flags.DatFlagHangable);

}

Item.prototype.isPickupable = function() {

  /*
   * Function Item.isPickupable
   * Returns true if the item can be picked up
   */

  return this.hasFlag(PropBitFlag.prototype.flags.DatFlagPickupable);

}

Item.prototype.isElevation = function() {

  /*
   * Function Item.isWalkable
   * Returns true when an item is walkable 
   */

  return this.hasFlag(PropBitFlag.prototype.flags.DatFlagElevation);

}

Item.prototype.isWalkable = function() {

  /*
   * Function Item.isWalkable
   * Returns true when an item is walkable 
   */

  return !this.hasFlag(PropBitFlag.prototype.flags.DatFlagNotWalkable);

}

Item.prototype.isMoveable = function() {

  /*
   * Function Item.isMoveable
   * Returns true if the item is moveable
   */

  return !this.hasFlag(PropBitFlag.prototype.flags.DatFlagNotMoveable);

}

Item.prototype.isStackable = function() {

  /*
   * Function Item.isStackable
   * Returns true when an item has its stackable flag set
   */

  return this.hasFlag(PropBitFlag.prototype.flags.DatFlagStackable);

}

Item.prototype.__getHangablePattern = function() {

  /*
   * Function Item.__getHangablePattern
   * Returns the hangable pattern of a thing that can be hooked on a wall
   */

  // If the thing has a parent that is a tile
  if(this.__parent instanceof Tile) {
    
    if(this.__parent.isHookSouth()) {
      return new Position(1, 0, 0);
    } else if(this.__parent.isHookEast()) {
      return new Position(2, 0, 0);
    }

  }

  // The item is on the floor: no pattern
  return Position.prototype.NULL;

}

Item.prototype.__getCountPattern = function() {

  /*
   * Function Item.__getCountPattern
   * Returns the pattern for stackable items that shows the respective item count
   */

  let count = this.getCount();

  // These are hardcoded patterns
  if(count === 1) {
    return Position.prototype.NULL;
  } else if(count === 2) {
    return new Position(1, 0, 0);
  } else if(count === 3) {
    return new Position(2, 0, 0);
  } else if(count === 4) {
    return new Position(3, 0, 0);
  } else if(count === 5) {
    return new Position(4, 0, 0);
  } else if(count < 10) {
    return new Position(0, 1, 0);
  } else if(count < 25) {
    return new Position(1, 1, 0);
  } else if(count < 50) {
    return new Position(2, 1, 0);
  } else {
    return new Position(3, 1, 0);
  }

}
