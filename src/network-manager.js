const NetworkManager = function() {

  /*
   * Class NetworkManager
   * Handles networking over the websocket
   */

  // Internal class state
  this.state = new State();
  this.state.add("bytesRecv", null);
  this.state.add("bytesSent", null);
  this.state.add("latency", null);
  this.state.add("nPackets", null);
  this.state.add("connected", null);

  this.nPacketsSent = 0;

  // The handler for all incoming packets
  this.packetHandler = new PacketHandler();

}

NetworkManager.prototype.close = function() {

  /*
   * Class NetworkManager.close
   * Closes the socket to the gameserver
   */

  return this.socket.close();

}

NetworkManager.prototype.isConnected = function() {

  /*
   * Class NetworkManager.isConnected
   * Returns true if the network manager is connected to the gameserver
   */

  return this.state.connected;

}

NetworkManager.prototype.readPacket = function(packet) {

  /*
   * Class NetworkManager.readPacket
   * Reads a packet received from the gameserver
   */

  this.state.nPackets++;

  // What operation the server sends is the first byte
  switch(packet.readUInt8()) {
  
    case PacketReader.prototype.opcodes.WRITE_SPELLS.code: {
      return gameClient.interface.updateSpells(packet.readSpells());
    }

    case PacketReader.prototype.opcodes.PLAYER_STATISTICS.code: {
      return this.packetHandler.handlePlayerStatistics(packet.readCharacterStatistics());
    }

    // NPC trade offers are received
    case PacketReader.prototype.opcodes.TRADE_OFFER.code: {
      return this.packetHandler.handleTradeOffer(packet.readTradeOffer());
    }

    // A remove friend is requested
    case PacketReader.prototype.opcodes.ENTER_ZONE.code: {
      return this.packetHandler.handleEnterZone(packet.readZoneInformation());
    }
  
    // A remove friend is requested
    case PacketReader.prototype.opcodes.REMOVE_FRIEND.code: {
      return this.packetHandler.handleRemoveFriend(packet.readString());
    }
  
    // An outfit change is requested
    case PacketReader.prototype.opcodes.FRIEND_STATUS.code: {
      return this.packetHandler.handleAddFriend(packet.readFriend());
    }
  
    // Item transform is returned from the server
    case PacketReader.prototype.opcodes.TRANSFORM_ITEM.code: {
      return this.packetHandler.handleTransformTile(packet.readTransformTile());
    }
  
    // Item information is returned from the server
    case PacketReader.prototype.opcodes.CANCEL_MESSAGE.code: {
      return this.packetHandler.handleCancelMessage(packet.readString());
    }
  
    case PacketReader.prototype.opcodes.ITEM_INFORMATION.code: {
      return this.packetHandler.handleItemInformation(packet.readItemInformation());
    }
  
    case PacketReader.prototype.opcodes.SET_TARGET.code: {
      return this.packetHandler.handleSetTarget(packet.readUInt32());
    }

    // Packet to change an outift
    case PacketReader.prototype.opcodes.CHANGE_OUTFIT.code: {
      return this.packetHandler.handleChangeOutfit(packet.readChangeOutfit());
    }
  
    case PacketReader.prototype.opcodes.READ_TEXT.code: {
      return this.packetHandler.handleReadText(packet.readReadable());
    }
  
    case PacketReader.prototype.opcodes.SEND_SERVER_DATA.code: {
      return this.packetHandler.handleServerData(packet.readServerData());
    }
  
    case PacketReader.prototype.opcodes.JOIN_CHANNEL.code: {
      return this.packetHandler.handleOpenChannel(packet.readOpenChannel());
    }
  
    case PacketReader.prototype.opcodes.COMBAT_LOCK.code: {
      return this.packetHandler.handleCombatLock(packet.readBoolean());
    }

    case PacketReader.prototype.opcodes.INCREASE_HEALTH.code: {
      return this.packetHandler.handleIncreaseHealth(packet.readIncreaseHealth());
    }
  
    case PacketReader.prototype.opcodes.GAIN_EXPERIENCE.code: {
      return this.packetHandler.handleGainExperience(packet.readGainExperience());
    }
  
    case PacketReader.prototype.opcodes.SEND_MAGIC_EFFECT.code: {
      return this.packetHandler.handleSendMagicEffect(packet.readMagicEffect());
    }
  
    case PacketReader.prototype.opcodes.SEND_DISTANCE_MAGIC_EFFECT.code: {
      return this.packetHandler.handleSendDistanceEffect(packet.readDistanceEffect());
    }
  
    case PacketReader.prototype.opcodes.CONTAINER_ITEM_REMOVE.code: {
      return this.packetHandler.handleContainerItemRemove(packet.readContainerItemRemove());
    }
  
    case PacketReader.prototype.opcodes.CREATURE_INFO.code: {
      return this.packetHandler.handleEntityReference(packet.readCreatureInfo());
    }
  
    // Server logout is requested
    case PacketReader.prototype.opcodes.CHARACTER_INFORMATION.code: {
      return this.packetHandler.handleCharacterInformation(packet.readCharacterInformation());
    }
  
    // Server writes a container of identifier (cid) to be closed
    case PacketReader.prototype.opcodes.CONTAINER_CLOSE.code: {
      return this.packetHandler.handleContainerClose(packet.readUInt32());
    }
  
    // Server writes a container of identifier (cid) to be closed
    case PacketReader.prototype.opcodes.CREATURE_TURN.code: {
      return this.packetHandler.handleCreatureTurn(packet.readCreatureTurn());
    }
  
    case PacketReader.prototype.opcodes.ADD_ACHIEVEMENT.code: {
      return this.packetHandler.handleAddAchievement(packet.readAddAchievement());
    }

    case PacketReader.prototype.opcodes.LATENCY.code: {
     return this.packetHandler.handleLatency();
    }
  
    case PacketReader.prototype.opcodes.ENTITY_MOVE.code: {
      return this.packetHandler.handleCreatureServerMove(packet.readEntityMove());
    }
  
    case PacketReader.prototype.opcodes.DECREASE_HEALTH.code: {
      return this.packetHandler.handleDamageEvent(packet.readDamageEvent());
    }
  
    case PacketReader.prototype.opcodes.ITEM_ADD.code: {
      return this.packetHandler.handleItemAdd(packet.readTileItemAdd());
    }
  
    case PacketReader.prototype.opcodes.OPEN_CONTAINER.code: {
      return this.packetHandler.handleContainerOpen(packet.readOpenContainer());
    }
  
    case PacketReader.prototype.opcodes.CONTAINER_ITEM_ADD.code: {
      return this.packetHandler.handleContainerAddItem(packet.readContainerItemAdd());
    }
  
    // Login information
    case PacketReader.prototype.opcodes.LOGIN_SUCCESS.code: {
      return this.packetHandler.handleAcceptLogin(packet.readPlayerInfo());
    }
  
    case PacketReader.prototype.opcodes.ITEM_REMOVE.code: {
      return this.packetHandler.handleRemoveItem(packet.readRemoveItem());
    }
  
    case PacketReader.prototype.opcodes.CAST_SPELL.code: {
      return gameClient.player.spellbook.serverCastSpell(packet.readCastSpell());
    }

    case PacketReader.prototype.opcodes.WRITE_CHUNK.code: {
      return this.packetHandler.handleChunk(packet.readChunkData());
    }
  
    case PacketReader.prototype.opcodes.SERVER_ERROR.code: {
      return this.packetHandler.handleServerError(packet.readString());
    }

    // A server message is received
    case PacketReader.prototype.opcodes.SERVER_MESSAGE.code: {
      return this.packetHandler.handleServerMessage(packet.readString());
    }
  
    case PacketReader.prototype.opcodes.ENTITY_REMOVE.code: {
      return this.packetHandler.handleEntityRemove(packet.readUInt32());
    }
  
    case PacketReader.prototype.opcodes.CREATURE_TELEPORT.code: {
      return this.packetHandler.handleEntityTeleport(packet.readCreatureTeleport());
    }
  
    case PacketReader.prototype.opcodes.SEND_PRIVATE_MESSAGE.code: {
      return this.packetHandler.handleReceivePrivateMessage(packet.readPrivateMessage());
    }
  
    case PacketReader.prototype.opcodes.LEVEL_ADVANCE.code: {
      return this.packetHandler.handleAdvanceLevel();
    }
  
    case PacketReader.prototype.opcodes.PLAYER_LOGIN.code: {
      return this.packetHandler.handlePlayerConnect(packet.readString());
    }
  
    case PacketReader.prototype.opcodes.PLAYER_LOGOUT.code: {
      return this.packetHandler.handlePlayerDisconnect(packet.readString());
    }
  
    case PacketReader.prototype.opcodes.WORLD_TIME.code: {
      return this.packetHandler.handleWorldTime(packet.readUInt32());
    }

    case PacketReader.prototype.opcodes.CREATURE_MESSAGE.code: {
      return this.packetHandler.handleChannelMessage(packet.readChannelMessage());
    }
  
    case PacketReader.prototype.opcodes.TOGGLE_CONDITION.code: {
      return this.packetHandler.handleCondition(packet.readToggleCondition());
    }

    case PacketReader.prototype.opcodes.WRITE_EMOTE.code: {
      return this.packetHandler.handleEmote(packet.readDefaultMessage());
    }

    case PacketReader.prototype.opcodes.CREATURE_SAY.code: {
      return this.packetHandler.handleDefaultMessage(packet.readDefaultMessage());
    }
  
    default:
      throw("An unknown packet was received from the server.");
  
  }

}

NetworkManager.prototype.send = function(buffer) {

  /*
   * Function NetworkManager.send
   * Writes a packet to the gameserver
   */

  // Not connected to the gameserver
  if(!this.isConnected()) {
    return;
  }

  // Save some state
  this.state.bytesSent += buffer.length;
  this.nPacketsSent++;

  // Just write the buffer over the websocket
  this.socket.send(buffer);

}

NetworkManager.prototype.getLatency = function() {

  /*
   * Function NetworkManager.pingServer
   * Pings the game server with a stay-alive message
   */

  // Save the ping timing and write the packet
  this.__latency = performance.now();

  this.send(new Uint8Array([PacketWriter.prototype.opcodes.LATENCY.code]));

}

NetworkManager.prototype.getConnectionString = function(response) {

  /*
   * Function NetworkManager.getConnectionString
   * Returns the connection string from the protocol, host, and port
   */

  return "%s?token=%s".format(response.host, response.token);

}

NetworkManager.prototype.getConnectionSettings = function() {

  /*
   * Function NetworkManager.getConnectionSettings
   * Returns the configured connection settings from the DOM
   */

  return document.getElementById("host").value;

}

NetworkManager.prototype.createAccount = function(options) {

  /*
   * Function NetworkManager.connect
   * Connects to the server websocket at the remote host and port
   */

  let host = this.getConnectionSettings();

  let url = "%s//%s/?account=%s&password=%s&name=%s&sex=%s".format(location.protocol, host, options.account, options.password, options.name, options.sex);

  // Make a post request
  fetch(url, {"method": "POST"}).then(function(response) {

    switch(response.status) {
      case 201: break;
      case 400: throw("Malformed account creation request.");
      case 409: throw("An account or character with this name already exists.");
      case 500: throw("The server experienced an internal error.");
    }

    // Update the DOM with the newly created accounted
    document.getElementById("user-username").value = options.account;
    document.getElementById("user-password").value = options.password;

    gameClient.interface.modalManager.open("floater-connecting", "The account and character have been created.")

  }).catch(x => gameClient.interface.modalManager.open("floater-connecting", x));

}

NetworkManager.prototype.loadGameFilesServer = function() {

  /*
   * Function NetworkManager.loadGameFilesServer
   * Connects to the server websocket at the remote host and port
   */

  let resources = new Array("Tibia.spr", "Tibia.dat");

  resources = resources.map(function(url) {
    return fetch("./data/74/%s".format(url)).then(response => response.arrayBuffer());
  });

  // Wait for completing of resources
  Promise.all(resources).then(function([ sprites, dataObjects ]) {

    // Load the sprites and data objects
    gameClient.spriteBuffer.load("Tibia.spr", {"target": {"result": sprites}});
    gameClient.dataObjects.load("Tibia.dat", {"target": {"result": dataObjects}});

  });

}

NetworkManager.prototype.connect = function() {

  /*
   * Function NetworkManager.connect
   * Connects to the server websocket at the remote host and port
   */

  let host = this.getConnectionSettings();
  let { account, password } = gameClient.interface.getAccountDetails();

  // Contact the login server
  fetch("%s//%s/?account=%s&password=%s".format(location.protocol, host, account, password)).then(function(response) {

    switch(response.status) {
      case 200: break;
      case 401: throw("The account number or password is incorrect.");
      case 500: throw("The server experienced an internal error.");
    }

    // Proceed
    return response.json();

  }).then(function(response) {

    // Open the websocket connection: binary transfer of data
    this.socket = new WebSocket(this.getConnectionString(response));
    this.socket.binaryType = "arraybuffer";
    
    // Attach callbacks
    this.socket.onopen = this.__handleConnection.bind(this);
    this.socket.onmessage = this.__handlePacket.bind(this);
    this.socket.onclose = this.__handleClose.bind(this);
    this.socket.onerror = this.__handleError.bind(this);

  }.bind(this)).catch(x => gameClient.interface.modalManager.open("floater-connecting", x));

}

NetworkManager.prototype.__handlePacket = function(event) {

  /*
   * Function NetworkManager.__handlePacket
   * Handles an incoming binary message
   */

  // Wrap the buffer in a readable packet
  let packet = new PacketReader(event.data);

  // Save the number of received bytes
  this.state.bytesRecv += packet.buffer.length;

  // Can still read the packet
  while(packet.readable()) {
    this.readPacket(packet);
  }

}

NetworkManager.prototype.__handleError = function(event) {

  /*
   * Function GameClient.__handleError
   * Gracefully handle websocket errors..
   */

  gameClient.interface.modalManager.open("floater-connecting", "Could not connect to the Gameworld. <br> Please try again later.");

}

NetworkManager.prototype.__handleClose = function(event) {

  /*
   * Function NetworkManager.__handleClose
   * Callback function for when the websocket connection is closed
   */

  // If we are connected to the game world: handle a reset
  if(this.state.connected && gameClient.renderer) {
    gameClient.reset();
  }

  // Set connected to false
  this.state.connected = false;

}

NetworkManager.prototype.__handleConnection = function(event) {

  /*
   * Function NetworkManager.__handleConnection
   * Callback fired when connected to the gameserver
   */

  this.state.connected = true;

  console.log("You are connected to the gameserver.");

}