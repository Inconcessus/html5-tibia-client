const CharacterMessage = function(message, type, name, color) {

  /*
   * Class CharacterMessage
   * Container for a message that belongs to a character
   */

  // Inherit from message
  Message.call(this, message);

  // Has a name and color
  this.name = name;
  this.type = type;
  this.color = gameClient.interface.getHexColor(color);

}

CharacterMessage.prototype = Object.create(Message.prototype);
CharacterMessage.prototype.constructor = CharacterMessage;

CharacterMessage.prototype.format = function() {

  /*
   * Function CharacterMessage.format 
   * Implements the format API to format a message in a particular way
   */

  return "%s %s: %s".format(this.__formatTime(), this.name, this.message);
 
}

CharacterMessage.prototype.createNode = function() {

  /*
   * Function Message.createNode
   * Formats the internal messages to the DOM
   */

  // Format the time the message was sent
  let span = document.createElement("span");
  span.className = "chat-message";
  span.style.color = this.color;

  // Call to format the message string
  span.innerHTML = this.format();

  if(this.type === 0) {
    span.setAttribute("name", this.name);
  }

  return span;

}
