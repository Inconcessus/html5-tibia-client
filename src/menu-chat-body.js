"use strict";

const ChatBodyMenu = function(id) {

  /*
   * Class ChatBodyMenu
   * Wrapper for the menu that displays on the main game screen
   */

  // Inherits from menu
  Menu.call(this, id);

}

ChatBodyMenu.prototype = Object.create(Menu.prototype);
ChatBodyMenu.prototype.constructor = ChatBodyMenu;

ChatBodyMenu.prototype.click = function(event) {

  /*
   * Function ChatBodyMenu.click
   * Callback fired specially for the ScreenMenu after a button is clicked
   */

  // Take action depending on the button
  switch(event.target.getAttribute("action")) {
    case "clear":
      return gameClient.interface.channelManager.clearCurrentChannel();
  }

}
