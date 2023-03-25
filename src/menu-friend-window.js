const FriendWindowMenu = function(id) {

  /*
   * Class FriendWindowMenu
   * Wrapper for the menu that displays on the main game screen
   */

  // Inherits from menu
  Menu.call(this, id);

}

FriendWindowMenu.prototype = Object.create(Menu.prototype);
FriendWindowMenu.prototype.constructor = FriendWindowMenu;

FriendWindowMenu.prototype.click = function(event) {

  /*
   * Function FriendWindowMenu.click
   * Callback fired specially for the FriendWindowMenu after a button is clicked
   */

  // Take action depending on the button
  switch(event.target.getAttribute("action")) {
    case "add":
      return this.openInputModal();
    case "sort-reversed":
      return gameClient.player.friendlist.sortBy("reversed");
    case "sort-normal":
      return gameClient.player.friendlist.sortBy("normal");
    case "hide-offline":
      return this.hideOffline(event.target);
  }

}

FriendWindowMenu.prototype.hideOffline = function(target) {

  /*
   * Function FriendWindowMenu.hideOffline
   * Function to hide offline players in the friendlist
   */

  // Modify the DOM appropriately
  if(target.innerHTML === "Hide Offline") {
    target.innerHTML = "Show Offline";
  } else {
    target.innerHTML = "Hide Offline";
  }

  // Set the friendlist state
  gameClient.player.friendlist.toggleShowOffline();

}

FriendWindowMenu.prototype.openInputModal = function() {

  let modal = gameClient.interface.modalManager.open("enter-name-modal");

  if(modal === null) {
    return;
  }

  return modal.setConfirmCallback(FriendWindowMenu.prototype.addFriend);

}

FriendWindowMenu.prototype.addFriend = function(friend) {

  /*
   * Function FriendWindowMenu.closeChannel
   * Callback fired when the close button is clciked in the chat header menu
   */

  // No input was given
  if(friend === null || friend === "") {
    return;
  }

  if(gameClient.player.friendlist.has(friend)) {
    return gameClient.interface.setCancelMessage("This friend is already in your friendlist."); 
  }

  gameClient.send(new PacketWriter(PacketWriter.prototype.opcodes.ADD_FRIEND).writeGenericString(friend));

}