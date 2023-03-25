const FriendListMenu = function(id) {

  /*
   * Class FriendListMenu
   * Wrapper for the menu that displays on the main game screen
   */

  // Inherits from menu
  Menu.call(this, id);

}

FriendListMenu.prototype = Object.create(Menu.prototype);
FriendListMenu.prototype.constructor = FriendListMenu;

FriendListMenu.prototype.removeFriend = function(target) {

  /*
   * Function FriendListMenu.closeChannel
   * Callback fired when the close button is clciked in the chat header menu
   */

  // Get the name of the friend from the innerHTML
  let friend = target.getAttribute("friend");

  gameClient.send(new PacketWriter(PacketWriter.prototype.opcodes.REMOVE_FRIEND).writeGenericString(friend));

  return true;

}

FriendListMenu.prototype.click = function(event) {

  /*
   * Function ScreenMenu.click
   * Callback fired specially for the ScreenMenu after a button is clicked
   */

  // Take action depending on the button
  switch(event.target.getAttribute("action")) {
    case "remove":
      return this.removeFriend(this.downEvent.target);
    case "note":
      gameClient.interface.setCancelMessage("Not implemented.");
      return true;
  }

}