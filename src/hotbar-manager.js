const HotbarManager = function() {

  /*
   * Class HotbarManager
   * Manager for the GUI hotbar below the game screen (TODO IMPROVE)
   */

  let hotbarElements = Array.from(document.querySelectorAll(".hotbar-item"));

  hotbarElements.forEach(this.__addClickEventListeners.bind(this));

  // Create a wrapper around the slots
  this.slots = hotbarElements.map(this.__createSlot);

  // Create a lookup table for the conic gradients per-degree
  this.__createConicGradients();

}

// These are the hotbar icons
HotbarManager.prototype.ICONS = new Image();
HotbarManager.prototype.ICONS.src = "./png/icons.png";

HotbarManager.prototype.addSlot = function(index, sid) {

  /*
   * Function HotbarManager.addSlot
   * Adds a spell to a particular slot on the hotbar
   */

  // Invalid index
  if(index < 0 || index >= this.slots.length) {
    return;
  }

  let spell = gameClient.interface.getSpell(sid);

  // Set the new reference
  this.slots[index].spell = new Object({
    "sid": sid,
    "icon": spell.icon
  });

  this.slots[index].canvas.canvas.parentNode.lastElementChild.style.color = "white";
  this.slots[index].canvas.canvas.parentNode.title = "%s: %s".format(spell.name, spell.description);

  this.__saveConfiguration();

}

HotbarManager.prototype.clearSlot = function(index) {

  /*
   * Function HotbarManager.clearSlot
   * Clears a hotbar slot by removing the reference to the spell and clearing the canvas
   */

  // Clear the reference and the canvas
  this.slots[index].spell = null;
  this.slots[index].canvas.clear();

  this.slots[index].canvas.canvas.parentNode.lastElementChild.style.color = "grey";

  this.__saveConfiguration();

}

HotbarManager.prototype.handleKeyPress = function(key) {

  /*
   * Function HotbarManager.handleKeyPress
   * Function called when the keyboard delegates the F* press to the hotbar manager. This is equal to a click event.
   */

  // Determine the index of the pressed key
  this.__handleClick(key - Keyboard.prototype.KEYS.F1);

}

HotbarManager.prototype.render = function() {

  /*
   * Function HotbarManager.render
   * Renders the hotbar to the DOM
   */

  // Every frame go over all the slots
  this.slots.forEach(function(slot) {

    // The slot is empty and not active
    if(slot.spell === null) {
      return;
    }

    // Always render the spell icon
    slot.canvas.context.drawImage(
      this.ICONS,
      32 * slot.spell.icon.x,
      32 * slot.spell.icon.y,
      32, 32,
      0, 0,
      32, 32
    );

    // Get the remaining fraction of the cooldown
    let fraction = gameClient.player.spellbook.getCooldownFraction(slot.spell.sid);

    // Below one means it is on cooldown
    if(fraction < 1) {
      this.__applyCooldownEffect(fraction, slot);
    }

    if(fraction === 1) {
      slot.duration.innerHTML = null;
    }

  }, this);

}

HotbarManager.prototype.__applyCooldownEffect = function(fraction, slot) {

  slot.canvas.context.fillStyle = this.__getConicGradient(fraction);
  slot.canvas.context.fillRect(0, 0, 32, 32);

  let seconds = gameClient.player.spellbook.getCooldownSeconds(slot.spell.sid);
  if(seconds > 60) {
    slot.duration.innerHTML = "%sm".format((seconds / 60).toFixed(1));
  } else {
    slot.duration.innerHTML = "%ss".format(seconds.toFixed(1));
  }

}

HotbarManager.prototype.__getConicGradient = function(fraction) {

  /*
   * Function HotbarManager.__getConicGradient
   * Returns the conic gradient that belongs to a certain fraction
   */

  return this.GRADIENTS[Math.round(360 * (fraction.clamp(0, 1) % 1))];

}

HotbarManager.prototype.__addClickEventListeners = function(DOMElement, i) {

  /*
   * Function HotbarManager.__addClickEventListeners
   * Attaches click event listeners to the hotbar slots
   */

  return DOMElement.addEventListener("click", this.__handleClick.bind(this, i));

}

HotbarManager.prototype.__handleLightUp = function(slot) {

  /*
   * Function HotbarManager.__handleLightUp
   * Handles lighting up of the hotbar to give feedback a button is pressed
   */

  slot.canvas.canvas.parentNode.className = "hotbar-item active";

  // Use a timeout to reset the class
  setTimeout(function() {
    slot.canvas.canvas.parentNode.className = "hotbar-item";
  }.bind(this), 250);

}

HotbarManager.prototype.__handleClick = function(i) {

  /*
   * Function HotbarManager.__handleClick
   * Function to create a single slot with a canvas and reference to spell (null when empty)
   */

  let slot = this.slots[i];

  this.__handleLightUp(slot);

  if(slot.spell === null) {
    return;
  }

  // The spell identifier
  return gameClient.player.spellbook.castSpell(slot.spell.sid);

}

HotbarManager.prototype.__createSlot = function(DOMElement) {

  /*
   * Function HotbarManager.__createSlot
   * Function to create a single slot with a canvas and reference to spell (null when empty)
   */

  return new Object({
    "canvas": new Canvas(DOMElement.firstChild, 32, 32),
    "duration": DOMElement.children[1],
    "spell": null
  });

}

HotbarManager.prototype.__createConicGradients = function() {

  /*
   * Function HotbarManager.__createConicGradients
   * Internally creates a lookup table for the conic gradients per degree so they do not need to be generated on the fly
   */

  // Temporary context required to create the gradients
  let temp = new Canvas(null, 32, 32);
  let gradients = new Array();

  // One per degree (360 === 0)
  for(let i = 0; i < 360; i++) {
    gradients.push(this.__createConicGradient(i / 360, temp.context));
  }

  this.GRADIENTS = gradients;

}

HotbarManager.prototype.__createConicGradient = function(fraction, context) {

  /*
   * Function HotbarManager.__createConicGradient
   * Internally creates a lookup table for the conic gradients per degree so they do not need to be generated on the fly
   */

  let gradient = context.createConicGradient(fraction * 2 * Math.PI, 16, 16);
  
  // Add five color stops
  gradient.addColorStop(0, "rgba(0, 0, 0, 0.75)");
  gradient.addColorStop(1 - fraction, "rgba(0, 0, 0, 0.75)");
  gradient.addColorStop(1 - fraction, "rgba(0, 0, 0, 0)");
  
  return gradient;

}

HotbarManager.prototype.__loadConfiguration = function() {

  /*
   * Function HotbarManager.__loadConfiguration
   * Reads the configuration to local storage
   */

  let storage = localStorage.getItem("hotbar");

  // If the item does not exist in storage forget it
  if(storage === null) {
    return;
  }

  // Load the settings
  JSON.parse(storage).forEach(function(x, i) {
    if(x !== null) {
      this.addSlot(i, x.sid);
    }
  }, this);

}

HotbarManager.prototype.__saveConfiguration = function() {

  /*
   * Function HotbarManager.__saveConfiguration
   * Writes the configuration to local storage
   */

  // Return the spell
  localStorage.setItem("hotbar", JSON.stringify(this.slots.map(x => x.spell)));

}