"use strict";

const Mouse = function() {

  /*
   * Class Mouse
   * Wrapper for all mouse interaction, events, and functions with the game client
   *
   * API:
   *
   * Mouse.getCurrentTileHover() - returns the current tile that is being hovered over or null
   * Mouse.sendItemUse(object) - Writes an item use request to the server.
   * Mouse.sendItemMove(object, object, count) - Writes an item move request to the server.
   * Mouse.setCursor(which) - updates the cursor type of the document
   *
   */

  // Listen to mouse up and down events to interact with the graphical user interface
  document.body.addEventListener("mousedown", this.__handleMouseDown.bind(this));
  document.body.addEventListener("mouseup", this.__handleMouseUp.bind(this));
  document.body.addEventListener("mousemove", this.__handleMouseMove.bind(this));
  document.body.addEventListener("dblclick", this.__handleMouseDoubleClick.bind(this));

  // Attach own context menu event
  document.body.addEventListener("contextmenu", this.__handleContextMenu.bind(this));

  // Keep state of where mouse went down and at what position
  this.__mouseDownObject = null;
  this.__currentMouseTile = null;
  this.__multiUseObject = null;

}

Mouse.prototype.getCurrentTileHover = function() {

  /*
   * Function Mouse.getCurrentTileHover
   * Returns the current world tile that is being hovered over
   */

  return this.__currentMouseTile;

}

Mouse.prototype.sendItemMove = function(fromObject, toObject, count) {

  /*
   * Function Mouse.sendItemMove
   * Creates a packet to send an item to the server
   */

  // Stop if anything is missing
  if(fromObject === null || fromObject.which === null || toObject === null || toObject.which === null) {
    return;
  }

  // Create the packet to the server what we are moving and how many
  let packet = new PacketWriter(PacketWriter.prototype.opcodes.MOVE_ITEM_ALL).writeItemMoveAll(
    fromObject,
    toObject,
    count
  );

  gameClient.send(packet);

}

Mouse.prototype.setCursor = function(which) {

  /*
   * Function Mouse.setCursor
   * Updates the cursor style for the entire document
   */

  document.body.style.cursor = which;

}

Mouse.prototype.getWorldObject = function(event) {

  /*
   * Function Mouse.getWorldObject
   * Returns an object from the world
   */

  // Objects taken from the world are always at the top position (0xFF)
  return new Object({
    "which": gameClient.renderer.screen.getWorldCoordinates(event),
    "index": 0xFF
  });

}

Mouse.prototype.look = function(object) {

  /*
   * Function Mouse.look
   * Wrapper function to call a look event
   */

  // Take a look at the item on the tile (or container)
  let item = object.which.peekItem(object.index);

  if(object.which.constructor.name === "Container" && item === null) {
    return;
  }

  gameClient.send(new PacketWriter(PacketWriter.prototype.opcodes.ITEM_LOOK_ALL).writeItemLook(object));

}

Mouse.prototype.use = function(object) {

  /*
   * Function Mouse.use
   * Wrapper function to call a use event
   */

  // Fetch the item from the object
  let item = object.which.peekItem(object.index);

  if(object.which instanceof Tile) {


    if(object.which.monsters.size !== 0) {

      if(gameClient.player.isInProtectionZone()) {
        return gameClient.interface.setCancelMessage("You may not attack from within protection zone.");
      }

      return gameClient.world.targetMonster(object.which.monsters);
    }
  }

  // No item is being used  
  if(item !== null) {
    if(item.isMultiUse()) {
      return this.__setMultiUseItem(object);
    }
  }
  
  // Not multi-use: just attempt to use the item
  gameClient.send(new PacketWriter(PacketWriter.prototype.opcodes.ITEM_USE_ALL).writeItemLook(object));

}

Mouse.prototype.__getSlotObject = function(event) {

  /*
   * Function Mouse.__getSlotObject
   * Returns the slot and parent container index for a slot
   */

  let slotIndex, containerIndex;

  // Read the identifiers from the DOM
  if(event.target.className === "body") {
    slotIndex = 0;
    containerIndex = Number(event.target.parentElement.getAttribute("containerIndex"));
  } else {
    slotIndex = Number(event.target.getAttribute("slotIndex"));
    containerIndex = Number(event.target.parentElement.parentElement.getAttribute("containerIndex"));
  }

  // Fetch the container from the player
  let container = gameClient.player.getContainer(containerIndex);

  // Wrap the returned item
  return new Object({
    "which": container,
    "index": slotIndex
  });

}

Mouse.prototype.__bindMoveCallback = function(fromObject, toObject) {

  /*
   * Function Mouse.__bindMoveCallback
   * Binds a callback to the move event for an item. May require a confirmation
   */

  // Check whether there is actually an item being moved
  let item = fromObject.which.peekItem(fromObject.index);

  // Still write item move maybe there is a creature
  if(item === null) {
    return this.sendItemMove(fromObject, toObject, 1);
  }

  // The item cannot be moved
  if(!item.isMoveable()) {
    return;
  }

  if(item.isStackable() && gameClient.keyboard.isShiftDown()) {
    return this.sendItemMove(fromObject, toObject, 1);
  }

  if(item.isStackable() && gameClient.keyboard.isControlDown() && item.count > 1) {

    // Open the move stackable item 
    let properties = new Object({
      "fromObject": fromObject,
      "toObject": toObject,
      "item": item
    });

    // Open model to select the number of items to move
    return gameClient.interface.modalManager.open("move-item-modal", properties);

  }

  return this.sendItemMove(fromObject, toObject, item.count);

}

Mouse.prototype.__handleCanvasMouseUp = function(event) {

  /*
   * Function Mouse.__handleCanvasMouseUp
   * Callback fired when the mouse is released from the canvas
   */

  // No active element
  if(this.__mouseDownObject === null || this.__mouseDownObject.which === null) {
    return;
  }

  // If we are using an item already
  if(this.__multiUseObject !== null) {
    return this.__handleItemUseWith(this.__multiUseObject, this.__mouseDownObject);
  }

  // Get the world coordinates from the clicked canvas position
  let toObject = this.getWorldObject(event);

  // Started on game screen or canvas: we will do some client-side checks
  if(this.__mouseDownObject.which.constructor.name === "Tile") {

    // The down & up are the same: this is a click.
    if(this.__mouseDownObject.which === toObject.which) {
      return this.__handleMouseClick();
    }

    // The position where the item is used must be besides the player
    if(!this.__mouseDownObject.which.getPosition().besides(gameClient.player.getPosition())) {
      return gameClient.interface.setCancelMessage("You have to move closer.");
    }

  }

  // Write the move callback to the server
  return this.__bindMoveCallback(this.__mouseDownObject, toObject);

}

Mouse.prototype.__handleContextMenu = function(event) {

  /*
   * Function Mouse.__handleContextMenu
   * Callback fired when right mouse button is clicked to handle opening of the context menu's
   * The opened element varies on the DOM element that is being hovered over
   */

  // Stop default propagation
  event.preventDefault();

  // Close existing menu's
  gameClient.interface.menuManager.close();

  // Delegate to the right handler
  if(event.target.id === "screen") {

    let menu = gameClient.interface.menuManager.getMenu("screen-menu");
    let tile = this.getWorldObject(event);
    menu.element.querySelector("button[action=use]").innerHTML = "Use";
    if(tile !== null && tile.which.items.length > 0) {
      if(tile.which.peekItem(0xFF).isRotateable()) {
        menu.element.querySelector("button[action=use]").innerHTML = "Rotate";
      } else if(tile.which.peekItem(0xFF).isMultiUse()) {
        menu.element.querySelector("button[action=use]").innerHTML = "Use With";
      }
    }

    return gameClient.interface.menuManager.open("screen-menu", event);

  }

  if(event.target.className === "hotbar-item") {
    return gameClient.interface.menuManager.open("hotbar-menu", event);
  }

  if(event.target.id === "chat-text-area" || event.target.className === "channel-empty") {
   return gameClient.interface.menuManager.open("chat-body-menu", event);
  }

  if(event.target.parentNode.id === "chat-text-area") {
    if(event.target.getAttribute("name") !== null) {
      return gameClient.interface.menuManager.open("chat-entry-menu", event);
    }
  }

  if(event.target.parentNode.className === "window") {
    if(event.target.parentNode.id === "friend-window") {
      return gameClient.interface.menuManager.open("friend-window-menu", event);
    }
  }

  if(event.target.className == "friend-entry") {
    return gameClient.interface.menuManager.open("friend-list-menu", event);
  }

  if(event.target.className.includes("chat-title")) {
    return gameClient.interface.menuManager.open("chat-header-menu", event);
  }

}

Mouse.prototype.__handleItemUseWith = function(fromObject, toObject) {

  /*
   * Function Mouse.__handleItemUseWith
   * Handles a click on a container
   */

  // Write request to the server
  gameClient.send(new PacketWriter(PacketWriter.prototype.opcodes.ITEM_USE_WITH).writeItemUseWith(fromObject, toObject));

  // Reset the multi-use items and cursor
  this.__multiUseObject = null;
  this.setCursor("auto");

}

Mouse.prototype.__handleMouseClick = function() {

  /*
   * Function Mouse.__handleMouseClick
   * Handles the call when the mouse is clicked at one position
   */

  // Only send a click event when held down
  if(gameClient.keyboard.isControlDown()) {
    return this.use(this.__mouseDownObject);
  }

  // When shift is held
  if(gameClient.keyboard.isShiftDown()) {
    return this.look(this.__mouseDownObject);
  }

  if(this.__multiUseObject !== null) {
    return;
  }

  // Player has autowalk requested
  if(!gameClient.player.isMoving() && this.__mouseDownObject.which.constructor.name === "Tile") {
    return gameClient.world.pathfinder.findPath(gameClient.player.__position, gameClient.renderer.screen.getWorldCoordinates(event).__position);
  }

}

Mouse.prototype.__handleMouseDown = function(event) {

  /*
   * Function Mouse.__handleMouseDown
   * Handles the mouse down event
   */

  // Block other mouse buttons except for left
  if(event.buttons !== 1) {
    return;
  }

  // Must be connected to the gameserver
  if(!gameClient.networkManager.isConnected()) {
    return;
  }

  if(gameClient.interface.menuManager.isOpened() && event.target.tagName !== "BUTTON") {
    gameClient.interface.menuManager.close();
  }

  // Set the selected event
  this.__setSelectedObject(event);

  if(!gameClient.keyboard.isShiftDown() && !gameClient.keyboard.isControlDown()) {
    this.setCursor("grabbing");
  }

}

Mouse.prototype.__handleMouseDoubleClick = function(event) {

  if(event.target.className === "chat-message") {

    let name = event.target.getAttribute("name");

    if(name !== null) {
      return gameClient.interface.channelManager.addPrivateChannel(name);
    }

  }

}

Mouse.prototype.__handleMouseMove = function(event) {

  /*
   * Function Mouse.__handleMouseMove
   * Callback fired when the mouse is moved over the screen
   */

  // Must be connected to the gameserver
  if(!gameClient.isRunning()) {
    return;
  }

  // Update with the current mouse position
  this.__currentMouseTile = gameClient.renderer.screen.getWorldCoordinates(event);

  // Update cursor as required
  this.__updateCursorMove(event.target);

}

Mouse.prototype.__updateCursorMove = function(target) {

  /*
   * Function Mouse.__updateCursorMove
   * Updates the cursor based on the currently passed target element
   */

  if(gameClient.keyboard.isShiftDown() || gameClient.keyboard.isControlDown()) {
    return window.getSelection().removeAllRanges();
  }

  // Block when using or dragging an item
  if(this.__multiUseObject !== null || this.__mouseDownObject !== null) {
    return window.getSelection().removeAllRanges();
  }

  // Hovering over a slot
  if(target.className.includes("slot")) {
    return this.setCursor("grab");
  }

  let tile = this.getCurrentTileHover();

  // In gameworld but nothing there
  if(tile === null) {
    return this.setCursor("auto");
  }

  // No items
  if(tile.items.length === 0) {
    return this.setCursor("auto");
  }

  let item = tile.peekItem(0xFF);
 

  if(item.isPickupable() || item.isMoveable()) {
    return this.setCursor("grab");
  }

  this.setCursor("auto");

}

Mouse.prototype.__handleMouseUp = function(event) {

  /*
   * Function Mouse.__handleMouseUp
   * Handles the mouse up event and delegates to the appropriate subroutine
   */

  // Must be connected to the gameserver
  if(!gameClient.networkManager.isConnected()) {
    return;
  }

  // Game world window
  if(event.target === gameClient.renderer.screen.canvas) {
    this.__handleCanvasMouseUp(event);
  } else if(event.target.className.includes("slot") || event.target.className === "body") {
    this.__handleSlotMouseUp(event);
  }

  // Reset the selected object (if any)
  this.__mouseDownObject = null;

  // Reset the cursor
  if(this.__multiUseObject === null) {
    this.setCursor("auto");
  }

}

Mouse.prototype.__handleSlotMouseUp = function(event) {

  /*
   * Function Mouse.__handleSlotMouseUp
   * Handles the mouse up event on a slot
   */

  if(this.__mouseDownObject === null || this.__mouseDownObject.which === null) {
    return;
  }

  let toObject = this.__getSlotObject(event);

  // Moving from the world: check player adjacency
  if(this.__mouseDownObject.which.constructor.name === "Tile") {

    // The position where the item is used must be besides the player
    if(!this.__mouseDownObject.which.getPosition().besides(gameClient.player.getPosition())) {
      return;
    }

  }

  // Move from container: check if it the same slot? Then it is a click not a move!
  if(this.__mouseDownObject.which instanceof Container) {

    // Source and destination are identical: do nothing
    if(this.__mouseDownObject.which === toObject.which && this.__mouseDownObject.index === toObject.index) {
      return this.__handleMouseClick();
    }

  }

  return this.__bindMoveCallback(this.__mouseDownObject, toObject);

}

Mouse.prototype.__setMultiUseItem = function(object) {

  /*
   * Function Mouse.__setMultiUseItem
   * Saves a reference to the item that is being moved or used
   */

  // Update the cursor
  this.setCursor("move");
  this.__multiUseObject = object;

}

Mouse.prototype.__setSelectedObject = function(event) {

  /*
   * Function Mouse.__setSelectedObject
   * Gets the selected objects and sets it to the variable
   */

  // The clicked element is the screen or a slot
  if(event.target === gameClient.renderer.screen.canvas) {
    return this.__mouseDownObject = this.getWorldObject(event);
  } else if(event.target.className.includes("slot")) {
    return this.__mouseDownObject = this.__getSlotObject(event);
  }

}