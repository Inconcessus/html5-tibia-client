const Container = function(properties) {

  /*
   * Class Container
   * Wrapper for a container on the DOM
   */

  // Inherits from container with count zero
  Item.call(this, properties.id, 0);

  // The number of slots in the container and its identifier
  this.__containerId = properties.cid;
  this.size = properties.items.length;

  // Create the slots for items to be added
  this.slots = new Array();

}

Container.prototype = Object.create(Item.prototype);
Container.prototype.constructor = Container;

Container.prototype.createDOM = function(title, items) {

  /*
   * Function Container.createDOM
   * Creates the DOM for the container
   */

  // Copy the prototype
  let element = this.createElement(this.__containerId);

  this.window = new InteractiveWindow(element);
  this.window.addTo(document.getElementsByClassName("column")[0]);

  // Attach a listener to the window close event to inform the server of container close
  this.window.on("close", this.close.bind(this));
  this.window.state.title = title.capitalize();

  // Adds the slots to the existing window body
  this.createBodyContent(this.size);

  // Add the items to the slots
  this.addItems(items);

}

Container.prototype.createElement = function(index) {

  /*
   * Function Container.createElement
   * Creates a copy of the container prototype
   */

  // Copy over the container prototype from the DOM
  let element = document.getElementById("container-prototype").cloneNode(true);
  element.style.display = "flex";
  element.setAttribute("containerIndex", index);
  element.style.minHeight = 90;

  return element;

}

Container.prototype.close = function() {

  /*
   * Function Container.close
   * Callback fired when the container is closed
   */

  // Dereference the container!
  gameClient.player.closeContainer(this);

}

Container.prototype.peekItem = function(index) {

  return this.getSlotItem(index);

}

Container.prototype.getSlot = function(index) {

  return this.slots[index];

}

Container.prototype.getSlotItem = function(index) {

  /*
   * Function Container.getSlot
   * Returns the slot from the container at an index
   */

  // The slot does not exist
  if(index < 0 || index >= this.slots.length) {
    return null;
  }

  return this.getSlot(index).item;

}

Container.prototype.createBodyContent = function(size) {

  /*
   * Function createBodyDOM
   * Creates the model for the body that contains slots
   */

  // Add all slots to the body of the window
  let body = this.window.getElement(".body");

  // Set a limit to the container height based on the number of slots
  body.style.maxHeight = Math.ceil(size / 4) * 34 + "px";
  body.style.minHeight = 40 + "px";
  body.style.height = "100%";

  // Create the requested number of slots in the backpack
  for(let i = 0; i < size; i++) {
    let slot = new Slot();
    slot.createDOM(i);
    if(this.__containerId === 2) slot.element.style.backgroundImage = "url(png/icon-key.png)";
    this.slots.push(slot);
  }

  // Add all the slots to the parent body
  this.slots.forEach(function(slot) {
    body.appendChild(slot.element);
  });

}

Container.prototype.addItems = function(items) {

  /*
   * Function Container.addItems
   * Function to add an array of items to the container
   */

  items.forEach(this.addItem.bind(this));

}

Container.prototype.addItem = function(item, slot) {

  /*
   * Function Container.addItem
   * Adds a single item to the container at a particular slot
   */

  // Item is the nullptr: add nothing
  if(item === null) {
    return;
  }

  item.__parent = this;

  // Delegate
  this.__setItem(slot, item);

  // Render the container
  this.__render();

}

Container.prototype.__setItem = function(slot, item) {

  /*
   * Function Container.setItem
   * Sets an item to an appropriate slot
   */

  this.slots[slot].setItem(item);

}

Container.prototype.clearSlot = function(slot) {

  /*
   * Function Container.clearSlot
   * Clears a particular slot in the container
   */

  this.__setItem(slot, null);
  this.slots[slot].element.className = "slot";
  this.getSlot(slot).render();

}

Container.prototype.removeItem = function(slot, count) {

  /*
   * Function Container.removeItem
   * Removes an item (optional count) from the given slot in the container
   */

  // If the item is stackable we should account for the removed count
  if(!this.slots[slot].item.isStackable() || count === 0) {
    return this.clearSlot(slot);
  }

  // Subtract the count
  this.slots[slot].item.count -= count;
    
  // If the remaining count is zero the item has been fully depleted
  if(this.slots[slot].item.count === 0) {
    return this.clearSlot(slot);
  }

  this.getSlot(slot).render();

}

Container.prototype.__renderAnimated = function() {

  this.slots.forEach(function(slot) {
    slot.__renderAnimated();
  });

}

Container.prototype.__render = function() {

  /*
   * Function Container.__render
   * Draws the container
   */

  this.slots.forEach(function(slot) {
    slot.render();
  });

}
