const LocalChannel = function(name) {

  /*
   * Class LocalChannel
   * Wrapper for channels from one character to another
   */

  // Inherits from channel
  Channel.call(this, name, null);

}

LocalChannel.prototype = Object.create(Channel.prototype);
LocalChannel.prototype.constructor = LocalChannel;
