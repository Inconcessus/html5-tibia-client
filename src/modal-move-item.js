const MoveItemModal = function(element) {

  /*
   * Class MoveItemModal
   * Wrapper for the modal that can move an item
   *
   * API:
   *
   * MoveItemModal.handleOpen(properties) - Implements callback fired when modal is opened
   * MoveItemModal.handleConfirm - Implements callback fired when modal is closed by confirmation
   *
   * MoveItemModal.__redrawModal - Redraws the modal and DOM elements
   * MoveItemModal.__changeSelectedCount - Updates the selected count amount
   *
   */

  // Inherit from modal
  Modal.call(this, element);

  // Reference the canvas to show the preview of what is being moved
  this.__canvas = new Canvas("move-count-sprite", 32, 32);

  // Specific HTML elements
  this.__slider = document.getElementById("item-amount");
  this.__output = document.getElementById("item-count");

  // Bind the new slide function
  this.__slider.addEventListener("input", this.__changeSelectedCount.bind(this));
  
  // State properties of the modal
  this.__properties = null;
  this.__count = null;

}

MoveItemModal.prototype = Object.create(Modal.prototype);
MoveItemModal.constructor = MoveItemModal;

MoveItemModal.prototype.handleOpen = function(properties) {

  /*
   * Function MoveItemModal.handleOpen
   * Callback fired when the slider is slid and the selected count changes
   */

  // Focus on the amount selection
  document.getElementById("item-amount").focus();

  this.__properties = properties;
  

  this.__count = properties.item.count;

  // Set the current count and maximum
  this.__slider.value = this.__slider.max = this.__count;

  this.__changeSelectedCount();

}

MoveItemModal.prototype.handleConfirm = function() {

  /*
   * Function MoveItemModal.handleConfirm
   * Callback fired when confirm is pressed: write the move event to the server
   */

  // Write to server and return true to close modal
  gameClient.mouse.sendItemMove(
    this.__properties.fromObject,
    this.__properties.toObject,
    this.__count
  );

  // Closes the modal
  return true;

}

MoveItemModal.prototype.__redrawModal = function() {

  /*
   * Function MoveItemModal.__redrawModal
   * Internal function to redraw the modal (canvas, count) after a new selection is made
   */

  // Set the count
  this.__output.innerHTML = this.__count;

  // Create a temporary fake item class with the new count
  let item = new Item(this.__properties.item.id, this.__count);

  this.__canvas.clear();
  this.__canvas.drawSprite(item, new Position(0, 0), 32);

}

MoveItemModal.prototype.__changeSelectedCount = function() {

  /*
   * Function MoveItemModal
   * Callback fired when the slider is slid and the selected count changes
   */

  let amount = Number(this.__slider.value);
  let max = Number(this.__slider.max);

  // When shift is pressed do in steps of 10 gold
  if(gameClient.keyboard.isShiftDown()) {
    if(amount !== max) {
      amount = Math.round(amount / 10) * 10;
    }
  }

  this.__count = amount.clamp(1, max);

  // Redraw the DOM elements in the modal
  this.__redrawModal();

}