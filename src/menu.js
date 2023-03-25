const Menu = function(id) {

  /*
   * Class Menu
   * Blueprint for an openeable menu. To add another menu a bit of HTML needs to be added and a class
   * that implements this class needs to be created.
   *
   */

  // Set the state and reference the element
  this.element = document.getElementById(id);

  // State to keep the down event
  this.downEvent = null;

  // Attach event listeners to the action buttons
  this.__addEventListeners();

}

// Empty function callback
Menu.prototype.click = Function.prototype;

Menu.prototype.__addEventListeners = function() {

  /*
   * Function ContextMenu.__addEventListeners
   * Opens the context menu at the event position
   */

  // Get all the buttons in the menu
  let buttons = Array.from(this.element.getElementsByTagName("button"));

  // Reference click event: the "click" function needs to be implemented in the inheriting class
  buttons.forEach(function(button) {
    button.addEventListener("click", this.buttonClose.bind(this));
  }, this);

}

Menu.prototype.__getAction = function(event) {

  /*
   * Function Menu.__getAction
   * Returns the action configured in the DOM that belongs to an event
   */

  return event.target.getAttribute("action");

}

Menu.prototype.open = function(event) {

  /*
   * Function Menu.open
   * Opens the context menu at the event position
   */

  // Show the element
  this.element.style.display = "block";

  // Update the position of the element based on the clicked position
  this.updateElementPosition(event);

  // Save the event
  this.downEvent = event;

  return this;

}

Menu.prototype.updateElementPosition = function(event) {

  /*
   * Function Menu.updateElementPosition
   * Updates the CSS to place the element at the clicked position
   */

  // Display at the mouse position but limit to the document body
  this.element.style.left = Math.min(document.body.offsetWidth - this.element.offsetWidth, Math.floor(event.pageX)) + "px";
  this.element.style.top = Math.min(document.body.offsetHeight - this.element.offsetHeight, Math.floor(event.pageY)) + "px";

}

Menu.prototype.close = function() {

  /*
   * Function Menu.close
   * Closes the menu by hiding the element
   */

  this.element.style.display = "none";

  if(document.activeElement) {
    document.activeElement.blur();
  }

}

Menu.prototype.buttonClose = function(event) {

  /*
   * Function Menu.buttonClose
   * Hides the context menu
   */

  // Fire any callbacks
  if(this.click(event)) {
    this.close();
  }

}
