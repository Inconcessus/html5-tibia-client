const InteractiveWindow = function(element) {

  /*
   * Class InteractiveWindow
   * Makes an element with the window class interactive
   *
   * API:
   * 
   *  -
   * 
   */

  // Inherits from event emitters
  EventEmitter.call(this);

  this.__element = element;

  // Make the interactive element draggable
  element.draggable = true;

  // Attach listeners to the header buttons
  Array.from(this.getElement(".header").getElementsByTagName("button")).forEach(function(buttonElement) {
    buttonElement.addEventListener("click", this.handleButtonClick.bind(this));
  }, this);

  // State for the window
  this.state = new State();
  this.state.add("title", this.__setTitle.bind(this));

}

// Set the prototype and constructor
InteractiveWindow.prototype = Object.create(EventEmitter.prototype);
InteractiveWindow.prototype.constructor = InteractiveWindow;

InteractiveWindow.prototype.MINIMUM_HEIGHT = 76;
InteractiveWindow.prototype.HIDDEN_HEIGHT = 20;

InteractiveWindow.prototype.__setTitle = function(title) {

  /*
   * Function InteractiveWindow.setTitle
   * Sets the title of the window
   */

  this.getElement(".header").querySelector(".title").innerHTML = title.capitalize();

}

InteractiveWindow.prototype.getBody = function() {

  /*
   * Function Window.getBody
   * Returns true when the configured window is hidden
   */

  return this.getElement(".body");

}

InteractiveWindow.prototype.isMinimized = function() {

  /*
   * Function Window.isMinimized
   * Returns true when the configured window is hidden
   */

  return this.getBody().style.display === "none";

}

InteractiveWindow.prototype.getElement = function(which) {

  /*
   * Function Window.isMinimized
   * Returns true when the configured window is hidden
   */

  return this.__element.querySelector(which);

}

InteractiveWindow.prototype.handleButtonClick = function(event) {

  /*
   * Function InteractiveWindow.handleButtonClick
   * Delegates a click on a button in the header
   */

  let action = event.target.attributes.action.value;

  // Emit the event to any other attached listeners
  this.emit(action);

  switch(action) {
    case "minimize":
      return this.minimize(event.target);
    case "close":
      return this.close();
  }

}

InteractiveWindow.prototype.minimize = function(buttonElement) {

  /*
   * Function Window.minimize
   * Minimizes a given box by hiding the body element
   */

  if(this.isMinimized()) {
    this.setElementVisible(buttonElement);
  } else {
    this.setElementHidden(buttonElement);
  }

}

InteractiveWindow.prototype.setElementVisible = function(buttonElement) {

  /*
   * Function InteractiveWindow.setElementVisible
   * Minimizes a given box by hiding the body element
   */

  // Hide the body and footer
  this.getBody().style.display = "flex";
  this.getBody().style.height = "40px";
  this.__element.style.minHeight = "82px";
  this.getElement(".footer").style.display = "block";

  // Set minimize button styling
  buttonElement.innerHTML = "&#x2212";

}

InteractiveWindow.prototype.setElementHidden = function(buttonElement) {

  /*
   * Function Window.setElementHidden
   * Minimizes the element
   */

  this.getBody().style.display = "none";
  this.getElement(".footer").style.display = "none";

  // Set to hidden height
  this.__element.style.minHeight = this.HIDDEN_HEIGHT + "px";

  // Set minimize button styling
  buttonElement.innerHTML = "+";

}


InteractiveWindow.prototype.toggle = function() {

  /*
   * Function Window.toggle
   * Toggles the window open or closed
   */

  this.__element.style.display = this.isHidden() ? "flex" : "none";

}

InteractiveWindow.prototype.close = function() {

  /*
   * Function Window.close
   * Closes the window
   */

  this.__element.style.display = "none";

}

InteractiveWindow.prototype.isHidden = function() {

  /*
   * Function Window.isHidden
   * Returns true when the element is closed
   */

  return this.__element.style.display === "none" || this.__element.style.display === "";

}

InteractiveWindow.prototype.open = function() {

  /*
   * Function Window.open
   * Opens the interactive window by setting the display
   */

  this.__element.style.display = "flex";

}

InteractiveWindow.prototype.setContent = function(content) {

  /*
   * Function Window.setContent
   * Sets the content of a window
   */

  let body = this.getBody();

  // Reset content
  body.innerHTML = "";

  if(content === null) {
    return;
  }

  // Add all the child nodes
  content.filter(Boolean).forEach(function(node) {
    body.appendChild(node);
  });

}

InteractiveWindow.prototype.remove = function(event) {

  /*
   * Function InteractiveWindow.remove
   * Removes the element from the DOM
   */

  this.__element.remove();

}

InteractiveWindow.prototype.addTo = function(stackElement) {

  /*
   * Function InteractiveWindow.addTo
   * Function call to add an interactive window to a particular stack
   */

  // Add the new container to the stack
  stackElement.appendChild(this.__element);
  
}
