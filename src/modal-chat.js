"use strict";

const ChatModal = function(element) {

  /*
   * Class ChatModal
   * Wrapper for the modal that can open chat windows
   */

  // Inherit from modal
  Modal.call(this, element);

  // Event listeners
  document.getElementById("open-private-channel-input").addEventListener("focus", this.__handleFocus.bind(this));
  document.getElementById("channel-select").ondblclick = this.__handleDoubleClick.bind(this);

}

ChatModal.prototype = Object.create(Modal.prototype);
ChatModal.constructor = ChatModal;

ChatModal.prototype.handleConfirm = function() {

  /*
   * Function ChatModal.handleConfirm
   * Callback fired when confirm action is pressed
   */

  // Get the selected default channel
  let channel = this.__getSelectedDefaultChannel();

  // When none are selected
  if(channel.selectedIndex === -1) {
    return this.__handleOpenPrivateChannel();
  }

  // Get attributes from the selected row
  let row = channel.options[channel.selectedIndex];
  let type = row.getAttribute("channelType");
  let id = row.getAttribute("channelId")

  // Either open a local or global channel (global channels require informing the server)
  if(type === "local") {
    gameClient.interface.channelManager.addLocalChannel(id);
  } else {
    gameClient.interface.channelManager.joinChannel(Number(id), channel.value);
  }

  // Close the modal
  return true;

}

ChatModal.prototype.__handleDoubleClick = function() {

  /*
   * Function ChatModal.__handleDoubleClick
   * Returns the currently selected default channel
   */

  // Simulate a confirm click
  this.__buttonClick({"target": this.element.querySelector("button[action='confirm']")});

}

ChatModal.prototype.__getSelectedDefaultChannel = function() {

  /*
   * Function ChatModal.__getSelectedDefaultChannel
   * Returns the currently selected default channel
   */

  return document.getElementById("channel-select");

}

ChatModal.prototype.__handleOpenPrivateChannel = function() {

  /*
   * Function ChatModal.__handleOpenPrivateChannel
   * Handles opening of a private channel with another character
   */

  // Read the requested player name from the DOM
  let playerName = document.getElementById("open-private-channel-input").value.trim();

  // Add the private channel
  gameClient.interface.channelManager.addPrivateChannel(playerName);

  // Close the modal
  return true;

}

ChatModal.prototype.__handleFocus = function() {

  /*
   * Function ChatModal.__handleFocus
   * Handles focus event by setting the selected channel to nothing
   */

  document.getElementById("channel-select").selectedIndex = -1;

}
