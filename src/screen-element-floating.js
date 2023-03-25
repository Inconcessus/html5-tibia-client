const FloatingElement = function(message, position, color) {

  /*
   * Class FloatingTextElement
   * Container for text elements that float and dissapear
   */

  // Inherits from ScreenElement
  ScreenElement.call(this, "floating-element-prototype");

  this.__position = position;
  this.setColor(color);
  this.setMessage(message);

  // Save the frame on which it was created
  this.__start = performance.now();

}

FloatingElement.prototype = Object.create(ScreenElement.prototype);
FloatingElement.prototype.constructor = FloatingElement

FloatingElement.prototype.getDuration = function() {

  /*
   * Function FloatingElement.getDuration
   * Returns the duration a floating text element should appear on the screen
   */

  return 15;

}

FloatingElement.prototype.getAge = function() {

  /*
   * Function FloatingElement.getAge
   * Returns the age of the floating text element
   */

  return (performance.now() - this.__start);

}

FloatingElement.prototype.setTextPosition = function() {

  /*
   * Function FloatingElement.setTextPosition
   * Container for text elements that float and dissapear
   */

  let offset = this.__getAbsoluteOffset(gameClient.renderer.getStaticScreenPosition(this.__position));
  let age = this.getAge();

  // Animate upwards
  offset.top -= Math.floor(0.05 * age);

  // Update the opacity of the element
  if(age > 500) {
    this.element.style.opacity = 1 - ((age - 500) / 250);
  }

  this.__updateTextPosition(offset);

}

FloatingElement.prototype.setMessage = function(message) {

  /*
   * Function ScreenElement.setMessage
   * Sets the message of the screen text element
   */

  this.element.querySelector("span").innerHTML = message;

}

FloatingElement.prototype.setColor = function(color) {

  /*
   * Function ScreenElement.setColor
   * Sets the color of the screen text element
   */


  this.element.querySelector("span").style.color = Interface.prototype.getHexColor(color);

}