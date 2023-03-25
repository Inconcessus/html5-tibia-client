const FriendWindow = function(element) {

  /*
   * Class InteractiveWindow
   * Makes an element with the window class interactive
   *
   * API:
   * 
   * generateContent(content) - Generates the body content for the window based on the friend list array

   * __createFriendEntry(entry) - Generates a single friend list DOM entry
   *
   */

  // Inherit from interactive windows
  InteractiveWindow.call(this, element);

}

// Set the prototype and constructor
FriendWindow.prototype = Object.create(InteractiveWindow.prototype);
FriendWindow.prototype.constructor = FriendWindow;

FriendWindow.prototype.generateContent = function(content) {

  /*
   * Function FriendWindow.generateContent
   * Generates the content to be placed in the friend list window
   */

  // Set the DOM content
  this.setContent(content.map(this.__createFriendEntry));

}

FriendWindow.prototype.__createFriendEntry = function(entry) {

  /*
   * Private Function FriendWindow.__createFriendEntry
   * Creates a single DOM element for the friend entry
   */

  let div = document.createElement("div");
  let color = entry.online ? Interface.prototype.COLORS.LIGHTGREEN : Interface.prototype.COLORS.WHITE;

  div.className = "friend-entry";
  div.setAttribute("friend", entry.name);
  div.style.color = Interface.prototype.getHexColor(color);
  div.innerHTML = entry.name;

  return div;

}