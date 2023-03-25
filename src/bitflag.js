"use strict";

const BitFlagGenerator = function(flags) {

  /*
   * Function BitFlagGenerator
   * Wrapper to create a bitflag class where true/false properties can be stored efficiently in a single number
   *
   * API:
   *
   * @BitFlagGenerator.get(flag) - returns true when a flag is set
   * @BitFlagGenerator.set(flag) - sets a flag
   * @BitFlagGenerator.unset(flag) - unsets a flag
   * @BitFlagGenerator.print() - prints all the flags that are set to true
   *
   */

  // Only 31 available bits in JavaScript..
  if(flags.length > 31) {
    throw("Cannot construct bit flag with more than 31 options.");
  }

  const _BitFlag = function() {

    /*
     * Class _BitFlag
     * Class generator for arbitrary bit flag classes
     */

    this.flag = 0;

  }

  _BitFlag.prototype = Object.create(BitFlagGenerator.prototype);
  _BitFlag.prototype.constructor = _BitFlag;
  _BitFlag.prototype.flags = new Object();

  // Add all flags to the prototype
  flags.forEach(function(flag, i) {
    _BitFlag.prototype.flags[flag] = 1 << i;
  });

  // Return the new class
  return _BitFlag;

}

BitFlagGenerator.prototype.get = function(flag) {

  /*
   * Function BitFlagGenerator.get
   * Returns true if the flag is set
   */

  return !!(this.flag & flag);

}

BitFlagGenerator.prototype.set = function(flag) {

  /*
   * Function BitFlagGenerator.set
   * Sets a particular bitflag
   */

  this.flag |= flag;

}

BitFlagGenerator.prototype.unset = function(flag) {

  /*
   * Function BitFlagGenerator.unset
   * Unsets a flag
   */

  this.flag &= ~this.flags[flag];

}

BitFlagGenerator.prototype.print = function() {

  /*
   * Function BitFlagGenerator.print
   * Prints all the flags that are set in the bitflag
   */

  Object.keys(this.flags).forEach(function(flag) {
    if(this.get(this.flags[flag])) {
      console.log(flag);
    }
  }, this);

}

// Create the property bit flag
const PropBitFlag = BitFlagGenerator([
  "DatFlagGround",
  "DatFlagGroundBorder",
  "DatFlagOnBottom",
  "DatFlagOnTop",
  "DatFlagContainer",
  "DatFlagStackable",
  "DatFlagForceUse",
  "DatFlagMultiUse",
  "DatFlagWritable",
  "DatFlagWritableOnce",
  "DatFlagFluidContainer",
  "DatFlagSplash",
  "DatFlagNotWalkable",
  "DatFlagNotMoveable",
  "DatFlagBlockProjectile",
  "DatFlagNotPathable",
  "DatFlagNoMoveAnimation",
  "DatFlagPickupable",
  "DatFlagHangable",
  "DatFlagHookSouth",
  "DatFlagHookEast",
  "DatFlagRotateable",
  "DatFlagLight",
  "DatFlagDontHide",
  "DatFlagTranslucent",
  "DatFlagDisplacement",
  "DatFlagElevation",
  "DatFlagLyingCorpse",
  "DatFlagAnimateAlways",
  "DatFlagMinimapColor"
]);

// Create the property bit flag
const FinBitFlag = BitFlagGenerator([
  "DatFlagChargeable"
]);