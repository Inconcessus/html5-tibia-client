const Equipment = function(items) {

  /*
   * Class Equipment
   * Wrapper for the player equipped items
   * API
   *
   * Equipment.setItems - Overwrites all items in the equipment with an array of items (e.g., read from database)
   */

  // Inherits from container
  Container.call(this, {"id": 0, "cid": 0, "items": {"length": 10}});

  // The equipment has ten slots for items
  this.slots = Array(
    this.referenceSlotDOM(0, "head-slot"),
    this.referenceSlotDOM(1, "armor-slot"),
    this.referenceSlotDOM(2, "legs-slot"),
    this.referenceSlotDOM(3, "boots-slot"),
    this.referenceSlotDOM(4, "right-slot"),
    this.referenceSlotDOM(5, "left-slot"),
    this.referenceSlotDOM(6, "backpack-slot"),
    this.referenceSlotDOM(7, "shoulder-slot"),
    this.referenceSlotDOM(8, "ring-slot"),
    this.referenceSlotDOM(9, "quiver-slot")
  );

  this.setItems(items);

}

Equipment.prototype = Object.create(Container.prototype);
Equipment.prototype.constructor = Equipment;

// References to PNGs
Equipment.prototype.BACKGROUNDS = new Array(
  "./png/head.png",
  "./png/armor.png",
  "./png/legs.png",
  "./png/boots.png",
  "./png/right.png",
  "./png/left.png",
  "./png/backpack.png",
  "./png/item.png",
  "./png/item.png",
  "./png/item.png"
);

Equipment.prototype.removeItem = function(slot, count) {

  // If the item is stackable we should account for the removed count
  if(!this.slots[slot].item.isStackable() || count === 0) {
    this.slots[slot].element.style.backgroundImage = "url('" + this.BACKGROUNDS[slot] + "')";
    return this.clearSlot(slot);
  }

  // Subtract the count
  this.slots[slot].item.count -= count;
    
  // If the remaining count is zero the item has been fully depleted
  if(this.slots[slot].item.count === 0) {
    this.slots[slot].element.style.backgroundImage = "url('" + this.BACKGROUNDS[slot] + "')";
    return this.clearSlot(slot);
  }

  this.getSlot(slot).render();

}

Equipment.prototype.setItems = function(items) {

  /*
   * Function Equipment.setItems
   * Sets the stored items to the equipment
   */

  // Must be the same length
  if(items.length !== this.slots.length) {
    return;
  }

  items.forEach(function(item, index) {

    // Skip nulls
    if(item !== null) {
      this.addItem(item, index);
    }

  }, this);

}

Equipment.prototype.referenceSlotDOM = function(index, id) {

  /*
   * Function Equipment.referenceSlotDOM
   * Creates the slot DOM for the equipment
   */

  // Create new slots for the items
  let slot = new Slot();
  slot.setElement(document.getElementById(id));

  return slot;

}

Equipment.prototype.addItem = function(item, slot) {

  /*
   * Function Equipment.equipItem
   * Equips an item in the selected slot
   */

  this.equipSlot(slot, item);

  // Make sure to render the change
  this.render();

}

Equipment.prototype.equipSlot = function(slot, item) {

  /*
   * Function Equipment.equipSlot
   * Maps slot to the correct equipment piece
   */

  this.slots[slot].setItem(item);

  // Update the background to remove the image 
  this.slots[slot].element.style.backgroundImage = "url('png/item.png')";

}

Equipment.prototype.render = function() {

  /*
   * Function Equipment.render
   * Renders the equipment to the graphical user interface
   */

  // Go over all the equipment slots and render thm
  this.slots.forEach(slot => slot.render());

}
