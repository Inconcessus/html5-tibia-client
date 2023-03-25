const MenuManager = function() {

  /*
   * Class MenuManager
   * Container for the context menu that is opened by a right click
   *
   * Public API:
   *
   * MenuManager.getMenu(name) - Returns the menu with a particular name or null
   * MenuManager.open(name, event) - Opens the registered menu by the identifier. Requires to be passed the open event to delegate
   * MenuManager.isOpened() - Returns true if the a menu is opened
   * MenuManager.close() - Closes any opened menu
   *
   */

  // Register the configured menus and classes
  this.menus = new Object({
    "screen-menu": new ScreenMenu("screen-menu"),
    "chat-header-menu": new ChatHeaderMenu("chat-header-menu"),
    "chat-entry-menu": new MessageMenu("chat-entry-menu"),
    "chat-body-menu": new ChatBodyMenu("chat-body-menu"),
    "friend-list-menu": new FriendListMenu("friend-list-menu"),
    "friend-window-menu": new FriendWindowMenu("friend-window-menu"),
    "hotbar-menu": new HotbarMenu("hotbar-menu"),
  });

  // Reference the currently active open menu
  this.__activeMenu = null;

}

MenuManager.prototype.getMenu = function(name) {

  /*
   * Function MenuManager.getMenu
   * Returns the menu if it exists otherwise return NULL
   */

  if(!this.menus.hasOwnProperty(name)) {
    return null;
  }

  return this.menus[name];

}

MenuManager.prototype.open = function(name, event) {

  /*
   * Function MenuManager.open
   * Opens a context menu by an identifier. The click event must be passed too!
   */

  let menuElement = this.getMenu(name);

  // Has a menu with this name been registered
  if(menuElement === null) {
    return console.error("Cannot open menu %s because the menu has not been registered.".format(name));
  }

  // Already opened
  if(this.isOpened()) {
    return console.error("Cannot open menu %s because another menu is already opened.".format(name));
  }

  // Set the currently active menu
  this.__activeMenu = menuElement.open(event);

}

MenuManager.prototype.isOpened = function() {

  /*
   * Function MenuManager.isOpened
   * Returns true if a context window is already opened
   */

  return this.__activeMenu !== null;

}

MenuManager.prototype.close = function(event) {

  /*
   * Function MenuManager.close
   * Returns true if a context window is already opened
   */

  // No menu is opened: do nothing
  if(!this.isOpened()) {
    return;
  }

  // Close the active menu
  this.__activeMenu.close();

  // Drop reference
  this.__activeMenu = null;

  // Remove focus from any focused element
  this.__defocus();

}

MenuManager.prototype.__defocus = function() {

  /*
   * Function MenuManager.defocus
   * Removes focus from the opened menu and returns it to the main body
   */

  if(document.activeElement) {
    document.activeElement.blur();
  }

}
