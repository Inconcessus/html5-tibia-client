const MessageElement = function(entity, message, color) {

  /*
   * Class MessageElement
   * Wrapper for all sorts of DOM elements on the game screen (e.g., text & character panels)
   *
   * API:
   *
   * MessageElement.getDuration() - Returns the duration in tick frames how long the element should stay on the screen
   * MessageElement.setMessage(message) - Sets the message within the message element
   * MessageElement.setColor(color) - Sets the color of the message element
   *
   */

  // Inherit from text element
  ScreenElement.call(this, "message-element-prototype");

  // Message elements occupy a space in the game world at a specific tile
  this.__entity = entity;
  this.__position = entity.__position.copy();
  this.__message = message;
  this.__color = color;

  this.setMessage(message);

  this.setColor(color);

}

MessageElement.prototype = Object.create(ScreenElement.prototype);
MessageElement.prototype.constructor = MessageElement;

MessageElement.prototype.getDuration = function() {

  /*
   * Function ScreenElement.getDuration
   * Returns the duration of the text element to remain on the screen
   */

  return 15 * Math.sqrt(this.__message.length);

}

MessageElement.prototype.setMessage = function(message) {

  /*
   * Function ScreenElement.setMessage
   * Sets the message of the screen text element
   */

  let [ nameElement, textElement ] = this.element.querySelectorAll("span");

  nameElement.innerHTML = "<u>" + this.__entity.name + "</u>";
  textElement.innerHTML = message;

}

MessageElement.prototype.setColor = function(color) {

  /*
   * Function ScreenElement.setColor
   * Sets the color of the screen text element
   */

  let [ nameElement, textElement ] = this.element.querySelectorAll("span");

  textElement.style.color = Interface.prototype.getHexColor(color);
  nameElement.style.color = Interface.prototype.getHexColor(color);

}

MessageElement.prototype.setTextPosition = function() {

  /*
   * Function ScreenElement.setTextPosition
   * Requests the offset of the text element and updates the text position
   */

  this.__updateTextPosition(this.__getAbsoluteOffset(gameClient.renderer.getStaticScreenPosition(this.__position)));

}