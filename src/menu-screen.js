const ScreenMenu = function(id) {

  /*
   * Class ScreenMenu
   * Wrapper for the menu that displays on the main game screen
   */

  // Inherits from menu
  Menu.call(this, id);

}

ScreenMenu.prototype = Object.create(Menu.prototype);
ScreenMenu.prototype.constructor = ScreenMenu;

ScreenMenu.prototype.click = function(event) {

  /*
   * Function ScreenMenu.click
   * Callback fired specially for the ScreenMenu after a button is clicked
   */

  // Get the selected world object
  let object = Mouse.prototype.getWorldObject(this.downEvent);

  // Take action depending on the button
  switch(this.__getAction(event)) {
    case "look":
      gameClient.mouse.look(object);
      break;
    case "use":
      gameClient.mouse.use(object);
      break;
  }

  // Return true to close the menu after clicking
  return true;

}