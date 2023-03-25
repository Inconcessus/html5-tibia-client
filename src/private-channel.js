const PrivateChannel = function(name) {

  /*
   * Class PrivateChannel
   * Wrapper for channels from one character to another
   */

  // Inherits from channel
  Channel.call(this, name, null);

}

PrivateChannel.prototype = Object.create(Channel.prototype);
PrivateChannel.prototype.constructor = PrivateChannel;

PrivateChannel.prototype.__getEmptyMessage = function() {

  /*
   * Function PrivateChannel.__getEmptyMessage
   * Returns the string to display when the channel is empty
   */

  return "<div class=\"channel-empty\">No messages in channel with " + this.name + ".</div>";

}