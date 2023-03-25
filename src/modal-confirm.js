const ConfirmModal = function(element) {

  /*
   * Class ConfirmModal
   * Modal that pops up to ask for a confirmation and apply a callback if succesful
   */

  // Inherit from modal
  Modal.call(this, element);

  this.__confirmCallback = Function.prototype;

}

ConfirmModal.prototype = Object.create(Modal.prototype);
ConfirmModal.constructor = ConfirmModal;

ConfirmModal.prototype.handleOpen = function(callback) {

  /*
   * Function ConfirmModal.setConfirmCallback
   * Adds a callback to be executed after the modal menu is confirmed
   */

  // Sets the callback
  this.__confirmCallback = callback;

}

ConfirmModal.prototype.handleConfirm = function() {

  /*
   * Function ConfirmModal.handleConfirm
   * Callback fired when confirm action is pressed
   */

  // Apply and reset the callback
  this.__confirmCallback(name);
  this.__confirmCallback = Function.prototype;

  return true;

}
