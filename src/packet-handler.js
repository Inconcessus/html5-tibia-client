const PacketHandler = function() {

  /*
   * Class PacketHandler
   * Containers handler functions for all incoming network packets from the gameserver
   * This usually delegates to the gameClient but is a central place for collections
   */

}

PacketHandler.prototype.handleWorldTime = function(time) {

  /*
   * Function PacketHandler.handleWorldTime
   * Handles an incoming packet with the world time by setting the phase offset between client / phase
   */

  gameClient.world.clock.setPhase(time);

}

PacketHandler.prototype.handleSetTarget = function(id) {

  /*
   * Function PacketHandler.handleSetTarget
   * Handles server-side event that sets the target of the player
   */

  // An identifier of zero means null
  if(id === 0) {
    return gameClient.player.setTarget(null);
  }

  // Set the target creature if it exists
  let creature = gameClient.world.getCreature(id);

  if(creature === null) {
    return;
  }

  gameClient.player.setTarget(creature);

}

PacketHandler.prototype.handleCombatLock = function(bool) {

  /*
   * Function PacketHandler.handleCombatLock
   * Handles state of the combat lock from true to false on the DOM
   */

  let condition = new Object({
    "toggle": bool,
    "guid": gameClient.player.id,
    "cid": ConditionManager.prototype.COMBAT_LOCK
  });

  this.handleCondition(condition);

}

PacketHandler.prototype.handleCondition = function(packet) {

  /*
   * Function PacketHandler.handleCondition
   * Handles an incoming change to a condition
   */

  let creature = gameClient.world.getCreature(packet.guid);

  if(creature === null) {
    return;
  }

  // Determine what to do
  if(packet.toggle) {
    creature.addCondition(packet.cid);
  } else {
    creature.removeCondition(packet.cid);
  }

}

PacketHandler.prototype.handleTradeOffer = function(packet) {

  /*
   * Function PacketHandler.handleTradeOffer
   * Handles incoming packet to open a particular global chat channel
   */

  gameClient.interface.modalManager.open("offer-modal", packet)

}

PacketHandler.prototype.handlePlayerStatistics = function(packet) {

  /*
   * Function PacketHandler.handlePlayerStatistics
   * Handles a change capacity packet
   */

  // Ignore these packets
  if(gameClient.player === null) {
    return;
  }

  // Update the character state
  gameClient.player.state.capacity = packet.capacity;
  gameClient.player.state.attack = packet.attack;
  gameClient.player.state.armor = packet.armor;
  gameClient.player.state.speed = packet.speed;

}

PacketHandler.prototype.handleOpenChannel = function(packet) {

  /*
   * Function PacketHandler.handleOpenChannel
   * Handles incoming packet to open a particular global chat channel
   */

  gameClient.interface.channelManager.handleOpenChannel(packet);

}

PacketHandler.prototype.handleAddAchievement = function(packet) {

  /*
   * Function PacketHandler.handleAddAchievement
   * Handles incoming packet to send a distance effect from a position to a position
   */

  setTimeout(function() {
    document.getElementById("achievement").innerHTML = packet.title + "<hr>" + packet.description;
    document.getElementById("achievement").className = "canvas-notification visible";
  }, 1000);

  setTimeout(function() {
    document.getElementById("achievement").className = "canvas-notification hidden";
  }, 2000);

}

PacketHandler.prototype.handleSendDistanceEffect = function(packet) {

  /*
   * Function PacketHandler.handleSendDistanceEffect
   * Handles incoming packet to send a distance effect from a position to a position
   */

  gameClient.renderer.addDistanceAnimation(packet);

}

PacketHandler.prototype.handleSendMagicEffect = function(packet) {

  /*
   * Function PacketHandler.handleSendMagicEffect
   * Handles incoming packet to send a magic effect to a position
   */

  gameClient.renderer.addPositionAnimation(packet);

}

PacketHandler.prototype.handleTransformTile = function(packet) {

  gameClient.world.handleTransformTile(packet);

}

PacketHandler.prototype.handleAcceptLogin = function(packet) {

  /*
   * Function PacketHandler.handleAcceptLogin
   * Accepts the login reqeust and stores a player to memory
   */

  gameClient.handleAcceptLogin(packet);

}

PacketHandler.prototype.handleRemoveFriend = function(name) {

  /*
   * Function PacketHandler.handleRemoveFriend
   * Handles remove friend
   */

  gameClient.player.friendlist.remove(name);

}

PacketHandler.prototype.handleAddFriend = function(name) {

  /*
   * Function PacketHandler.handleAddFriend
   * Wrapper for an incoming add friend packet
   */

  gameClient.player.friendlist.add(name);

}

PacketHandler.prototype.handleCancelMessage = function(packet) {

  /*
   * Function PacketHandler.handleCancelMessage
   * Wrapper for a cancel message
   */

  gameClient.interface.notificationManager.setCancelMessage(packet);

}

PacketHandler.prototype.handleServerData = function(packet) {

  /*
   * Function PacketHandler.handleServerData
   * Handles incoming important server data (e.g., version and server tick rate)
   */

  gameClient.setServerData(packet);

}

PacketHandler.prototype.handleEmote = function(packet) {

  let sourceCreature = gameClient.world.getCreature(packet.id);

  if(sourceCreature === null) {
    return;
  }

  gameClient.interface.screenElementManager.createFloatingTextElement(
    "<i>%s</i>".format(packet.message),
    sourceCreature.getPosition(),
    packet.color
  );

}

PacketHandler.prototype.handleIncreaseHealth = function(packet) {

  /*
   * Function PacketHandler.handleIncreaseHealth
   * Handles an increase health packet from the server
   */

  // Get the creature this applies to
  let sourceCreature = gameClient.world.getCreature(packet.id);

  if(sourceCreature === null) {
    return;
  }

  // Limit the health addition to the maximum player health
  let health = Math.min(packet.amount, sourceCreature.maxHealth - sourceCreature.state.health);

  if(health === 0) {
    return; 
  }

  // Increase the creature health
  sourceCreature.increaseHealth(health);

  // Add a floating text element
  gameClient.interface.screenElementManager.createFloatingTextElement(
    health,
    sourceCreature.getPosition(),
    Interface.prototype.COLORS.LIGHTGREEN
  );

  // If self: add a message to the console
  if(gameClient.player === sourceCreature) {

    gameClient.interface.channelManager.addConsoleMessage(
      "You heal for %s health.".format(health),
      gameClient.interface.COLORS.WHITE
    );

  }

}

PacketHandler.prototype.handleEnterZone = function(packet) {

  /*
   * Function PacketHandler.handleEnterZone
   * Callback fired when a zone packet is received and we need to update the weather
   */

  gameClient.interface.notificationManager.setZoneMessage(packet.name, packet.title);
  gameClient.renderer.weatherCanvas.setWeather(packet.weather);
  gameClient.renderer.setAmbientColor(packet.ambient.r, packet.ambient.g, packet.ambient.b, packet.ambient.a);
  gameClient.interface.soundManager.setAmbientTrace(packet.music);

}

PacketHandler.prototype.handleLatency = function() {

  /*
   * Function GameClient.handlePong
   * Handles an incoming (ping) pong message
   */

  gameClient.networkManager.state.latency = performance.now() - gameClient.networkManager.__latency;

}

PacketHandler.prototype.handleChunk = function(packet) {

  /*
   * Function World.handleChunk
   * Handles incoming sector tiles
   */

  // Do not accept chunks that are somehow already active
  for(let i = 0; i < gameClient.world.chunks.length; i++) {
    if(packet.id === gameClient.world.chunks[i].id) {
      return;
    }
  }

  // Add the chunks and sort them by the identifier
  gameClient.world.chunks.push(new Chunk(packet.id, packet.position, packet.tiles));

  // Sort by the chunk identifier (low to high)
  gameClient.world.chunks.sort((a, b) => a.id - b.id);

  gameClient.world.referenceTileNeighbours();

}

PacketHandler.prototype.handleRemoveItem = function(packet) {

  /*
   * Function World.removeItem
   * Removes an item from the game world
   */

  let tile = gameClient.world.getTileFromWorldPosition(packet.position);

  if(tile === null) {
    return;
  }

  tile.removeItem(packet.index, packet.count);

}

PacketHandler.prototype.handleAdvanceLevel = function() {

  gameClient.player.advanceLevel();

}

PacketHandler.prototype.handleServerError = function(message) {

  return gameClient.interface.modalManager.open("floater-connecting", message);

}

PacketHandler.prototype.handleServerMessage = function(string) {

  /*
   * Function PacketHandler.handleServerMessage
   * Handles an incoming server broadcasted message
   */

  // Server messages are always in red
  gameClient.interface.notificationManager.setServerMessage(string, Interface.prototype.COLORS.RED);

}

PacketHandler.prototype.getTileUppie = function(position) {

  let tile = gameClient.world.getTileFromWorldPosition(position);

  if(!tile.isOccupied()) {
    return tile;
  }

  // Elevation change handling from high to low
  if(tile.id === 0) {
    return gameClient.world.getTileFromWorldPosition(position.down());
  }

  // Elevation change handling from low to high
  if(gameClient.player.getTile().hasMaximumElevation()) {
    return gameClient.world.getTileFromWorldPosition(position.up());
  }

  return tile;

}

PacketHandler.prototype.clientSideMoveCheck = function(position) {

  /*
   * Function PacketHandler.clientSideMoveCheck
   * Client side code to check whether a player can move before the server is informed
   */

  // Get the tile from the position to be moved to
  let tile = gameClient.world.getTileFromWorldPosition(position);

  if(tile.monsters.size > 0) {
    return true;
  }

  // Elevation change handling from high to low
  if(tile.id === 0) {

    if(gameClient.player.__position.isDiagonal(position)) {
      return true;
    }

    let belowTile = gameClient.world.getTileFromWorldPosition(position.down());

    if(belowTile !== null && belowTile.hasMaximumElevation() && !belowTile.isOccupied()) {
      return false;
    }

  }

  // Elevation change handling from low to high
  if(gameClient.player.getTile().hasMaximumElevation()) {

    if(gameClient.player.__position.isDiagonal(position)) {
      return true;
    }

    let upTile = gameClient.world.getTileFromWorldPosition(position.up());
    let aboveTile = gameClient.world.getTileFromWorldPosition(gameClient.player.__position.up());
    if((aboveTile === null || aboveTile.id === 0) && upTile !== null && !upTile.isOccupied()) {
      return false;
    }

  }

  // Client-side check whether the tile is occupied
  if(tile.isOccupied()) {
    return true;
  }

  return false;

}

PacketHandler.prototype.handlePlayerMove = function(position) {

  /*
   * Function PacketHandler.handlePlayerMove
   * Handles an incoming packet that makes a character move
   */

  // Do a client side check on the movement to block requests to the server
  if(this.clientSideMoveCheck(position)) {
    return gameClient.interface.setCancelMessage("You cannot walk here.");
  }

  let tile = this.getTileUppie(position);

  // Step duration
  let duration = gameClient.player.getStepDuration(tile);

  return gameClient.world.handleCreatureMove(gameClient.player.id, position, duration);

}

PacketHandler.prototype.handleDamageEvent = function(packet) {

  /*
   * Function PacketHandler.handleDamageEvent
   * Handles an incoming damage event
   */

  // Add an animation to the world
  let sourceCreature = gameClient.world.getCreature(packet.source);
  let targetCreature = gameClient.world.getCreature(packet.target);

  // Fields
  if(packet.source === 0 && targetCreature !== null) {
    return this.__handleDamageEnvironment(targetCreature, packet.damage, packet.color);
  }

  // No information on these?
  if(sourceCreature === null || targetCreature === null) {
    return;
  }

  // Blood animation
  targetCreature.addAnimation(1);

  // Add attacked animation with a black box around the source creature
  if(targetCreature === gameClient.player && sourceCreature !== gameClient.player) {
    sourceCreature.addBoxAnimation(Interface.prototype.COLORS.BLACK);
  }

  // Subtract damage from target health
  targetCreature.increaseHealth(-packet.damage);

  // Add console message of damage event
  if(gameClient.player === targetCreature) {

    gameClient.interface.channelManager.addConsoleMessage(
      "You lose %s health to a %s.".format(packet.damage, sourceCreature.name),
      Interface.prototype.COLORS.WHITE
    );

  } else if(gameClient.player === sourceCreature) {

    gameClient.interface.channelManager.addConsoleMessage(
      "You deal %s damage to a %s.".format(packet.damage, targetCreature.name),
      Interface.prototype.COLORS.WHITE
    );

  }

  // Add a floating text element that shows the damage
  gameClient.interface.screenElementManager.createFloatingTextElement(
    packet.damage,
    targetCreature.getPosition(),
    packet.color
  );

}

PacketHandler.prototype.handleChangeOutfit = function(packet) {

  /*
   * Function GameClient.handleChangeOutfit
   * Function to handle incoming change outfit packet
   */

  // Fetch the entity by the passed identifier and update its outfit
  let creature = gameClient.world.getCreature(packet.id);

  if(creature === null) {
    return;
  }

  creature.serverSetOutfit(packet.outfit);

}

PacketHandler.prototype.getLiquidText = function(liquidType) {

  /*
   * Function PacketHandler.getLiquidText
   * Maps the liquid identifier to readable text
   */

  switch(liquidType) {
    case 0:
      return null;
    case 1:
    case 9:
      return "water";
    case 2:
      return "blood";
    case 3:
      return "beer";
    case 4:
    case 12:
      return "slime";
    case 5:
      return "lemonade";
    case 6:
      return "milk";
    case 7:
      return "mana fluid";
    case 10:
      return "health fluid";
    case 11:
      return "oil";
    case 13:
      return "urine";
    case 14:
      return "coconut milk";
    case 15:
      return "wine";
    case 19:
      return "mud";
    case 21:
      return "fruit juice";
    case 26:
      return "lava";
    case 27:
      return "rum";
    default:
      return "unknown substance";
  }

}

PacketHandler.prototype.handleLiquidMessage = function(packet) {

  /*
   * Function PacketHandler.handleLiquidMessage
   * Handles an incoming liquid message
   */

  let liquid = this.getLiquidText(packet.count);

  if(liquid === null) {
    return "You see an empty %s.".format(packet.name);
  }

  return "You see %s %s of %s.".format(packet.article, packet.name, liquid);

}

PacketHandler.prototype.getItemDescription = function(packet) {

  /*
   * Function PacketHandler.getItemDescription
   * Returns the item information from a thing
   */

  let thing = new Item(packet.cid);

  if(thing.isFluidContainer() || thing.isSplash()) {
    return this.handleLiquidMessage(packet);
  }

  // Single
  if(packet.count === 0 || packet.count === 1) {
    return "You see %s %s.".format(packet.article, packet.name);
  }

  // Counts, singular and plural
  if(packet.name.slice(-1) === "s") {
    return "You see %s %ses.".format(packet.count, packet.name);
  } else {
    return "You see %s %ss.".format(packet.count, packet.name);
  }

}

PacketHandler.prototype.handleCharacterInformation = function(packet) {

  /*
   * Function PacketHandler.handleCharacterInformation
   * Handles an incoming server packet with character information
   */

  let gender = packet.gender === 0 ? "He" : "She";

  // Show a server message
  gameClient.interface.notificationManager.setServerMessage(
    "You see %s. %s is level %s.".format(packet.name, gender, packet.level),
    Interface.prototype.COLORS.LIGHTGREEN
  );

  // Add to the console in lightgreen
  gameClient.interface.channelManager.addConsoleMessage(
    "You see %s. %s is level %s.".format(packet.name, gender, packet.level),
    Interface.prototype.COLORS.LIGHTGREEN
  );

}

PacketHandler.prototype.handleItemInformation = function(packet) {

  /*
   * Function PacketHandler.handleItemInformation
   * Handles incoming item information and writes it to the channel
   */

  let message = this.getItemDescription(packet);
  let thing = new Thing(packet.cid);

  // Add the description
  if(packet.description) {
    message += " %s".format(packet.description);
  }

  // Distance information
  if(packet.distanceReadable) {
    message += " %s".format(packet.distanceReadable);
  }

  if(packet.weight) {
    if(thing.isStackable() && packet.count > 1) {
      message += " They weigh %soz.".format((1E-2 * packet.weight).toFixed(2));
    } else {
      message += " It weighs %soz.".format((1E-2 * packet.weight).toFixed(2));
    }
  }

  if(packet.armor !== 0) {
    message += " (Armor: %s)".format(packet.armor);
  }

  if(packet.attack !== 0) {
    message += " (Attack: %s)".format(packet.attack);
  }

  // When debugging lets show the client and server identifier
  if(gameClient.renderer.debugger.isActive()) {
    message += " (SID: %s, CID: %s)".format(packet.sid, packet.cid);
  }

  // Show a server message
  gameClient.interface.notificationManager.setServerMessage(
    message,
    Interface.prototype.COLORS.LIGHTGREEN
  );

  // Add to the console in lightgreen
  gameClient.interface.channelManager.addConsoleMessage(
    message,
    gameClient.interface.COLORS.LIGHTGREEN
  );

}

PacketHandler.prototype.handleEntityRemove = function(id) {

  /*
   * Function PacketHandler.handleEntityRemove
   * Handles incoming remove entity packet and deletes reference
   */

  let creature = gameClient.world.getCreature(id);

  if(creature === null) {
    return
  }

  // Never dereference self
  if(gameClient.isSelf(creature)) {
    return;
  }

  // Get the tile of the creature
  let tile = gameClient.world.getTileFromWorldPosition(creature.getPosition());

  if(tile === null) {
    return;
  }

  // Delete it from the tile
  tile.monsters.delete(creature);

  // Delete the target of the creature
  if(gameClient.player.__target === creature) {
    gameClient.player.setTarget(null);
  }

  creature.remove();


  // Finally delete the reference
  delete gameClient.world.activeCreatures[id];
  return gameClient.interface.windowManager.getWindow("battle-window").removeCreature(id);

}

PacketHandler.prototype.handleContainerItemRemove = function(packet) {

  /*
   * Function GameClient.handleContainerItemRemove
   * Handles an item being added to a container
   */

  let container = gameClient.player.getContainer(packet.containerIndex);

  if(container === null) {
    return;
  }

  container.removeItem(packet.slotIndex, packet.count);

}

PacketHandler.prototype.handleContainerAddItem = function(packet) {

  /*
   * Function GameClient.handleContainerAddItem
   * Handles an item being added to a container
   */

  // Get the container from the plyer from the index
  let container = gameClient.player.getContainer(packet.containerId);

  if(container === null) {
    return;
  }

  container.addItem(new Item(packet.itemId, packet.count), packet.slot);

}

PacketHandler.prototype.handleContainerOpen = function(packet) {

  /*
   * Function PacketHandler.handleContainerOpen
   * Opens a container to the DOM
   */

  // Create the container and add the items
  let container = new Container(packet);

  // Create the DOM
  container.createDOM(packet.equipped ? packet.title + "[E]" : packet.title, packet.items);

  // Register the element with the window manager
  gameClient.interface.windowManager.register(container.window);

  // Open the container for the player
  gameClient.player.openContainer(container);

}

PacketHandler.prototype.handleContainerClose = function(id) {

  /*
   * Function PacketHandler.handleContainerClose
   * Handles an incoming message to close a container
   */

  let container = gameClient.player.getContainer(id);

  if(container === null) {
    return;
  }

  // Remove!
  gameClient.player.removeContainer(container);

}

PacketHandler.prototype.handlePlayerDisconnect = function(name) {

  /*
   * Function PacketHandler.handlePlayerDisconnect
   * Handles incoming packet that a player has disconnected
   */

  gameClient.player.friendlist.setOnlineStatus(name, false);

}

PacketHandler.prototype.handlePlayerConnect = function(name) {

  /*
   * Function PacketHandler.handlePlayerConnect
   * Handles incoming packet that a player has connected
   */

  gameClient.player.friendlist.setOnlineStatus(name, true);

}

PacketHandler.prototype.handleCreatureServerMove = function(packet) {

  /*
   * Function PacketHandler.handleCreatureServerMove
   * Handles a server packet that confirms a creature with an identifier moves to a new position
   */

  // See if the entity already exists
  let entity = gameClient.world.getCreature(packet.id);

  // Cannot move unknown entities: this should not happen
  if(entity === null) {
    return;
  }

  // Execute movement
  gameClient.world.__handleCreatureMove(packet.id, packet.position, packet.speed);

  // If the entity being reference is the player: we confirm the client-side walking and check existing references against entities
  // This means that we can drop references to entities that no longer share a neighbouring sector with us
  if(gameClient.isSelf(entity)) {
    gameClient.player.confirmClientWalk();
    gameClient.world.checkEntityReferences();
    gameClient.world.checkChunks();
  }

}

PacketHandler.prototype.handleReadText = function(packet) {

  /*
   * Function PacketHandler.handleReadText
   * Handles an incoming readable text packet
   */

  // Open the readable modal
  gameClient.interface.modalManager.open("readable-modal", packet);

}

PacketHandler.prototype.handleChannelMessage = function(packet) {

  /*
   * Function PacketHandler.handleChannelMessage
   * Handles an incoming entity speak event
   */

  let channel = gameClient.interface.channelManager.getChannelById(packet.id);

  if(channel === null) {
    return;
  }

  // Add the message to the channel
  channel.addMessage(packet.message, 0, packet.name, packet.color);

}

PacketHandler.prototype.handleDefaultMessage = function(packet) {

  /*
   * Function GameClient.handleDefaultMessage
   * Handles an incoming default message from the server
   */

  let entity = gameClient.world.getCreature(packet.id);

  // The entity for this packet does not exist..
  if(entity === null) {
    return;
  }

  // Only when visible (client-side check)
  if(!gameClient.player.canSeeSmall(entity)) {
    return;
  }

  entity.say(packet);

}

PacketHandler.prototype.handleEntityTeleport = function(packet) {

  /*
   * Function GameClient.handleEntityTeleport
   * Handles a server packet to teleport an entity
   */

  let entity = gameClient.world.getCreature(packet.id);

  // The entity does not exist
  if(entity === null) {
    return;
  }

  // Set the position of the entity
  entity.setPosition(packet.position);

  // Special handler if the player is the one that is teleported
  if(gameClient.isSelf(entity)) {
    gameClient.world.handleSelfTeleport();
  }

}

PacketHandler.prototype.handleEntityReference = function(packet) {

  /*
   * Function GameClient.handleEntityReference
   * Handles an incoming entity reference with the entity information
   */

  // Do not reference self but add
  if(gameClient.player && packet.id === gameClient.player.id) {
    return gameClient.world.addCreature(gameClient.player);
  }

  gameClient.world.createCreature(packet.id, new Creature(packet));


}

PacketHandler.prototype.handleCreatureTurn = function(packet) {

  /*
   * Function PacketHandler.handleCreatureTurn
   * Handles turn direction for a creature
   */

  let creature = gameClient.world.getCreature(packet.id);

  if(creature === null) {
    return;
  }

  creature.setTurnBuffer(packet.direction);

}

PacketHandler.prototype.handleReceivePrivateMessage = function(packet) {

  /*
   * Function GameClient.handleReceivePrivateMessage
   * Handles an incoming private message and directs it to the proper channel
   */

  // Try to get the channel
  let channel = gameClient.interface.channelManager.getChannel(packet.name);

  // If it does not exist: set it to the Default channel
  if(channel === null) {
    channel = gameClient.interface.channelManager.getChannel("Default");
  }

  return channel.addPrivateMessage(packet.message, packet.name);

}

PacketHandler.prototype.handleGainExperience = function(packet) {

  /*
   * Function PacketHandler.handleGainExperience
   * Handles gaining of experience for a creature
   */

  // Get the creature from the list of known creatures
  let creature = gameClient.world.getCreature(packet.id);

  if(creature === null) {
    return console.error("Received experience gain for unknown creature.");
  }

  // Add to the DOM
  gameClient.interface.screenElementManager.createFloatingTextElement(
    packet.experience,
    creature.getPosition(),
    Interface.prototype.COLORS.WHITE
  );

  // Only for self
  if(gameClient.player !== creature) {
    return;
  }

  gameClient.interface.channelManager.addConsoleMessage(
    "You gain %s experience.".format(packet.experience),
    Interface.prototype.COLORS.WHITE
  );

  // Add the experience
  creature.addExperience(packet.experience);
 
}

PacketHandler.prototype.handleItemAdd = function(packet) {

  /*
   * Function GameClient.handleItemAdd
   * Handles an add item event from the server
   */

  // Create a new wrapper thing with the identifier and count
  let thing = new Thing(packet.id, packet.count);

  // Create a new book or item
  if(thing.hasFlag(PropBitFlag.prototype.flags.DatFlagWritableOnce | PropBitFlag.prototype.flags.DatFlagWritable)) {
    return gameClient.world.addItem(packet.position, new Book(packet.id), packet.slot);
  }

  // Create a new fluid container
  if(thing.isFluidContainer() || thing.isSplash()) {
    return gameClient.world.addItem(packet.position, new FluidThing(packet.id, packet.count), packet.slot);
  }

  // Just a default item
  gameClient.world.addItem(packet.position, new Item(packet.id, packet.count), packet.slot);

}

PacketHandler.prototype.__handleDamageEnvironment = function(targetCreature, damage, color) {

  /*
   * Function PacketHandler.__handleDamageEnvironment
   * Handles an environmental damage event
   */

  // Add a floating text element
  gameClient.interface.screenElementManager.createFloatingTextElement(
    damage,
    targetCreature.getPosition(),
    color
  );
  
  // Show damage
  gameClient.interface.channelManager.addConsoleMessage(
    "You lose %s health.".format(damage),
    Interface.prototype.COLORS.WHITE
  );
  
  targetCreature.increaseHealth(-damage);

}
