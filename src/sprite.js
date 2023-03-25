const Sprite = function(src, position, size) {

  /*
   * Class Sprite
   * Container for a single sprite that references a spritesheet, position, and size
   */

  // Source of the spritesheet
  this.src = src;

  // Position on the sprite sheet
  this.position = position;
  this.size = size;

}