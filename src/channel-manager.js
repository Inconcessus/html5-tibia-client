"use strict";

const ChannelManager = function() {

  /*
   * Class ChannelManager
   * Container that manages all the incoming chat channels and messages
   *
   * API:
   *
   * ChannelManager.handleMessageSend() - Writes whatever is in the chat input box to the server
   *
   */

  // Collection for all the available channels
  this.channels = new Array();

  // The index of the active channel that is currently being written to
  this.__activeIndex = 0;
  this.__disabled = true;
  this.__currentDragElement = null;

  // Element for the text input
  this.__inputElement = document.getElementById("chat-input");
  this.__headerElement = document.getElementById("cheader");

  // Always add these two channels
  this.addChannel(0x00, "Default");
  this.addLocalChannel("Console");

  // Add listeners to left and right buttons for the channels
  document.getElementById("left-channel").addEventListener("click", this.handleChannelIncrement.bind(this, -1));
  document.getElementById("right-channel").addEventListener("click", this.handleChannelIncrement.bind(this, 1));

  // Add listener to send button
  document.getElementById("send-chat-message").addEventListener("click", this.handleMessageSend.bind(this));

  // Attach a listener to the header for dragged channels
  document.getElementById("cheader").addEventListener("dragover", this.__handleChannelDrop.bind(this));
  
  // Focus on the main default channel
  this.setActiveChannel(0);

  document.getElementById("chat-say-loudness").addEventListener("click", this.__changeLoudness);

}

ChannelManager.prototype.LOUDNESS = new Object({
  "WHISPER": 0,
  "SAY": 1,
  "YELL": 2
});

ChannelManager.prototype.getLoudness = function() {

  /*
   * Function ChannelManager.getLoudness
   * Gets the loudness of what is being said
   */

  switch(document.getElementById("chat-say-loudness").innerHTML) {
    case ")": return this.LOUDNESS.WHISPER;
    case "))": return this.LOUDNESS.SAY;
    case ")))": return this.LOUDNESS.YELL;
  }

}

ChannelManager.prototype.__changeLoudness = function() {

  /*
   * Function ChannelManager.__changeLoudness
   * Changes the loudness of what is being said (e.g., whisper, normal, yell)
   */

  // Go in a circle
  switch(this.innerHTML) {
    case ")": return this.innerHTML = "))";
    case "))": return this.innerHTML = ")))";
    case ")))": return this.innerHTML = ")";
  }

}

ChannelManager.prototype.isDisabled = function() {

  return this.__disabled;

}

ChannelManager.prototype.toggleInputLock = function() {

  /*
   * Function ChannelManager.toggleInputLock
   * Handles toggling of the chat input box where messages can be written
   */

  // Toggle disabled
  this.__disabled = !this.__disabled;

  // Update the DOM
  this.__inputElement.disabled = this.__disabled;

  if(this.__disabled) {
    this.__inputElement.placeholder = "Press Enter to unlock.";
    document.activeElement.blur();
  } else {
    this.__inputElement.placeholder = "Press Enter to lock.";
    this.__inputElement.focus();
  }

}

ChannelManager.prototype.__handleChannelDrop = function(event) {

  /*
   * Function WindowManager.__handleChannelDrop
   * Handles drop of a channel in the channel header
   */

  if(this.__currentDragElement === null) {
    return;
  }

  // Get the target of the element being dropped on
  let element = event.target;

  // Append
  if(element === document.getElementById("cheader")) {
    return element.appendChild(this.__currentDragElement);
  }

  if(element.parentElement.className === "channel-header") {
    return document.getElementById("cheader").insertBefore(this.__currentDragElement, element.parentElement);
  }

}

ChannelManager.prototype.dragElement = function(elmnt) {

  /*
   * Function ChannelManager.dragElement
   * Returns the window for a particular name
   */

  // Add callback to the drag element
  elmnt.element.addEventListener("dragstart", this.__handleDragStart.bind(this));
  elmnt.element.addEventListener("dragend", this.__handleDragEnd.bind(this));

}

ChannelManager.prototype.__handleDragEnd = function(event) {

  /*
   * Function WindowManager.handleDragEnd
   * Returns the window for a particular name
   */

  // Reset the opacity and current element
  this.__currentDragElement = null;

  event.target.style.opacity = 1;

}


ChannelManager.prototype.__handleDragStart = function(event) {

  /*
   * Function Window.__handleDragStart
   * Callback fired when the dragging is started
   */

  // Set the currently dragged element and opacity
  this.__currentDragElement = event.target.parentElement;

  // Drop the opacity to show being dragged
  event.target.style.opacity = 0.25;

}

ChannelManager.prototype.joinChannel = function(id, name) {

  /*
   * Function ChannelManager.joinChannel
   * Handles the joining of public channel
   */

  // Write the join request to the gameserver
  gameClient.send(new PacketWriter(PacketWriter.prototype.opcodes.JOIN_CHANNEL).writeToggleChannel(id));

}

ChannelManager.prototype.handleOpenChannel = function(channel) {

  /*
   * Function ChannelManager.handleOpenChannel
   * Handles the opening of a channel
   */

  this.addChannel(channel.id, channel.name);

}

ChannelManager.prototype.closeCurrentChannel = function() {

  /*
   * Function ChannelManager.closeCurrentChannel
   * Closes the currently opened channel
   */

  this.closeChannel(this.getActiveChannel());

}

ChannelManager.prototype.closeChannel = function(channel) {

  /*
   * Function ChannelManager.closeChannel
   * Deletes a channel by channel reference
   */

  // Get the index of the channel
  let index = this.channels.indexOf(channel);

  // The channel does not exist
  if(index === -1) {
    return;
  }

  // Prevent closure of Default channel
  if(this.channels[index].id === 0) {
    return gameClient.interface.setCancelMessage("The Default channel cannot be closed.");
  }

  // Set previous channel as the new active channel
  this.setActiveChannel((index - 1).clamp(0, +Infinity));

  // Splice the channel
  this.channels.splice(index, 1);

  // Remove from the DOM
  channel.element.parentNode.remove();

  // Do nothing for private and local channels
  if(channel.constructor === PrivateChannel || channel.constructor === LocalChannel) {
    return;
  }

  gameClient.send(new PacketWriter(PacketWriter.prototype.opcodes.LEAVE_CHANNEL).writeToggleChannel(channel.id));

}

ChannelManager.prototype.handleChannelIncrement = function(increment) {

  /*
   * Function ChannelManager.handleChannelIncrement
   * Increments or decrements the active channel
   */

  // Make sure to wrap around in both directions
  this.setActiveChannel((this.channels.length + this.__activeIndex + increment) % this.channels.length);

}

ChannelManager.prototype.getActiveChannel = function() {

  /*
   * Function ChannelManager.getActiveChannel
   * Returns a reference to the currently active channel
   */

  return this.channels[this.__activeIndex];

}

ChannelManager.prototype.isActive = function(channel) {

  /*
   * Function ChannelManager.isActive
   * Returns true when the passed channel reference is active
   */

  return this.getActiveChannel() === channel;

}

ChannelManager.prototype.suggestPrevious = function() {

  /*
   * Function ChannelManager.suggestPrevious
   * Suggests the previously sent message
   */

  // Empty
  if(this.getActiveChannel().isEmpty()) {
    return;
  }

  this.__inputElement.value = this.getActiveChannel().lastMessageSelf();

}

ChannelManager.prototype.isInputActive = function() {

  /*
   * Function ChannelManager.isInputActive
   * Returns true if the input element is actively focused
   */

  return this.__inputElement === document.activeElement;

}

ChannelManager.prototype.addConsoleMessage = function(message, color) {

  /*
   * Function ChannelManager.addConsoleMessage
   * Wrapper function to add a console message
   */

  let console = this.getChannel("Console");

  // Exists
  if(console !== null) {
    console.addConsoleMessage(message, color);
  }

}

ChannelManager.prototype.getChannelById = function(id) {

  /*
   * Function ChannelManager.getChannel
   * Returns the private channel with another player
   */

  // Linear search over all opened channels
  for(let i = 0; i < this.channels.length; i++) {
    if(this.channels[i].id === id) {
      return this.channels[i];
    }
  }

  return null;

}

ChannelManager.prototype.getChannel = function(name) {

  /*
   * Function ChannelManager.getChannel
   * Returns the private channel with another player
   */

  // Linear search over all opened channels
  for(let i = 0; i < this.channels.length; i++) {
    if(this.channels[i].name === name) {
      return this.channels[i];
    }
  }

  return null;

}

ChannelManager.prototype.addLocalChannel = function(name) {

  /*
   * Function ChannelManager.addLocalChannel
   * Adds a new local channel to the gameclient
   */

  // Check for existing channels
  let existingChannel = this.getChannel(name);

  if(existingChannel !== null) {
    return this.setActiveChannelElement(existingChannel);
  }

  this.__addChannel(new LocalChannel(name));

}

ChannelManager.prototype.addPrivateChannel = function(name) {

  /*
   * Function ChannelManager.addChannel
   * Adds a new channel
   */

  // Check for existing channels
  let existingChannel = this.getChannel(name);

  if(existingChannel !== null) {
    return this.setActiveChannelElement(existingChannel);
  }

  // Cannot open with yourself
  if(gameClient && gameClient.player.name === name) {
    return gameClient.interface.setCancelMessage("Cannot open a chat window yourself.");
  }

  // Simply add a private channel to the client side: server handles invidual messages in the channel
  this.__addChannel(new PrivateChannel(name));

}

ChannelManager.prototype.addChannel = function(id, name) {

  /*
   * Function ChannelManager.addChannel
   * Adds a new channel
   */

  // Check for existing channels
  let existingChannel = this.getChannel(name);

  if(existingChannel !== null) {
    return this.setActiveChannelElement(existingChannel);
  }

  this.__addChannel(new Channel(name, id));

}

ChannelManager.prototype.__addChannel = function(channel) {

  /*
   * Function ChannelManager.__addChannel
   * Adds the new channel to the DOM
   */

  this.channels.push(channel);
  this.setActiveChannelElement(channel);

  // Enable dragging
  this.dragElement(channel);

}

ChannelManager.prototype.setActiveChannelElement = function(channel) {

  /*
   * Function ChannelManager.setActiveChannelElement
   * Sets an active channel by its reference
   */

  let index = this.channels.indexOf(channel);

  if(index === -1) {
    return;
  }

  this.setActiveChannel(index);

}

ChannelManager.prototype.setHeaderOffset = function(element) {

  /*
   * Function ChannelManager.setHeaderOffset
   * Sets the proper header offset after selecting a new channel
   */

  let parentOffset = element.parentNode.parentNode.offsetLeft;
  let selfOffset = element.parentNode.offsetLeft;

  // Update the scroll of the header
  this.__headerElement.scrollLeft = (selfOffset - parentOffset);

}

ChannelManager.prototype.__handlePrivateMessageSend = function(channel, message) {

  /*
   * Function ChannelManager.__handlePrivateMessageSend
   * Handles writing of private chat message to server
   */

  // Client side add message to channel
  channel.__addMessage(
    new CharacterMessage(
      message,
      0,
      gameClient.player.name,
      gameClient.interface.COLORS.MAYABLUE
    )
  );

  // Inform te server
  gameClient.send(new PacketWriter(PacketWriter.prototype.opcodes.SEND_PRIVATE_MESSAGE).writeSendPrivateMessage(channel.name, message));

}

ChannelManager.prototype.handleMessageSend = function() {

  /*
   * Function ChannelManager.handleMessageSend
   * Handles writing of chat message to server
   */

  // Read the input from the DOM and eliminate white spaces
  let message = this.__inputElement.value.trim();

  // Reset the value to nothing
  this.__inputElement.value = "";

  // String length is empty, nothing to do!
  if(message.length === 0) {
    return;
  }

  // Get the currently active channel
  let channel = this.getActiveChannel();

  // No point in writing to local channels
  if(channel.constructor === LocalChannel) {
    return gameClient.interface.setCancelMessage("Cannot write to a local channel.");
  }

  // Writing in a private channel
  if(channel.constructor === PrivateChannel) {
    return this.__handlePrivateMessageSend(channel, message);
  }

  let loudness = this.getLoudness();

  gameClient.send(new PacketWriter(PacketWriter.prototype.opcodes.CLIENT_MESSAGE).writeSendMessage(channel.id, loudness, message));

}

ChannelManager.prototype.__setActiveChannel = function(index) {

  /*
   * Function ChannelManager.__setActiveChannel
   * Sets the active channel to a particular index
   */

  // Update the active index
  this.__activeIndex = index;

}

ChannelManager.prototype.clearCurrentChannel = function() {

  /*
   * Function ChannelManager.clearCurrentChannel
   * Clears all messages from the currently selected channel
   */

  return this.getActiveChannel().clear();

}

ChannelManager.prototype.setActiveChannel = function(index) {

  /*
   * Function ChannelManager.setActiveChannel
   * Sets a new active channel based on an identifier
   */

  // Reset the currently selected channel
  this.getActiveChannel().element.className = "chat-title";

  // Update the active index
  this.__setActiveChannel(index);

  // Set the new active channel
  this.getActiveChannel().select();

  // Proper scroll
  this.setHeaderOffset(this.getActiveChannel().element);

}
