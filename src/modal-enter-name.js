const EnterNameModal = function(element) {

  /*
   * Class ChatModal
   * Wrapper for the modal that can open chat windows
   */

  // Inherit from modal
  Modal.call(this, element);

  this.__confirmCallback = Function.prototype;

}

EnterNameModal.prototype = Object.create(Modal.prototype);
EnterNameModal.constructor = EnterNameModal;

EnterNameModal.prototype.setConfirmCallback = function(callback) {

  /*
   * Function ChatModal.setConfirmCallback
   * Adds a callback to be executed after the modal menu is confirmed
   */

  this.__confirmCallback = callback;

}

EnterNameModal.prototype.handleOpen = function() {

  document.getElementById("enter-name").focus();

}

EnterNameModal.prototype.handleConfirm = function() {

  /*
   * Function ChatModal.handleConfirm
   * Callback fired when confirm action is pressed
   */

  let name = document.getElementById("enter-name").value;

  // Apply and reset callback
  this.__confirmCallback(name);
  this.__confirmCallback = Function.prototype;

  return true;

}