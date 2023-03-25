const RGBA = function(r, g, b, a) {

  /*
   * Class RGBA
   * Container for colors
   */

  // Four components (0x00 to 0xFF)
  this.r = r;
  this.g = g;
  this.b = b;
  this.a = a;

}

RGBA.prototype.copy = function() {

  /*
   * Function RGBA.copy
   * Returns a copy (new memory) of the current RGBA instance
   */

  return new RGBA(this.r, this.g, this.b, this.a);

}

RGBA.prototype.toString = function() {

  /*
   * Function RGBA.toString
   * Returns HTML/CSS string representation of the color
   */

  // Return and scale the alpha channel between [0, 1]
  return "rgba(" + this.r + ", " + this.g + ", " + this.b + ", " + (this.a / 0xFF) + ")";

}

RGBA.prototype.interpolate = function(color, fraction) {

  /*
   * Function RGBA.interpolate
   * Inpolates self to the requested color by a fraction
   */

  return new RGBA(
    Math.round(this.r + fraction * (color.r - this.r)),
    Math.round(this.g + fraction * (color.g - this.g)),
    Math.round(this.b + fraction * (color.b - this.b)),
    Math.round(this.a + fraction * (color.a - this.a))
  );

}
