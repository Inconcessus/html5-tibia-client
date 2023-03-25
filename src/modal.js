const Modal = function(id) {

  /*
   * Class Modal
   * Container for a modal window that pops up in the middle of the screen
   *
   * API:
   *
   * Modal.setTitle(title) - Sets a new (capitalised) title for the modal
   *
   */

  // Reference the DOM element itself
  this.element = document.getElementById(id);

  // Add an event listener to each action button
  Array.from(this.element.querySelectorAll("button[action]")).forEach(this.__addAction.bind(this));

}

// Subclasses may overwrite these actions
Modal.prototype.handleConfirm = Function.prototype.TRUE;
Modal.prototype.handleCancel = Function.prototype.TRUE;
Modal.prototype.handleOpen = Function.prototype;
Modal.prototype.handleRender = Function.prototype;

Modal.prototype.show = function() {

  /*
   * Function Modal.show
   * Shows the modal and sets its position to the middle of the game screen
   */

  this.element.style.left = null;
  this.element.style.top = null;

  this.element.style.display = "block";

}

Modal.prototype.setTitle = function(title) {

  /*
   * Function Modal.setTitle
   * Updates the title of the modal window
   */

   this.element.querySelector(".modal-header").innerHTML = title.capitalize();

}

Modal.prototype.__addAction = function(element) {

  /*
   * Function Modal.__addAction
   * Adds an event listener to the action button
   */

  // Listen to button click events
  element.addEventListener("click", this.__buttonClick.bind(this));

}

Modal.prototype.__internalButtonClick = function(target) {

  /*
   * Function Modal.__internalButtonClick
   * Handles action when an action button is clicked
   */

  // Handle specific actions
  switch(target.getAttribute("action")) {
    case "cancel":
      return this.handleCancel();
    case "confirm":
      return this.handleConfirm();
  }

}

Modal.prototype.__buttonClick = function(event) {

  /*
   * Function Modal.buttonClick
   * Callback fired when an action button is clicked
   */

  // Delegate to internal event: if succesful and returns true close the modal
  if(this.__internalButtonClick(event.target)) {
    return gameClient.interface.modalManager.close();
  }

}
