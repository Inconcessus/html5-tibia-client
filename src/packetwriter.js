"use strict";

const PacketWriter = function(packet) {

  /*
   * Class PacketWriter
   * Writes bytes to a packet
   */

  // Inherits from a generic packet
  Packet.call(this);

  // When creating a packet allocate the required size and write the opcode
  this.allocate(packet);

}

PacketWriter.prototype = Object.create(Packet.prototype);
PacketWriter.prototype.constructor = PacketWriter;

PacketWriter.prototype.opcodes = OPCODES.CLIENT;

PacketWriter.prototype.allocate = function(packet) {

  /*
   * Function PacketWriter.allocate
   * Allocates the number of required bytes for a packet
   */

  // Create a packet of the right size
  this.buffer = new Uint8Array(packet.length);
  this.writeUInt8(packet.code);

}

PacketWriter.prototype.writeBuyOffer = function(id, value, count) {

  /*
   * Function PacketWriter.writeBuyOffer
   * Writes a buy offer to the server
   */

  // The NPC identifier, the index of the item, and the amount
  this.writeUInt32(id);
  this.writeUInt8(value);
  this.writeUInt8(count);

  return this.buffer;

}

PacketWriter.prototype.writeUInt8 = function(value) {

  /*
   * Function PacketWriter.writeUInt8
   * Writes an unsigned 1 byte integer to the packet
   */

  this.buffer[this.index++] = value;

}

PacketWriter.prototype.writeUInt16 = function(value) {

  /*
   * Function PacketWriter.writeUInt16
   * Writes an unsigned 2 byte integer to the packet
   */

  this.buffer[this.index++] = value;
  this.buffer[this.index++] = value >> 8;

}

PacketWriter.prototype.writeUInt32 = function(value) {

  /*
   * Function PacketWriter.writeUInt32
   * Writes an unsigned 4 byte integer to the packet
   */

  this.buffer[this.index++] = value;
  this.buffer[this.index++] = value >> 8;
  this.buffer[this.index++] = value >> 16;
  this.buffer[this.index++] = value >> 24;

}

PacketWriter.prototype.writeString = function(string) {

  /*
   * Function PacketWriter.writeString
   * Writes a string of variable length to the packet
   */

  // Encode, write length and set the buffer in the packet
  let binary = new TextEncoder("utf-8").encode(string);

  // Write the length of the string and the bytes
  this.writeUInt8(binary.length);
  this.__set(binary);

  // Increment the length
  this.index += binary.length;

}

PacketWriter.prototype.writeBoolean = function(value) {

  /*
   * Function PacketWriter.writeBoolean
   * Writes a boolean as an uint8 (1 = true, 0 = false)
   */

  this.writeUInt8(value ? 1 : 0);

}

PacketWriter.prototype.writePosition = function(position) {

  /*
   * Function PacketWriter.writePosition
   * Writes a position to a buffer
   */

  this.writeUInt16(position.x);
  this.writeUInt16(position.y);
  this.writeUInt16(position.z);

}

PacketWriter.prototype.writeGenericString = function(string) {

  /*
   * Function PacketWriter.writeGenericString
   * Writes a generic string to the packet and returns it
   */

  this.writeString(string);
  
  return this.__sliceBuffer();

}

PacketWriter.prototype.writeLookAt = function(position) {

  this.writePosition(position);

  return this.buffer;

}

PacketWriter.prototype.writeChangeOutfit = function(outfit) {

  /*
   * Function PacketWriter.writeChangeOutfit
   * Writes a packet to change the outfit of a creature
   */

  // Identifier
  this.writeUInt16(outfit.id);

  // Details
  this.writeUInt8(outfit.details.head);
  this.writeUInt8(outfit.details.body);
  this.writeUInt8(outfit.details.legs);
  this.writeUInt8(outfit.details.feet);

  // The mount
  this.writeUInt16(outfit.mount);

  // State whether addons are equipped and the creature is mounted
  this.writeBoolean(outfit.mounted);
  this.writeBoolean(outfit.addonOne);
  this.writeBoolean(outfit.addonTwo);

  return this.buffer;

}

PacketWriter.prototype.writeCancelTarget = function() {

  /*
   * Function PacketWriter.writeCancelTarget
   * Writes a packet that tells to server to drop the current target
   */

  return this.buffer;

}

PacketWriter.prototype.writeTargetCreature = function(id) {

  this.writeUInt32(id);

  return this.buffer;

}

PacketWriter.prototype.writeLogin = function(account, password) {

  /*
   * Function PacketWriter.writeLogin
   * Writes a packet with the login information and password to the server
   */

  this.writeString(account);
  this.writeString(password);

  return this.__sliceBuffer();

}

PacketWriter.prototype.writeCastSpell = function(identifier) {

  this.writeUInt16(identifier);

  return this.buffer;

}

PacketWriter.prototype.writePlayerTurn = function(direction) {

  /*
   * Function PacketWriter.writePlayerTurn
   * Packet to write player turn event towards a particular direction
   */

  this.writeUInt8(direction);

  return this.buffer;

}

PacketWriter.prototype.writeItemLook = function(object) {

  /*
   * Function PacketWriter.writeItemLook
   * Packet to write looking at an item
   */

  this.__writeGenericMove(object);

  return this.buffer;

}

PacketWriter.prototype.writeItemUseWith = function(fromObject, toObject) {

  /*
   * Function PacketWriter.writeItemUseWith
   * Packet to write using an item with another item
   */

  this.__writeGenericMove(fromObject);
  this.__writeGenericMove(toObject);

  return this.buffer;

}


PacketWriter.prototype.writeItemMoveAll = function(fromObject, toObject, count) {

  /*
   * Function PacketWriter.writeItemMoveAll
   * Generic packet to write an item move event
   */

  this.__writeGenericMove(fromObject);
  this.__writeGenericMove(toObject);
  this.writeUInt8(count);

  return this.buffer;

}

PacketWriter.prototype.writeSendPrivateMessage = function(name, string) {

  /*
   * Function PacketWriter.writeSendPrivateMessage
   * Writes a full buffer to the internal buffer
   */

  this.writeString(name);
  this.writeString(string);

  return this.__sliceBuffer();

}

PacketWriter.prototype.writeSendMessage = function(id, loudness, string) {

  /*
   * Function PacketWriter.writeSendMessage
   * Writes a turn event to the 
   */

  this.writeUInt8(id);
  this.writeUInt8(loudness);
  this.writeString(string);

  return this.__sliceBuffer();

}

PacketWriter.prototype.writeTurn = function(direction) {

  /*
   * Function PacketWriter.writeTurn
   * Writes a turn event to the 
   */

  this.writeUInt8(direction);

  return this.buffer;

}

PacketWriter.prototype.writeToggleChannel = function(id) {

  /*
   * Function PacketWriter.writeToggleChannel
   * Toggles joining or leaving a channel
   */

  this.writeUInt8(id);

  return this.buffer;

}

PacketWriter.prototype.writeContainerItemUse = function(containerIndex, slotIndex) {

  /*
   * Function PacketWriter.writeContainerClose
   * Writes packet that requests a container to be closed
   */

  this.writeUInt32(containerIndex);
  this.writeUInt8(slotIndex);

  return this.buffer;

}

PacketWriter.prototype.writeContainerClose = function(id) {

  /*
   * Function PacketWriter.writeContainerClose
   * Writes packet that requests a container to be closed
   */

  this.writeUInt32(id);

  return this.buffer;

}

PacketWriter.prototype.__writeGenericMove = function(object) {

  /*
   * Function PacketWriter.__writeGenericMove
   * Generic packet to write a specific location (position, container) and index
   */

  // Difference writing position or container: unpacked on the server side
  if(object.which.constructor.name === "Tile") {
    this.writeUInt8(1);
    this.writePosition(object.which.getPosition());
  } else {
    this.writeUInt8(0);
    this.writeUInt16(0);
    this.writeUInt32(object.which.__containerId);
  }

  this.writeUInt8(object.index);

}

PacketWriter.prototype.__set = function(buffer) {

  /*
   * Function PacketWriter.__set
   * Writes a full buffer to the internal buffer
   */

  this.buffer.set(buffer, this.index);

}

PacketWriter.prototype.__sliceBuffer = function() {

  /*
   * Function PacketWriter.__sliceBuffer
   * Slices the buffer to the appropriate length when returning
   */

  return this.buffer.slice(0, this.index);

}
