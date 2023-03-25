const Outfit = function(outfit) {

  /*
   * Class Outfit
   * Wrapper for an outfit class
   */

  this.id = outfit.id;
  this.details = outfit.details;
  this.mount = outfit.mount;

  this.mounted = outfit.mounted;
  this.addonOne = outfit.addonOne;
  this.addonTwo = outfit.addonTwo;

}

Outfit.prototype.equals = function(other) {

  /*
   * Function Outfit.equals
   * Check if two outfits are equal by doing a serialisation
   */

  return JSON.stringify(this.serialize()) === JSON.stringify(other.serialize());

}

Outfit.prototype.hasLookDetails = function() {

  /*
   * Function Outfit.hasLookDetails
   * Returns true if the outfit (parent data object) has look details
   */

  return this.getDataObject().frameGroups[0].layers > 1;

}

Outfit.prototype.copy = function() {

  /*
   * Function Outfit.copy
   * Copies the outfit to a new copy in memory
   */

  return new Outfit(this.serialize());

}

Outfit.prototype.serialize = function() {

  /*
   * Function Outfit.serialize
   * Serializes the outfit
   */

  return new Object({
    "id": this.id,
    "details": {
      "head": this.details.head,
      "body": this.details.body,
      "legs": this.details.legs,
      "feet": this.details.feet
    },
    "mount": this.mount,
    "mounted": this.mounted,
    "addonOne": this.addonOne,
    "addonTwo": this.addonTwo
  })

}

Outfit.prototype.toString = function() {

  /*
   * Function Outfit.toString
   * Serializes the outfit information to a string
   */

  return new Array(
    this.id,
    "(" + this.details.head + ", " + this.details.body + ", " + this.details.legs + ", " + this.details.feet + ")",
    (this.mounted ? this.mount : "None"),
    (this.addonOne ? "Yes" : "No"),
    (this.addonTwo ? "Yes" : "No")
  ).join(" ");

}

Outfit.prototype.getSpriteBufferSize = function(object) {

  /*
   * Function Outfit.getSpriteBufferSize
   * Returns the required size for the sprite buffer. Each outfit is cached (in appropriate colors) on a buffer.. this should have a specific minimal size to limit the amount of memory used
   */

  // Area * number of animations * number of look directions
  return Math.ceil(Math.sqrt(object.frameGroups.reduce((a, b) => a + 4 * b.width * b.height * b.animationLength, 0)));

}

Outfit.prototype.getDataObjectMount = function() {

  /*
   * Function Outfit.getDataObjectMount
   * Returns the data object mount
   */

  return gameClient.dataObjects.getOutfit(this.mount);

}

Outfit.prototype.getDataObject = function() {

  /*
   * Function Outfit.getDataObject
   * Returns the data object that belongs to the outfit
   */

  return gameClient.dataObjects.getOutfit(this.id);

}

Outfit.prototype.getColor = function(which) {

  /*
   * Function Outfit.getColor
   * Returns the data object that belongs to the outfit
   */

  return this.colors[which];

}

// Outfit color options in BGR (LE)
Outfit.prototype.colors = new Array(
  "0xFFFFFF", "0xBFD4FF", "0xBFE9FF", "0xBFFFFF", "0xBFFFE9", "0xBFFFD4", "0xBFFFBF",
  "0xD4FFBF", "0xE9FFBF", "0xFFFFBF", "0xFFE9BF", "0xFFD4BF", "0xFFBFBF", "0xFFBFD4",
  "0xFFBFE9", "0xFFBFFF", "0xE9BFFF", "0xD4BFFF", "0xBFBFFF", "0xDADADA", "0x8F9FBF",
  "0x8FAFBF", "0x8FBFBF", "0x8FBFAF", "0x8FBF9F", "0x8FBF8F", "0x9FBF8F", "0xAFBF8F",
  "0xBFBF8F", "0xBFAF8F", "0xBF9F8F", "0xBF8F8F", "0xBF8F9F", "0xBF8FAF", "0xBF8FBF",
  "0xAF8FBF", "0x9F8FBF", "0x8F8FBF", "0xB6B6B6", "0x5F7FBF", "0x8FAFBF", "0x5FBFBF",
  "0x5FBF9F", "0x5FBF7F", "0x5FBF5F", "0x7FBF5F", "0x9FBF5F", "0xBFBF5F", "0xBF9F5F",
  "0xBF7F5F", "0xBF5F5F", "0xBF5F7F", "0xBF5F9F", "0xBF5FBF", "0x9F5FBF", "0x7F5FBF",
  "0x5F5FBF", "0x919191", "0x3F6ABF", "0x3F94BF", "0x3FBFBF", "0x3FBF94", "0x3FBF6A",
  "0x3FBF3F", "0x6ABF3F", "0x94BF3F", "0xBFBF3F", "0xBF943F", "0xBF6A3F", "0xBF3F3F",
  "0xBF3F6A", "0xBF3F94", "0xBF3FBF", "0x943FBF", "0x6A3FBF", "0x3F3FBF", "0x6D6D6D",
  "0x0055FF", "0x00AAFF", "0x00FFFF", "0x00FFAA", "0x00FF54", "0x00FF00", "0x54FF00",
  "0xAAFF00", "0xFFFF00", "0xFFA900", "0xFF5500", "0xFF0000", "0xFF0055", "0xFF00A9",
  "0xFF00FE", "0xAA00FF", "0x5500FF", "0x0000FF", "0x484848", "0x003FBF", "0x007FBF",
  "0x00BFBF", "0x00BF7F", "0x00BF3F", "0x00BF00", "0x3FBF00", "0x7FBF00", "0xBFBF00",
  "0xBF7F00", "0xBF3F00", "0xBF0000", "0xBF003F", "0xBF007F", "0xBF00BF", "0x7F00BF",
  "0x3F00BF", "0x0000BF", "0x242424", "0x002A7F", "0x00557F", "0x007F7F", "0x007F55",
  "0x007F2A", "0x007F00", "0x2A7F00", "0x557F00", "0x7F7F00", "0x7F5400", "0x7F2A00",
  "0x7F0000", "0x7F002A", "0x7F0054", "0x7F007F", "0x55007F", "0x2A007F", "0x00007F"
).map(Number);
