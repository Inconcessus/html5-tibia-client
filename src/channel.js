const Channel = function(name, id) {

  /*
   * Class Channel
   * Container for all channels that go to the DOM
   *
   * API:
   *
   *
   */

  // All channels have a new
  this.name = name;
  this.id = id;

  // Contents contain all the messages in the channel
  this.__contents = new Array();

  // Save a reference to the element
  this.element = this.__createElement(name);

}

Channel.prototype.MAX_MESSAGE_COUNT = 100;

Channel.prototype.close = function() {

  /*
   * Function Channel.close
   * Closes the channel by delegating to the interface channel manager
   */

  gameClient.interface.channelManager.closeChannel(this);

}

Channel.prototype.addPrivateMessage = function(message, name) {

  /*
   * Function Channel.addPrivateMessage
   * Adds a private message to the channel
   */

  // Private messages are colored skyblue
  this.addMessage(message, 0, name, gameClient.interface.COLORS.SKYBLUE);

}

Channel.prototype.addMessage = function(message, type, name, color) {
  
  /*
   * Function Channel.addMessage
   * Adds a message to the channel
   */

  // Add to the contents
  this.__addMessage(new CharacterMessage(message, type, name, color));

}

Channel.prototype.blink = function() {

  /*
   * Function Channel.blink
   * Sets the message header color back to white to signifiy a new message
   */

  this.element.style.color = "orange";

}

Channel.prototype.lastMessageSelf = function() {

  /*
   * Function Channel.lastMessageSelf
   * Returns the last message said by the player
   */

  if(this.isEmpty()) {
    return null;
  }

  return this.__contents.filter(x => gameClient.player.name === x.name).last().message;

}

Channel.prototype.lastMessage = function() {

  /*
   * Function Channel.lastMessage
   * Returns the last message said by the player
   */

  if(this.isEmpty()) {
    return null;
  }

  return this.__contents.last().message;

}

Channel.prototype.isEmpty = function() {

  /*
   * Function Channel.isEmpty
   * Returns true if the channel has no messages and is empty
   */

  return this.__contents.length === 0;

}

Channel.prototype.__isScrolledDown = function(chatbox) {

  /*
   * Function Channel.__isScrolledDown
   * Returns true when the chatbox is fully scrolled down
   */

  return chatbox.scrollTop === (chatbox.scrollHeight - chatbox.offsetHeight);

}

Channel.prototype.render = function() {

  /*
   * Function Channel.render
   * Renders channel contents to the chat area box
   */

  // Get the chatbox element from the DOM
  let chatbox = document.getElementById("chat-text-area");

  // The channel is scrolled down at the bottom
  let scrollDown = this.__isScrolledDown(chatbox);

  chatbox.innerHTML = "";

  // The channel is empty
  if(this.isEmpty()) {
    return chatbox.innerHTML = this.__getEmptyMessage();
  }

  // Add all the content to the element
  this.__contents.forEach(function(message) {
    chatbox.appendChild(message.createNode());
  }, this);

  // Keep the window scrolled down when it is rendered
  if(scrollDown) {
    chatbox.scrollTop = chatbox.scrollHeight;
  }

}

Channel.prototype.click = function(event) {

  /*
   * Function Channel.click
   * Click event when the tab handler is clicked: set this as active
   */

  // Set the active index
  gameClient.interface.channelManager.setActiveChannelElement(this);

}

Channel.prototype.select = function(message) {

  /*
   * Function Channel.select
   * Selects a channel and updates settings to make it active
   */

  this.element.className = "chat-title selected";
  this.render();
  this.element.style.color = null;

}

Channel.prototype.clear = function() {

  /*
   * Function Channel.clear
   * Clear all messages in the channel
   */

  this.__contents = new Array();
  this.render();

  return true;

}

Channel.prototype.addConsoleMessage = function(message, color) {

  /*
   * Function Channel.addConsoleMessage
   * Adds a console message to the channel.
   */

  this.__addMessage(new Message(message, color));

}

Channel.prototype.__addMessage = function(message) {

  /*
   * Function Channel.__addMessage
   * Adds a message to a channel 
   */

  // Push the message to the contents and slice to the allowed count
  this.__contents.push(message);
  this.__contents = this.__contents.slice(-this.MAX_MESSAGE_COUNT);

  // If this channel is currently active: render it
  if(gameClient.interface.channelManager.isActive(this)) {
    return this.render();
  }

  // Set text color to indicate a new message has appeared in an inactive channel
  this.blink();

}

Channel.prototype.__getEmptyMessage = function() {

  /*
   * Function Channel.__getEmptyMessage
   * Returns the empty message span element
   */

  return "<span class=\"channel-empty\">No messages in channel %s.</span>".format(this.name);

}

Channel.prototype.__createElement = function(name) {

  /*
   * Function Channel.__createElement
   * Creates the DOM element for the channel
   */

  // Create tab handle DOM element
  let div = document.createElement("div");
  div.className = "channel-header";

  // Name and stuff
  let tab = document.createElement("div");
  tab.draggable = true;
  tab.className = "chat-title";
  tab.innerHTML = "<span>%s</span>".format(name);
  tab.addEventListener("click", this.click.bind(this));
  
  div.appendChild(tab);

  // Append the tab to the header
  document.getElementById("cheader").appendChild(div);

  return tab;

}
