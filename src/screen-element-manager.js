const ScreenElementManager = function() {

  /*
   * Class ScreenElementManager
   * Wrapper that contains all text on the screen. Texts are rendered in the DOM and not on the canvas
   */

  // Collection of active texts on the screen
  this.activeTextElements = new Set();

  // Where all the text elements live
  this.screenWrapper = document.getElementById("text-wrapper");

}

ScreenElementManager.prototype.clear = function() {

  /*
   * Function ScreenElementManager.clear
   * Adds an element the to the screen wrapper
   */

  // Remove all character elements from the DOM
  Object.values(gameClient.world.activeCreatures).forEach(function(creature) {
    creature.characterElement.remove();
  });

}

ScreenElementManager.prototype.render = function() {

  /*
   * Function ScreenElementManager.render
   * Renders the active text to the DOM by moving the active text elements
   */

  // Render the character elements
  this.__renderCharacterElements();

  // Render other text bubbles on the screen
  this.activeTextElements.forEach(function(screenElement) {

    // Only update the position of the text when it is floating or when the player moves
    if(gameClient.player.isMoving() || screenElement.constructor.name === "FloatingElement") {
      return screenElement.setTextPosition();
    }

  });

}

ScreenElementManager.prototype.__renderCharacterElements = function() {

  /*
   * Function ScreenElementManager.__renderCharacterElements
   * Renders the floating name elements above the active creatures
   */

  // Go over all the creatures that are active
  Object.values(gameClient.world.activeCreatures).forEach(function(creature) {

    // Do not show the name element when on another floor
    if(gameClient.player.getPosition().z !== creature.getPosition().z) {
      return creature.characterElement.hide();
    }

    // Do not waste time rendering creatures that are not visible
    if(!gameClient.player.canSeeSmall(creature)) {
      return creature.characterElement.hide();
    }

    // Color of nameplate
    if(creature !== gameClient.player) {
      if(gameClient.player.getMaxFloor() > creature.getMaxFloor()) {
        creature.characterElement.setGrey();
      } else {
        creature.characterElement.setDefault();
      }
    }

    // Update the position of the name tag
    creature.characterElement.setTextPosition();

  });

}

ScreenElementManager.prototype.add = function(element) {

  /*
   * Function ScreenElementManager.add
   * Adds an element the to the screen wrapper
   */

  this.screenWrapper.appendChild(element);

}

ScreenElementManager.prototype.createFloatingTextElement = function(message, position, color) {

  if(document.hidden) {
    return null;
  }

  // Create a new text element to add to the DOM
  this.__createTextElement(new FloatingElement(message, position, color));

}

ScreenElementManager.prototype.__createTextElement = function(messageElement) {

  // Keep a reference to all active elements
  this.activeTextElements.add(messageElement);

  // Add the element to the screen wrapper
  this.add(messageElement.element);

  // Must update the position after appending to the parent
  messageElement.setTextPosition();

  // Add an event to delete the text element after some time
  let event = gameClient.eventQueue.addEvent(this.deleteTextElement.bind(this, messageElement), messageElement.getDuration());

  // Return the element to overwrite with newer messages
  return event;

}

ScreenElementManager.prototype.createTextElement = function(entity, message, color) {

  /*
   * Function ScreenElementManager.createTextElement
   * Creates a text element and puts it on the screen
   */

  if(entity.type !== 1) {
    gameClient.interface.channelManager.getChannel("Default").addMessage(message, entity.type, entity.name, color);
  }

  // Do not add the element when the document is hidden from view
  if(document.hidden) {
    return null;
  }

  // Create a new text element to add to the DOM
  return this.__createTextElement(new MessageElement(entity, message, color));

}

ScreenElementManager.prototype.deleteTextElement = function(textElement) {

  /*
   * Function ScreenElementManager.deleteTextElement
   * Deletes the text element from the DOM
   */

  // Remove the element and reference
  textElement.remove();

  // Delete reference
  this.activeTextElements.delete(textElement);

  // More text to show
  if(textElement instanceof MessageElement) {

    if(textElement.__entity.textBuffer.length === 0) {
      return;
    }

    this.createTextElement(
      textElement.__entity,
      textElement.__entity.textBuffer.shift(),
      textElement.__color
    )

  }

}
