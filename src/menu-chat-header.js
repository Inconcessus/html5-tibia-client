const ChatHeaderMenu = function(id) {

  /*
   * Class ChatHeaderMenu
   * Wrapper for the menu that displays on the main game screen
   */

  // Inherits from menu
  Menu.call(this, id);

}

ChatHeaderMenu.prototype = Object.create(Menu.prototype);
ChatHeaderMenu.prototype.constructor = ChatHeaderMenu;

ChatHeaderMenu.prototype.closeChannel = function(target) {

  /*
   * Function ChatHeaderMenu.closeChannel
   * Callback fired when the close button is clciked in the chat header menu
   */

  // Get the right channel to close
  let index = target.children[0].innerHTML;

  gameClient.interface.channelManager.closeChannel(gameClient.interface.channelManager.getChannel(index));

  return true;

}

ChatHeaderMenu.prototype.click = function(event) {

  /*
   * Function ChatHeaderMenu.click
   * Callback fired specially for the ScreenMenu after a button is clicked
   */

  // Take action depending on the button
  switch(event.target.getAttribute("action")) {
    case "close":
      return this.closeChannel(this.downEvent.target);
  }

}
