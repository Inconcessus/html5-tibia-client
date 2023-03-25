const MessageMenu = function(id) {

  /*
   * Class MessageMenu
   * Opens menu to open a chat channel with another character
   */

  // Inherits from menu
  Menu.call(this, id);

}

MessageMenu.prototype = Object.create(Menu.prototype);
MessageMenu.prototype.constructor = MessageMenu;

MessageMenu.prototype.click = function(event) {

  /*
   * Function ScreenMenu.click
   * Callback fired specially for the ScreenMenu after a button is clicked
   */

  // Take action depending on the button
  switch(event.target.getAttribute("action")) {
    case "whisper":
      return this.whisper(this.downEvent.target);
  }

}

MessageMenu.prototype.whisper = function(target) {

  /*
   * Function ScreenMenu.click
   * Callback fired specially for the ScreenMenu after a button is clicked
   */

  let name = target.getAttribute("name");

  if(name === null) {
    return;
  }

  gameClient.interface.channelManager.addPrivateChannel(name);
  return true;

}