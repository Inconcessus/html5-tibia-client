const OutfitModal = function(id) {

  /*
   * Class OutfitModal
   * Wrapper for the change outfit modal
   */

  // Inherit from modal
  Modal.call(this, id);

  // Attach listeners to buttons
  this.__addEventListeners();

  // Default state and parameters
  this.__activeOutfitElement = null;
  this.__spriteBuffer = new SpriteBuffer(2);
  this.__spriteBufferMount = new SpriteBuffer(2);
  this.__canvas = new Canvas(document.getElementById("outfit-example"), 128, 128);
  this.__outfit = null;
  this.__mountIndex = 0;
  this.__outfitIndex = 0;
  this.__faceDirection = Position.prototype.opcodes.SOUTH;

}

OutfitModal.prototype = Object.create(Modal.prototype);
OutfitModal.constructor = OutfitModal;

OutfitModal.prototype.disableAddons = function() {

  document.getElementById("checkbox-outfit-addon-one").disabled = true;
  document.getElementById("checkbox-outfit-addon-two").disabled = true;
  document.getElementById("checkbox-outfit-mounted").disabled = true;

}

OutfitModal.prototype.handleOpen = function(options) {

  /*
   * Function OutfitModal.handleOpen
   * Implements the modal open callback
   */

  // Copy over the current player outfit
  this.__outfit = gameClient.player.outfit.copy();

  // Default selection of HEAD
  this.__internalToggleSectionSelect(document.getElementById("outfit-head"));

  // Overwrite checkboxes with what the player currently has
  document.getElementById("checkbox-outfit-addon-one").checked = this.__outfit.addonOne;
  document.getElementById("checkbox-outfit-addon-two").checked = this.__outfit.addonTwo;
  document.getElementById("checkbox-outfit-mounted").checked = this.__outfit.mounted;

  // Get the index from the array
  this.__mountIndex = this.__getIndex(gameClient.player.mounts, this.__outfit.mount);
  this.__outfitIndex = this.__getIndex(gameClient.player.outfits, this.__outfit.id);

  // Update the HTML
  if(gameClient.player.mounts.length === 0) {
    document.getElementById("mount-span").innerHTML = "Mounts Unavailable";
    document.getElementById("checkbox-outfit-mounted").disabled = true;
  } else {
    document.getElementById("mount-span").innerHTML = gameClient.player.mounts[this.__mountIndex].name;
  }

  document.getElementById("outfit-span").innerHTML = gameClient.player.outfits[this.__outfitIndex].name;

  // Clear the spritebuffer and the canvas before drawing the updated preview outfit
  this.__renderOutfit();

}

OutfitModal.prototype.handleConfirm = function() {

  /*
   * Function OutfitModal.handleConfirm
   * Implements the modal confirm callback
   */

  // Check if the outfit is different from what the player is currenly wearing
  if(!gameClient.player.outfit.equals(this.__outfit)) {
    gameClient.send(new PacketWriter(PacketWriter.prototype.opcodes.CHANGE_OUTFIT).writeChangeOutfit(this.__outfit));
  }

  return true;

}

OutfitModal.prototype.handleRender = function() {

  /*
   * Function OutfitModal.render
   * Callback function fired when the modal is opened and being rendered
   */

  // If animation is requested: update the outfit
  if(document.getElementById("checkbox-animate-outfit").checked) {
    this.__renderOutfit();
  }

}

OutfitModal.prototype.__addEventListeners = function() {

  /*
   * Function OutfitModal.__addEventListeners
   * Adds the necessary event listeners to the modal
   */

  // Add the listener to the color elements
  let colorElementWrapper = this.element.querySelector(".outfit-color-picker");
  colorElementWrapper.addEventListener("click", this.__handleChangeOutfitColor.bind(this));

  // Add listeners to each section selector (head, body, legs, feet)
  Array.from(this.element.getElementsByClassName("outfit-face-picker")).forEach(function(element) {
    element.addEventListener("click", this.__toggleSectionSelect.bind(this));
  }, this);

  // Checkboxes for addons and flag for mounted
  document.getElementById("checkbox-outfit-addon-one").addEventListener("change", this.__renderOutfit.bind(this));
  document.getElementById("checkbox-outfit-addon-two").addEventListener("change", this.__renderOutfit.bind(this));
  document.getElementById("checkbox-outfit-mounted").addEventListener("change", this.__renderOutfit.bind(this));
  document.getElementById("checkbox-animate-outfit").addEventListener("change", this.__renderOutfit.bind(this));

  // Button to rotate the outfit
  document.getElementById("rotate-outfit").addEventListener("click", this.__handleRotateOutfit.bind(this));

  // Buttons to change the outfit type (increment & decrement)
  document.getElementById("left-outfit").addEventListener("click", this.__handleSelectOutfit.bind(this, -1));
  document.getElementById("right-outfit").addEventListener("click", this.__handleSelectOutfit.bind(this, 1));

  // Buttons to change the mount type (increment & decrement)
  document.getElementById("left-mount").addEventListener("click", this.__handleSelectMount.bind(this, -1));
  document.getElementById("right-mount").addEventListener("click", this.__handleSelectMount.bind(this, 1));

}

OutfitModal.prototype.__getIndex = function(input, id) {

  /*
   * Function OutfitModal.__getIndex
   * Linear search to find the mount in the list of available mounts
   */

  for(let i = 0; i < input.length; i++) {
    if(input[i].id === id) {
      return i;
    }
  }

  // Not found
  return 0;
  
}

OutfitModal.prototype.__handleSelectMount = function(value) {

  /*
   * Function OutfitModal.__handleSelectMount
   * Selects a new mount from the list of available mounts
   */

  if(gameClient.player.mounts.length === 0) {
    return;
  }

  // Wrap around
  this.__mountIndex += value;
  this.__mountIndex = this.__mountIndex < 0 ? (gameClient.player.mounts.length - 1) : this.__mountIndex;
  this.__mountIndex = this.__mountIndex % gameClient.player.mounts.length;

  this.__outfit.mount = gameClient.player.mounts[this.__mountIndex].id;

  // Update the HTML
  document.getElementById("mount-span").innerHTML = gameClient.player.mounts[this.__mountIndex].name;

  this.__renderOutfit();

}

OutfitModal.prototype.__handleSelectOutfit = function(value) {

  /*
   * Function OutfitModal.__handleSelectOutfit
   * Selects a new outfit
   */

  // Wrap around
  this.__outfitIndex += value;
  this.__outfitIndex = this.__outfitIndex < 0 ? (gameClient.player.outfits.length - 1) : this.__outfitIndex;
  this.__outfitIndex = this.__outfitIndex % gameClient.player.outfits.length;

  this.__outfit.id = gameClient.player.outfits[this.__outfitIndex].id;

  // Update the HTML
  document.getElementById("outfit-span").innerHTML = gameClient.player.outfits[this.__outfitIndex].name;

  this.__renderOutfit();

}

OutfitModal.prototype.__handleRotateOutfit = function(event) {

  /*
   * Function OutfitModal.__handleRotateOutfit
   * Rotates the preview outfit
   */

  this.__faceDirection++;
  this.__faceDirection = this.__faceDirection % 4;

  this.__renderOutfit();

}

OutfitModal.prototype.__toggleSectionSelect = function(event) {

  /*
   * Function OutfitModal.__toggleSectionSelect
   * Delegates button click event to internal function
   */

  this.__internalToggleSectionSelect(event.target);

}

OutfitModal.prototype.__internalToggleSectionSelect = function(target) {

  /*
   * Function OutfitModal.__internalToggleSectionSelect 
   * Selects a head, body, legs, feet button
   */

  // Remove class from the currently active element
  if(this.__activeOutfitElement !== null) {
    this.__activeOutfitElement.classList.remove("on");
  }

  // Set the class
  target.classList.add("on");

  // Overwrite the currently selected element
  this.__activeOutfitElement = target;

}

OutfitModal.prototype.__setOutfitDetail = function(id, index) {

  /*
   * Function OutfitModal.__setOutfitDetail
   * Changes the appropriate internal outfit attribute
   */

  switch(id) {
    case "outfit-head":
      this.__outfit.details.head = index;
      break;
    case "outfit-body":
      this.__outfit.details.body = index;
      break;
    case "outfit-legs":
      this.__outfit.details.legs = index;
      break;
    case "outfit-feet":
      this.__outfit.details.feet = index;
      break;
  }

  this.__renderOutfit();

}

OutfitModal.prototype.__handleChangeOutfitColor = function(event) {

  /*
   * Function OutfitModal.__handleChangeOutfitColor
   * Handles internal event when a change outfit is clicked
   */

  // No actively selected element (head, body, legs, feet)
  if(this.__activeOutfitElement === null) {
    return;
  }

  let index = event.target.getAttribute("index");

  if(index === null) {
    return;
  }

  this.__setOutfitDetail(this.__activeOutfitElement.id, Number(index));

}

OutfitModal.prototype.__renderOutfit = function() {

  /*
   * Function OutfitModal.__renderOutfit
   * Renders the currently previewed outfit to the preview canvas TODO
   */

  let item, mount, mountFrame, characterFrame;
  let outfitObject = this.__outfit.getDataObject();

  if(outfitObject === null) {
    return;
  }

  // Render preview
  if(!document.getElementById("checkbox-animate-outfit").checked) {

    item = outfitObject.getFrameGroup(0);
    characterFrame = 0;

    if(gameClient.clientVersion === 1098) {
      mount = this.__outfit.getDataObjectMount().getFrameGroup(0);
      mountFrame = 0;
    } else {
      mount = 0;
      mountFrame = 0;
    }

  } else {

    item = outfitObject.getFrameGroup(1);

    if(gameClient.clientVersion === 1098) {
      mount = this.__outfit.getDataObjectMount().getFrameGroup(1);
      characterFrame = mount.getAlwaysAnimatedFrame();
      mountFrame = mount.getAlwaysAnimatedFrame();
    } else {
      characterFrame = item.getAlwaysAnimatedFrame();
      mount = 0;
      mountFrame = 0;
    }

  }

  // Checkboxes
  this.__outfit.mounted = document.getElementById("checkbox-outfit-mounted").checked;
  this.__outfit.addonOne = document.getElementById("checkbox-outfit-addon-one").checked;
  this.__outfit.addonTwo = document.getElementById("checkbox-outfit-addon-two").checked;

  // Whether the sprite has a mount
  let zPattern = (item.pattern.z > 1 && this.__outfit.mounted) ? 1 : 0;

  // Clear the spritebuffer and the canvas before drawing the updated preview outfit
  this.__canvas.clear();
  this.__spriteBuffer.clear();

  // Hook in to the internal drawing routine with some settings
  this.__canvas.__drawCharacter(
    this.__spriteBuffer,
    this.__spriteBufferMount,
    this.__outfit,
    new Position(1, 1),
    item,
    mount,
    characterFrame,
    mountFrame,
    this.__faceDirection,
    zPattern,
    64,
    0.25
  );

}
