"use strict";

const LightCanvas = function(id, width, height) {

  /*
   * Class LightCanvas
   * Container for a canvas that handles lighting
   */

  // Inherits from canvas
  Canvas.call(this, id, width, height);

  // Current state of the light canvas and start, target for interpolation
  this.__ambientColor = new RGBA(0, 0, 0, 0);
  this.__ambientColorTarget = new RGBA(0, 0, 0, 0);
  this.__ambientColorStart = new RGBA(0, 0, 0, 0);

  this.__counter = 0;
  this.__steps = 0;

}

LightCanvas.prototype = Object.create(Canvas.prototype);
LightCanvas.prototype.constructor = LightCanvas;

// Darkness is black
LightCanvas.prototype.DARKNESS = new RGBA(0, 0, 0, 255);

LightCanvas.prototype.setAmbientColor = function(r, g, b, a) {

  /*
   * Function LightCanvas.setAmbientColor
   * Sets a new ambient color for the lightscreen: we interpolate from the old color over some frames
   */

  // Store the start and target of the transition
  this.__ambientColorTarget = new RGBA(r, g, b, a);
  this.__ambientColorStart = this.__ambientColor.copy();

  // Determine the length of transition (number of ticks to go from color one to another)
  let f1 = Math.abs(this.__ambientColorStart.r - this.__ambientColorTarget.r);
  let f2 = Math.abs(this.__ambientColorStart.g - this.__ambientColorTarget.g);
  let f3 = Math.abs(this.__ambientColorStart.b - this.__ambientColorTarget.b);
  let f4 = Math.abs(this.__ambientColorStart.a - this.__ambientColorTarget.a);

  // Reset the state
  this.__steps = 2 * Math.max(f1, f2, f3, f4);
  this.__counter = this.__steps;

}

LightCanvas.prototype.getNightSine = function() {

  /*
   * Function LightCanvas.getNightSine
   * Returns the fraction of the night proportion. Nights are simulated using a sine-wave from -1 to 1 over a particular period
   */

  // Read the world time from the clock
  let unix = gameClient.world.clock.getUnix();

  // Calculate the sine but give it an 1/8th PI offset
  return Math.sin(0.25 * Math.PI + (2 * Math.PI * unix / (24 * 60 * 60 * 1000)));

}

LightCanvas.prototype.getDarknessFraction = function() {

  /*
   * Function LightCanvas.getDarknessFraction
   * Returns the night fraction
   */

  // Simulate the day & night cycle
  let fraction = (0.5 * (this.getNightSine() + 1));

  // Underground is always in full darkness
  if(gameClient.player.isUnderground()) {
    fraction = 1;
  }

  return fraction;

}

LightCanvas.prototype.getInterpolationFraction = function() {

  /*
   * Function LightCanvas.getInterpolationFraction
   * Returns the fraction we are currently interpolating
   */

  return (this.__counter - 1) / this.__steps;

}

LightCanvas.prototype.setup = function() {

  /*
   * Function LightCanvas.clear
   * Sets up the light canvas for drawing
   */

  // Clear lightscreen and create ambient color
  this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.context.globalCompositeOperation = "source-over";

  // We are busy interpolating still
  if(this.__counter > 0) {
    this.__ambientColor = this.__ambientColorTarget.interpolate(this.__ambientColorStart, this.getInterpolationFraction());
    this.__counter--;
  }

  // Interpolate with complete darkness to simulate night
  let color = this.__ambientColor.interpolate(this.DARKNESS, this.getDarknessFraction());

  this.context.fillStyle = color.toString();
  this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

  // Get ready to xor light bubbles
  this.context.globalCompositeOperation = "xor";

}

LightCanvas.prototype.getGradient = function(x, y, size, color) {

  /*
   * Function LightCanvas.getGradient
   * Converts a single byte to a color
   */

  // Make the density depend on the night fraction
  let intensity = 0.5 * this.getDarknessFraction();

  // Invalid input
  if(color < 0 || color >= 216) {
    return null;
  }

  // In Tibia color information RGB Each have 6 colors in a single byte scale from 0 to 255
  let r = 51 * (parseInt(color / 36) % 6);
  let g = 51 * (parseInt(color / 6) % 6);
  let b = 51 * (parseInt(color % 6));

  // Create a radial gradient
  let radgrad = this.context.createRadialGradient(x, y, 0, x, y, size);

  // Quadratic scaling of intensity
  let a1 = Math.floor(0xFF * intensity);
  let a2 = Math.floor(a1 * 0.5);
  let a3 = Math.floor(a2 * 0.5);
  let a4 = Math.floor(a3 * 0.5);
 
  // Add colors stops to the radial gradient
  radgrad.addColorStop(0.00, new RGBA(r, g, b, a1).toString());
  radgrad.addColorStop(0.25, new RGBA(r, g, b, a2).toString());
  radgrad.addColorStop(0.50, new RGBA(r, g, b, a3).toString());
  radgrad.addColorStop(0.75, new RGBA(r, g, b, a4).toString());
  radgrad.addColorStop(1.00, new RGBA(0, 0, 0, 0).toString());

  return radgrad;

}

LightCanvas.prototype.renderLightBubble = function(x, y, size, colorByte) {

  /*
   * Function LightCanvas.renderLightBubble
   * Renders a particular light bubble
   */

  // Scale to the gamescreen
  x = 32 * x + 32;
  y = 32 * y + 32;
  size *= 32;

  let color = this.getGradient(x, y, size, colorByte);

  if(color === null) {
    return;
  }

  // Create the circle on the canvas
  this.context.beginPath();
  this.context.fillStyle = color;
  this.context.arc(x, y, size, 0, 2 * Math.PI, false);
  this.context.fill();

}
