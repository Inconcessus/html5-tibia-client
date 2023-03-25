const Message = function(message, color) {

  /*
   * Class Message
   * Container for messages that were sent to the client
   *
   * API:
   *
   * Message.format - formats the message as text
   * Message.createNode - creates the DOM node for the message to be added to the textbox
   *
   */

  // Save the message and color
  this.message = message;
  this.color = gameClient.interface.getHexColor(color);

  // Time the message was received
  this.__time = new Date();

}

Message.prototype.format = function() {

  /*
   * Function Message.format
   * Implements the format API for displaying a messsage
   */

  return "%s: %s".format(this.__formatTime(), this.message);
 
}

Message.prototype.createNode = function() {

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

  return span;

}

Message.prototype.__formatMinute = function() {

  /*
   * Function Message.__formatMinute
   * Formats the current timestamp minute
   */

  return (("00") + this.__time.getMinutes()).slice(-2);

}

Message.prototype.__formatHour = function() {

  /*
   * Function Message.__formatHour
   * Formats the current timestamp hour
   */

  return ("0" + this.__time.getHours()).slice(-2);

}

Message.prototype.__formatTime = function() {

  /*
   * Function Message.__formatTime
   * Formats the current timestamp hour
   */

  return this.__formatHour() + ":" + this.__formatMinute();

}
