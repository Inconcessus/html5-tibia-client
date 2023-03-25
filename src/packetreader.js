"use strict";

const PacketReader = function(buffer) {

  /*
   * Class PacketReader
   * Container for a packet (writeable or readable)
   */

  Packet.call(this);

  // Set the buffer
  this.buffer = new Uint8Array(buffer);

}

PacketReader.prototype = Object.create(Packet.prototype);
PacketReader.prototype.constructor = PacketReader;

PacketReader.prototype.opcodes = OPCODES.SERVER;

PacketReader.prototype.readCharacterStatistics = function() {

  /*
   * Function PacketReader.readCharacterStatistics
   * Reads the character statistics
   */

  return new Object({
    "capacity": this.readUInt32(),
    "attack": this.readUInt8(),
    "armor": this.readUInt8(),
    "speed": this.readUInt16()
  });

}

PacketReader.prototype.readCharacterInformation = function() {

  return new Object({
    "name": this.readString(),
    "level": this.readUInt16(),
    "gender": this.readUInt8()
  });

}

PacketReader.prototype.readToggleCondition = function() {

  /*
   * Function PacketReader.readToggleCondition
   * Reads a packet that contains a condition toggle
   */

  return new Object({
    "guid": this.readUInt32(),
    "toggle": this.readBoolean(),
    "cid": this.readUInt16()
  });

}

PacketReader.prototype.readCastSpell = function() {

  /*
   * Function PacketReader.readCastSpell
   * Reads a cast spell packet from the server
   */

  return new Object({
    "id": this.readUInt16(),
    "cooldown": this.readUInt32()
  });

}
PacketReader.prototype.readSingleTradeOffer = function() {

  /*
   * Function PacketReader.readSingleTradeOffer
   * Reads a single trade offer provided by an NPC
   */

  return new Object({
    "id": this.readUInt16(),
    "name": this.readString(),
    "price": this.readUInt32(),
    "type": this.readBoolean() ? "sell" : "buy"
  });

}

PacketReader.prototype.readTradeOffer = function() {

  /*
   * Function PacketReader.readTradeOffer
   * Reads all the trade offers provided by an NPC
   */

  // The identifier of the NPC
  let id = this.readUInt32();

  // These are the offers that must be read
  let offers = new Array();
  let length = this.readUInt8();

  for(let i = 0; i < length; i++) {
    offers.push(this.readSingleTradeOffer());
  }

  return new Object({
    "id": id,
    "offers": offers
  });

}

PacketReader.prototype.readReadable = function() {

  /*
   * Function PacketReader.readReadable
   * Reads a readable thing
   */

  return new Object({
    "writeable": this.readBoolean(),
    "content": this.readString(),
    "name": this.readString()
  });

}

PacketReader.prototype.readAddAchievement = function(packet) {

  /*
   * Function PacketReader.readAddAchievement
   * 
   */

  return new Object({
    "title": this.readString(),
    "description": this.readString()
  });

}

PacketReader.prototype.readZoneInformation = function() {

  /*
   * Funciton PacketReader.readZoneInformation
   * Reads zone information passed by the server (e.g., weather and zone name)
   */

  return new Object({ 
    "name": this.readString(),
    "title": this.readString(),
    "music": this.readString(),
    "weather": this.readUInt8() / 255,
    "ambient": new RGBA(
      this.readUInt8(),
      this.readUInt8(),
      this.readUInt8(),
      this.readUInt8()
    ),
    "rain": this.readBoolean()
  });

}

PacketReader.prototype.readDefaultMessage = function() {

  /*
   * Function PacketReader.readDefaultMessage
   * Reads a message in the default channel
   */

  return new Object({
    "id": this.readUInt32(),
    "type": this.readUInt8(),
    "message": this.readString(),
    "color": this.readUInt8()
  });

}

PacketReader.prototype.readFriend = function() {

  /*
   * Function PacketReader.readFriend
   * Reads friend name and online status from server message
   */

  // Name and current online status
  return new Object({
    "name": this.readString(),
    "online": this.readBoolean()
  });

}

PacketReader.prototype.readAnimationLength = function() {

  /*
   * Function PacketReader.readAnimationLength
   * Read the minimum and maximum length of an animation (1098 client versions)
   */

  return new Object({
    "min": this.readUInt32(),
    "max": this.readUInt32()
  });

}

PacketReader.prototype.readLight = function() {

  /*
   * Function PacketReader.readLight
   * Reads ligth properties of a data object
   */

  return new Object({
    "level": this.readUInt16(),
    "color": this.readUInt16()
  });

}

PacketReader.prototype.readRemoveItem = function() {

  /*
   * Function PacketReader.readLight
   * Reads ligth properties of a data object
   */

  return new Object({
    "position": this.readPosition(),
    "index": this.readUInt8(),
    "count": this.readUInt8()
  });

}

PacketReader.prototype.readContainerItemRemove = function() {

  /*
   * Function PacketReader.readContainerItemRemove
   * Reads a packet that removes an item from a container
   */

  return new Object({
    "containerIndex": this.readUInt32(),
    "slotIndex": this.readUInt8(),
    "count": this.readUInt8()
  });

}

PacketReader.prototype.readGainExperience = function() {

  /*
   * Function PacketReader.readGainExperience
   * Reads a gain experience event to a character with identifier
   */

  return new Object({
    "id": this.readUInt32(),
    "experience": this.readUInt16()
  });

}

PacketReader.prototype.readDamageEvent = function() {

  /*
   * Function PacketReader.readDamageEvent
   * Reads a damage event from source to target and amount
   */

  return new Object({
    "source": this.readUInt32(),
    "target": this.readUInt32(),
    "damage": this.readUInt16(),
    "color": this.readUInt8()
  });

}

PacketReader.prototype.readIncreaseHealth = function() {

  /*
   * Function PacketReader.readIncreaseHealth
   * Reads an increase health packet
   */

  return new Object({
    "id": this.readUInt32(),
    "amount": this.readUInt16()
  });

}

PacketReader.prototype.readOpenChannel = function() {

  /*
   * Function PacketReader.readOpenChannel
   * Reads an open channel packet
   */

  return new Object({
    "id": this.readUInt32(),
    "name": this.readString()
  });

}

PacketReader.prototype.readInt8 = function() {

  /*
   * Function PacketReader.readInt8
   * Reads a signed 8-bit integer from the packet
   */

  let value = this.buffer[this.index];
  this.index += 1;

  // Some bithacking
  return value << 24 >> 24;

}

PacketReader.prototype.readOpenContainer = function() {

  /*
   * Function PacketReader.readInt8
   * Reads a signed 8-bit integer from the packet
   */

  return new Object({
    "cid": this.readUInt32(),
    "id": this.readUInt16(),
    "title": this.readString(),
    "items": this.readItems()
  });

}

PacketReader.prototype.readUInt8 = function() {

  /*
   * Function PacketReader.readUInt8
   * Reads an unsigned 8-bit integer from the packet
   */

  // UInt8array so just read the value
  return this.buffer[this.index++];

}

PacketReader.prototype.readPosition = function() {

  /*
   * Function PacketReader.readPosition
   * Reads a position from the packet
   */

  return new Position(
    this.readUInt16(),
    this.readUInt16(),
    this.readUInt16()
  );

}

PacketReader.prototype.readCreatureTeleport = function() {

  /*
   * Function PacketReader.readCreatureTeleport
   * Reads a creature teleport event to a new position
   */

  return new Object({
    "id": this.readUInt32(),
    "position": this.readPosition()
  });

}

PacketReader.prototype.readEntityMove = function() {

  /*
   * Function PacketReader.readEntityMove
   * Reads an entity move event towards a position with a particular speed
   */

  return new Object({
    "id": this.readUInt32(),
    "position": this.readPosition(),
    "speed": this.readUInt16()
  });

}

PacketReader.prototype.__readChunkTiles = function() {

  /*
   * Function PacketReader.__readChunkTiles
   * Reads all tile identifiers from the passed chunk
   */

  let tiles = new Array();

  // Read the number of tiles in a chunk
  for(var i = 0; i < Chunk.prototype.getNumberTiles(); i++) {

    tiles.push({
      "id": this.readUInt16(),
      "flags": this.readUInt8(),
      "zone": this.readUInt8()
    });

  }

  return tiles;

}

PacketReader.prototype.readServerData = function() {

  /*
   * Function PacketReader.readServerData
   * Reads important server data: this is the first packet sent by the server to the client
   */

  return new Object({
   "width": this.readUInt16(),
   "height": this.readUInt16(),
   "depth": this.readUInt8(),
   "chunk": {
     "width": this.readUInt8(),
     "height": this.readUInt8(),
     "depth": this.readUInt8()
   },
   "tick": this.readUInt8(),
   "clock": this.readUInt16(),
   "version": this.readString(),
   "clientVersion": this.readUInt16()
  });

}

PacketReader.prototype.readUInt16 = function() {

  /*
   * Function PacketReader.readUInt16
   * Unpacks and reads a value as an unsigned 2 byte integer
   */

  return this.buffer[this.index++] + (this.buffer[this.index++] << 8);

}

PacketReader.prototype.readContainerItemAdd = function() {

  return new Object({
    "containerId": this.readUInt32(),
    "slot": this.readUInt8(),
    "itemId": this.readUInt16(),
    "count": this.readUInt8(),
  });

}

PacketReader.prototype.readTileItemAdd = function() {

  return new Object({
    "id": this.readUInt16(),
    "count": this.readUInt8(),
    "position": this.readPosition(),
    "slot": this.readUInt8()
  });

}

PacketReader.prototype.readCreatureTurn = function() {

  /*
   * PacketReader.readCreatureTurn
   * Reads a creature turn event by the creature identifier and the turn direction
   */

  return new Object({
    "id": this.readUInt32(),
    "direction": this.readUInt8()
  });

}

PacketReader.prototype.readDistanceEffect = function() {

  /*
   * PacketReader.readDistanceEffect
   * Reads a distance effect identified by a from and to position
   */

  return new Object({
    "from": this.readPosition(),
    "to": this.readPosition(),
    "type": this.readUInt8()
  });

}

PacketReader.prototype.readMagicEffect = function() {

  /*
   * PacketReader.readMagicEffect
   * Reads a magic effect with an identifier that happens at a position
   */

  return new Object({
    "position": this.readPosition(),
    "type": this.readUInt8()
  });

}

PacketReader.prototype.readChangeOutfit = function() {

  /*
   * PacketReader.readChangeOutfit
   * Reads a change outfit event
   */

  return new Object({
    "id": this.readUInt32(),
    "outfit": this.readOutfit()
  });

}

PacketReader.prototype.readTransformTile = function() {

  return new Object({
    "position": this.readPosition(),
    "id": this.readUInt16()
  });

}

PacketReader.prototype.readRGB = function() {

  /*
   * Function PacketReader.readRGB
   * Reads the R, G, B colors and puts A to 0xFF in a single 32-bit int
   */

  return this.buffer[this.index++] + (this.buffer[this.index++] << 8) + (this.buffer[this.index++] << 16);

}

PacketReader.prototype.readLookType = function() {

  /*
   * Function PacketReader.readLookType
   * Reads the looktype of an entity
   */

  let id = this.readUInt16();

  let details = new Object({
    "head": this.readInt8(),
    "body": this.readInt8(),
    "legs": this.readInt8(),
    "feet": this.readInt8()
  });

  let mount = this.readUInt16();

  return new Outfit(id, details, mount);

}

PacketReader.prototype.readUInt32 = function() {

  /*
   * Function PacketReader.readUInt32
   * Reads an unsigned 32-bit integer from the arraybuffer
   */

  return this.buffer[this.index++] + (this.buffer[this.index++] << 8) + (this.buffer[this.index++] << 16) + (this.buffer[this.index++] << 24);

}

PacketReader.prototype.readItem = function() {

  /*
   *
   *
   */

  let item = this.readUInt16();
  let count = this.readUInt8();

  if(item === 0) {
    return null;
  }

  return new Item(item, count);

}

PacketReader.prototype.readItems = function() {

  /*
   * Function PacketReader.readItems
   * Reads a consecutive number of items
   */

  let size = this.readUInt8();
  let items = new Array();

  for(let i = 0; i < size; i++) {
    items.push(this.readItem());
  }

  return items;

}

PacketReader.prototype.readString = function() {

  /*
   * Function PacketReader.readString
   * Reads a string from the arraybuffer
   */

  // Read the string & string lengths
  let length = this.readUInt16();

  // An empty string is returned
  if(length === 0) {
    return "";
  }

  // Decode the UTF-8 string
  let string = new TextDecoder("utf-8").decode(this.buffer.slice(this.index, this.index + length));
  this.index += length;

  // Return the string
  return string;

}

PacketReader.prototype.readBoolean = function() {

  /*
   * Function PacketReader.readBoolean
   * Reads a boolean from the packet; which is an uint8 either 0 or 1
   */

  return this.readUInt8() === 1;
	
}

PacketReader.prototype.readOutfit = function() {

  /*
   * Function PacketReader.readOutfit
   * Reads an outfit packet
   */

  return new Outfit({
    "id": this.readUInt16(),
    "details": this.readOutfitDetails(),
    "mount": this.readUInt16(),
    "mounted": this.readBoolean(),
    "addonOne": this.readBoolean(),
    "addonTwo": this.readBoolean()
  });

}

PacketReader.prototype.readOutfitDetails = function() {

  /*
   * Function PacketReader.readOutfitDetails
   * Reads the outfit color look type
   */

  // Four bytes
  return new Object({
    "head": this.readUInt8(),
    "body": this.readUInt8(),
    "legs": this.readUInt8(),
    "feet": this.readUInt8()
  });

}

PacketReader.prototype.readSprite = function() {

  /*
   * Function PacketReader.readSprite
   * Reads a single sprite from the packet
   */

  // 32x32 images with 4 bytes
  let size = 4 * 32 * 32;
  let array = new Uint8ClampedArray(this.buffer.slice(this.index, this.index + size));

  this.index += size;

  return array;

}

PacketReader.prototype.readCreatureType = function() {

  /*
   * Function PacketReader.readCreatureType
   * Reads the creature type
   */

  let type = this.readUInt8();

  switch(type) {
    case 0:
      return "Player";
    case 1:
      return "Monster";
    case 2:
      return "NPC";
  }

}

PacketReader.prototype.readConditions = function() {

  let size = this.readUInt8();
  let conditions = new Array();

  for(let i = 0; i < size; i++) {
    conditions.push(this.readUInt8());
  }

  return conditions;

}

PacketReader.prototype.readCreatureInfo = function() {

  /*
   * Function PacketReader.readCreatureInfo
   * Reads creature information from the packet
   */

  return new Object({
    "id": this.readUInt32(),
    "type": this.readCreatureType(),
    "position": this.readPosition(),
    "direction": this.readUInt8(),
    "outfit": this.readOutfit(),
    "health": this.readUInt32(),
    "maxHealth": this.readUInt32(),
    "speed": this.readUInt16(),
    "type": this.readUInt8(),
    "name": this.readString(),
    "conditions": this.readConditions()
  });

}

PacketReader.prototype.readChunkData = function() {

  /*
   * Function PacketReader.readChunkData
   * Reads the chunk data from a packet
   */

  return new Object({
    "id": this.readUInt32(),
    "position": this.readPosition(),
    "tiles": this.__readChunkTiles()
  });

}

PacketReader.prototype.readPrivateMessage = function() {

  /*
   * Function PacketReader.readPrivateMessage
   * Reads a private message from the packet (sender & message)
   */

  return new Object({
    "name": this.readString(),
    "message": this.readString()
  });

}

PacketReader.prototype.readChannelMessage = function() {

  /*
   * Function PacketReader.readChannelMessage
   * Reads a channel message
   */

  return new Object({
    "id": this.readUInt32(),
    "name": this.readString(),
    "message": this.readString(),
    "color": this.readUInt8()
  });

}

PacketReader.prototype.readItemInformation = function() {

  /*
   * Function PacketReader.readItemInformation
   * Reads item information from a packet
   */

  return new Object({
    "sid": this.readUInt16(),
    "cid":  this.readUInt16(),
    "weight": this.readUInt16(),
    "attack": this.readUInt8(),
    "armor": this.readUInt8(),
    "distanceReadable": this.readString(),
    "article": this.readString(),
    "name": this.readString(),
    "description": this.readString(),
    "count": this.readUInt8()
  });

}

PacketReader.prototype.readEquipment = function() {

  /*
   * Function PacketReader.readEquipment
   * Reads the equipment from the packet which are ten items
   */

  let items = new Array();

  for(let i = 0; i < 10; i++) {
    items.push(this.readItem());
  }

  return items;

}

PacketReader.prototype.readPlayerInfo = function() {

  /*
   * Function PacketReader.readPlayerInfo
   * Reads and serializes the player information during login
   */

  return new Object({
    "id": this.readUInt32(),
    "name": this.readString(),
    "position": this.readPosition(),
    "direction": this.readUInt8(),
    "experience": this.readUInt32(),
    "level": this.readUInt8(),
    "speed": this.readUInt16(),
    "attack": this.readUInt8(),
    "attackSlowness": this.readUInt8(),
    "equipment": this.readEquipment(),
    "capacity": this.readUInt32(),
    "mounts": this.readOutfits(),
    "outfits": this.readOutfits(),
    "outfit": this.readOutfit(),
    "health": this.readUInt8(),
    "maxHealth": this.readUInt8(),
    "conditions": this.readConditions()
  });

}

PacketReader.prototype.readSpells = function() {

  let length = this.readUInt8();
  let spells = new Array();

  for(let i = 0; i < length; i++) {
    spells.push(this.readUInt8());
  }

  return spells;

}

PacketReader.prototype.readOutfits = function() {

  /*
   * Function PacketReader.readOutfits
   * Reads all the outfits from a packet
   */

  let length = this.readUInt8();
  let outfits = new Array();

  for(let i = 0; i < length; i++) {
    outfits.push(this.__readSingleOutfit());
  }

  return outfits;

}

PacketReader.prototype.readable = function() {

  /*
   * Function PacketReader.readable
   * Returns false if the packet was exhausted
   */

  return this.index < this.buffer.length;

}

PacketReader.prototype.skip = function(n) {

  /*
   * Function PacketReader.skip
   * Skips a number of bytes from the packet
   */

  this.index += n;

}

PacketReader.prototype.__readSingleSpell = function() {

  return new Object({
    "id": this.readUInt8(),
    "name": this.readString(),
    "description": this.readString(),
    "icon": this.readPosition()
  });

}

PacketReader.prototype.__readSingleOutfit = function() {

  /*
   * Function PacketReader.readSingleOutfit
   * Reads a single outfit from the packet
   */

  return new Object({
    "id": this.readUInt16(),
    "name": this.readString()
  });

}
