const ScreenElement = function(id) {

  /*
   * Class ScreenElement
   * Base class for DOM elements on the game screen
   *
   * API:
   *
   * ScreenElement.remove() - removes the screen element DOM
   * ScreenElement.hide() - hides the screen element DOM
   * ScreenElement.show() - shows the screen element DOM
   *
   */

  // Specific classes implement and create the element
  this.element = document.getElementById(id).cloneNode(true);

  // Show the element when it is spawned
  this.show();

}

ScreenElement.prototype.remove = function() {

  /*
   * Function ScreenElement.remove
   * Removes the element from the DOM
   */

  this.element.remove();

}

ScreenElement.prototype.hide = function() {

  /*
   * Function ScreenElement.hide
   * Hides the element from the game screen
   */

  this.element.style.display = "none";

}

ScreenElement.prototype.show = function() {

  /*
   * Function ScreenElement.show
   * Shows the element on the game screen
   */

  this.element.style.display = "block";

}

ScreenElement.prototype.__updateTextPosition = function(offset) {

  /*
   * Function ScreenElement.__updateTextPosition
   * Actually applies the transform
   */

  let rect = gameClient.renderer.screen.canvas.getBoundingClientRect();

  // Clamp the position of the text box to within the game screen
  let left = offset.left.clamp(0, rect.width - this.element.offsetWidth);
  let top = offset.top.clamp(0, rect.height - this.element.offsetHeight);

  // Set the style to transform
  this.element.style.transform = "translate(" + left + "px, " + top + "px)";

  // Defer showing the element to prevent glitchy behavior
  setTimeout(() => this.show());

}

ScreenElement.prototype.__getAbsoluteOffset = function(position) {

  /*
   * Function ScreenElement.__getAbsoluteOffset
   * Returns the offset of the screen element based on its properties and the screen size
   */

  // Determine the fraction based on the size of the screen
  let fraction = gameClient.interface.getSpriteScaling();

  // Calculate the text position in canvas coordinates and center them
  let left = (fraction * position.x) - (0.5 * this.element.offsetWidth);
  let top = (fraction * position.y) - (0.5 * this.element.offsetHeight);

  // Return the new offsets
  return { left, top } 

}