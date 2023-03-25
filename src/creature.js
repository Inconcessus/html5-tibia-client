const Creature = function(data) {

  /*
   * Class Creature
   * Container for a generic interactive creature (e.g., monster, NPC, players) that are not the game player itself
   *
   * Public API:
   *
   * @Creature.getHealthColor - returns the health color of the creature based on its current health percentage
   * @Creature.getHealthPercentage - returns the player health percentage (0 - 100%)
   * @Creature.getHealthFraction - returns the player health as a fraction (0 - 1)
   *
   */

  this.state = new State();
  this.state.add("health", this.setHealthStatus.bind(this));

  // Save properties to the instance
  this.id = data.id;
  this.type = data.type;
  this.name = data.name;
  this.__position = data.position;
  this.maxHealth = data.maxHealth;
  this.speed = data.speed;
  this.attackSlowness = data.attackSlowness;
  this.conditions = new ConditionManager(this, data.conditions);

  this.__lookDirection = data.direction;
  this.__previousPosition = data.position.copy();

  // The creature outfit
  this.outfit = new Outfit(data.outfit);
  this.castingManager = new CastingManager();

  // Internal information
  this.spriteBuffer = new SpriteBuffer(this.outfit.getSpriteBufferSize(this.outfit.getDataObject()));

  // If the creature has mount create a sprite buffer for its outfit
  if(this.outfit.getDataObjectMount()) {
    this.spriteBufferMount = new SpriteBuffer(this.outfit.getSpriteBufferSize(this.outfit.getDataObjectMount()));
  }

  // Set the current sector
  this.__movementEvent = null;
  this.__lookDirectionBuffer = null;
  this.__chunk = gameClient.world.getChunkFromWorldPosition(this.__position);
  this.__teleported = false;

  // Create a name DOM element for the creature
  this.__createCharacterElement();

  // The active text element that appears above the player's head
  this.__activeTextElement = null;

  // The target creature of the player
  this.__target = null;

  // Animations that affect the creature
  this.__animations = new Set();

  this.state.health = data.health;

}

Creature.prototype.removeCondition = function(cid) {

  /*
   * Function Player.removeCondition
   * Removes a condition from the player and updates the status bar
   */

  this.conditions.remove(cid);

}

Creature.prototype.addCondition = function(cid) {

  /*
   * Function Player.addCondition
   * Adds a condition ro the player and updates the status bar
   */

  // Add the condition identifier to the set
  this.conditions.add(cid);

}

Creature.prototype.hasCondition = function(cid) {

  /*
   * Function Player.hasCondition
   * Returns true if the player has a condition
   */

  return this.conditions.has(cid);

}

Creature.prototype.blockHit = function() {

  /*
   * Function Creature.blockHit
   * Plays a simple block hit animation effect on the creature
   */

  return gameClient.renderer.addPositionAnimation({
    "position": this.__position,
    "type": 3
  });

}

Creature.prototype.setHealthStatus = function() {

  this.characterElement.setDefault();

}

Creature.prototype.getMaxFloor = function() {

  /*
   * Function Creature.getMaxFloor
   * Returns the maximum visible floor for the creature
   */

  return gameClient.world.getChunkFromWorldPosition(this.getPosition()).getFirstFloorFromBottom(this.getPosition());

}

Creature.prototype.getCharacterFrames = function() {

  /*
   * Function Creature.getCharacterFrames
   * Returns the character and mount frames and frame groups to be rendered
   */

  // Get both the character and the mount data objects
  let characterObject = this.outfit.getDataObject();
  let mountObject = this.outfit.getDataObjectMount();

  if(characterObject === null) {
    return null;
  }

  // Define the variables to return
  let characterGroup, mountGroup, characterFrame, mountFrame;

  // The character is not moving: get the idle group
  if(!this.isMoving()) {

    characterGroup = characterObject.getFrameGroup(FrameGroup.prototype.GROUP_IDLE);

    if(characterObject.frameGroups.length === 1 && !characterObject.isAlwaysAnimated()) {
      characterFrame = 0;
    } else {
      characterFrame = characterGroup.getAlwaysAnimatedFrame();
    }

    // Mounts
    if(gameClient.clientVersion === 1098) {
      mountGroup = mountObject.getFrameGroup(FrameGroup.prototype.GROUP_IDLE);
      mountFrame = mountGroup.getAlwaysAnimatedFrame();
    } else {
      mountGroup = 0;
      mountFrame = 0;
    }

  } else {

    characterGroup = characterObject.getFrameGroup(FrameGroup.prototype.GROUP_MOVING);
    characterFrame = this.__getWalkingFrame(characterGroup);

    // Mounts
    if(gameClient.clientVersion === 1098) {
      mountGroup = mountObject.getFrameGroup(FrameGroup.prototype.GROUP_MOVING);
      mountFrame = this.__getWalkingFrame(characterGroup);
    } else {
      mountGroup = 0;
      mountFrame = 0;
    }

  }

  // Return the frames and groups to be used by the renderer
  return new Object({
    characterGroup,
    mountGroup,
    characterFrame,
    mountFrame
  });

}

Creature.prototype.getPosition = function() {

  /*
   * Function Creature.getPosition
   * Returns the position of the creature
   */

  return this.__position;

}

Creature.prototype.hasTarget = function() {

  /*
   * Function Creature.hasTarget
   * Returns true if the creature has a target
   */

  return this.__target !== null;

}

Creature.prototype.isMounted = function() {

  /*
   * Function Creature.isMounted
   * Returns whether the creature is mounted
   */

  return this.outfit.mounted;

}

Creature.prototype.serverSetOutfit = function(outfit) {

  /*
   * Function Creature.serverSetOutfit
   * Updates the current outfit of the creature with a new outfit
   */

  this.outfit = outfit;

  // Clear the outfit sprite buffer to make room for the new sprite
  this.spriteBuffer = new SpriteBuffer(this.outfit.getSpriteBufferSize(this.outfit.getDataObject()));

  // If there is a mount: add a sprite buffer for the mounts as well
  if(this.outfit.getDataObjectMount()) {
    this.spriteBufferMount = new SpriteBuffer(this.outfit.getSpriteBufferSize(this.outfit.getDataObjectMount()));
  }
 
}

Creature.prototype.setPosition = function(position) {

  /*
   * Function Creature.setPosition
   * Sets the creature position to a new position in the world
   */

  // Remove from the previous tile
  let fromTile = gameClient.world.getTileFromWorldPosition(this.getPosition());

  // Delete it from the local client tile
  if(fromTile !== null) {
    fromTile.removeCreature(this);
  }

  // Update the position and set to the next tile/sector
  this.__position = position;
  this.__chunk = gameClient.world.getChunkFromWorldPosition(position);
  gameClient.world.getTileFromWorldPosition(position).addCreature(this);

}

Creature.prototype.getHealthPercentage = function() {

  /*
   * Function Creature.getHealthPercentage
   * Returns the health as a percentage 
   */

  return this.getHealthFraction().toPercentage();

}

Creature.prototype.getHealthFraction = function() {

  /*
   * Function Creature.getHealthFraction
   * Returns the health fraction of a creature
   */

  // Clamp the fraction between 0 and 1
  return (this.state.health / this.maxHealth).clamp(0, 1);

}

Creature.prototype.say = function(packet) {

  /*
   * Function Creature.say
   * Says a message packet from the server
   */

  // Reset the text buffer
  this.textBuffer = new Array();

  // Overwrite the currently active DOM element if it exists
  if(this.__activeTextElement !== null) {
    this.__activeTextElement.complete();
  }

  // New lines indicate breaks in speaking
  this.textBuffer = packet.message.split("\n");

  // Write text to the game screen
  return this.__setActiveTextElement(this.textBuffer.shift(), packet.color);

}

Creature.prototype.addBoxAnimation = function(color) {

  /*
   * Function Renderer.addBoxAnimation
   * Adds a box animation around the creature (e.g., when attacking or being attacked)
   */

  this.__animations.add(new BoxAnimation(color));

}

Creature.prototype.deleteAnimation = function(animation) {

  /*
   * Function Creature.deleteAnimation
   * Deletes an animation that is attached to a creature
   */

  this.__animations.delete(animation);

}

Creature.prototype.addAnimation = function(id) {

  /*
   * Function Renderer.addCreatureAnimation
   * Adds an animation that sticks to the passed creature identifier
   */
  
  // Get the animation identifier
  let aid = gameClient.dataObjects.getAnimationId(id);

  if(aid === null) {
    return;
  }

  this.__animations.add(new Animation(aid));

}

Creature.prototype.increaseHealth = function(amount) {

  /*
   * Function Creature.increaseHealth
   * Increases the health of the creature until a maximum
   */

  this.state.health = (this.state.health + amount).clamp(0, this.maxHealth);

}

Creature.prototype.getTarget = function() {

  /*
   * Function Creature.getTarget
   * Returns the current target of the creature
   */

  return this.__target;

}

Creature.prototype.remove = function() {

  /*
   * Function Creature.remove
   * Removes the creatures references and DOM elements
   */

  // Make sure to remove the name element from the DOM
  this.characterElement.remove();

}

Creature.prototype.getMoveOffset = function() {

  /*
   * Function GameClient.getMoveOffset
   * Returns the movement fraction offset in pixels
   */

  // The creature is moving, there is no offset
  if(!this.isMoving() || this.__teleported) {
    return Position.prototype.NULL;
  }

  // Get the fraction of how much of the movement event has been completed
  let fraction = this.getMovingFraction();

  // The face direction is important here
  switch(this.getLookDirection()) {
    case Position.prototype.opcodes.WEST:
      return new Position(-fraction, 0, 0);
    case Position.prototype.opcodes.NORTH:
      return new Position(0, -fraction, 0);
    case Position.prototype.opcodes.EAST:
      return new Position(fraction, 0, 0);
    case Position.prototype.opcodes.SOUTH:
      return new Position(0, fraction, 0);
    case Position.prototype.opcodes.NORTH_WEST:
      return new Position(-fraction, -fraction, 0);
    case Position.prototype.opcodes.NORTH_EAST:
      return new Position(fraction, -fraction, 0);
    case Position.prototype.opcodes.SOUTH_EAST:
      return new Position(fraction, fraction, 0);
    case Position.prototype.opcodes.SOUTH_WEST:
      return new Position(-fraction, fraction, 0);
  }

}


Creature.prototype.moveTo = function(position, speed) {

  /*
   * Function Creature.moveTo
   * Moves a creature to the given position
   */

  // Cancel event if we are not within the world bounds
  if(!gameClient.world.isValidWorldPosition(position)) {
    return false;
  }

  // Update the current sector of the creature
  this.__chunk = gameClient.world.getChunkFromWorldPosition(position);

  // Cancel any previous events
  if(this.__movementEvent) {
    this.__movementEvent.cancel();
  }

  // Calculate the speed. This is doubled when moving diagonally (effectively 2 squares)
  let modSlowness = (this.getPosition().isDiagonal(position) ? 2 : 1) * speed;

  // Add the movement event
  this.__movementEvent = gameClient.eventQueue.addEvent(this.unlockMovement.bind(this), modSlowness);

  // Get the movement direction
  let angle = this.getPosition().getLookDirection(position);

  if(angle !== null) {
    this.__lookDirection = angle;
  }

  this.__previousPosition = this.getPosition();

  // Finally update the actual position
  this.__position = position;

  // Play walking sound
  if(gameClient.player.canSeeSmall(this) && position.z === gameClient.player.__position.z) {
    gameClient.interface.soundManager.playWalkBit(position);
  }

  // If the player is moving let us update the minimap
  if(this === gameClient.player) {
    return gameClient.renderer.minimap.cache();
  }

}

Creature.prototype.getLookDirection = function() {

  /*
   * Function Creature.getLookDirection
   * Returns the facing direction of the creature
   */

  return this.__lookDirection;

}

Creature.prototype.setTurnBuffer = function(direction) {

  /*
   * Function Creature.setTurnBuffer
   * Sets the direction of the creature to a new direction
   */

  // If moving update the buffer to be updated when creature stops moving
  if(this.isMoving()) {
    return this.__lookDirectionBuffer = direction;
  }

  // Update the look direction
  this.__setLookDirection(direction);

}

Creature.prototype.unlockMovement = function() {

  /*
   * Function Creature.unlockMovement
   * Callback fired when a movement lock is lifted
   */

  // A turn event is buffered: honor when movement is stopped
  if(this.__lookDirectionBuffer !== null) {
    this.__lookDirection = this.__lookDirectionBuffer;
    this.__lookDirectionBuffer = null;
  }

  // Reset the movement event
  this.__movementEvent = null;
  this.__teleported = false;

  if(gameClient.player === this && gameClient.world.pathfinder.__pathfindCache.length > 0) {
    return gameClient.world.pathfinder.handlePathfind();
  }

  // If the player has a movement buffered: enact and reset the buffer
  // This facilitates smooth walking
  if(gameClient.player === this && this.__movementBuffer !== null) {
    gameClient.keyboard.handleCharacterMovement(this.__movementBuffer);
    this.__movementBuffer = null;
  }

}

Creature.prototype.getChunk = function() {

  /*
   * Function Creature.getChunk
   * Returns the current chunk that the creature belongs to
   */

  return this.__chunk;

}

Creature.prototype.isMoving = function() {

  /*
   * Function Creature.isMoving
   * Returns true when the character has a movement event lock and is moving
   */

  return this.__movementEvent !== null;

}

Creature.prototype.getMovingFraction = function() {

  /*
   * Function Creature.getMovingFraction
   * Returns the fraction of movement completed by the creature
   */

  // If not moving: the fraction is most definitely 0
  if(!this.isMoving()) {
    return 0;
  }

  // Was teleported and does not have a moving fraction
  if(this.__teleported) {
    return 0;
  }

  // Calculate the fraction of movement completion: negative?
  return this.__movementEvent.remainingFraction();

}

Creature.prototype.canSee = function(thing) {

  /*
   * Function Creature.canSee
   * Returns true when the creature can see a world object completely
   */

  let projectedSelf = this.getPosition().projected();
  let projectedThing = thing.getPosition().projected();

  // Calculate delta in view (account for elevation projection)
  let dx = Math.abs(projectedSelf.x - projectedThing.x);
  let dy = Math.abs(projectedSelf.y - projectedThing.y);

  // Delta must be smaller than the screen width
  return (dx < 10) && (dy < 8);

}

Creature.prototype.canSeeSmall = function(thing) {

  /*
   * Function Creature.canSeeSmall
   * Returns true when the creature can see a world object fully
   */

  let projectedSelf = this.getPosition().projected();
  let projectedThing = thing.getPosition().projected();

  // Calculate delta in view (account for elevation projection)
  let dx = Math.abs(projectedSelf.x - projectedThing.x);
  let dy = Math.abs(projectedSelf.y - projectedThing.y);

  // Must be visible in both x and y
  return (dx < 8) && (dy < 6);

}

Creature.prototype.__setLookDirection = function(direction) {

  /*
   * Function Creature.__setLookDirection
   * Sets the direction of the creature to a new direction
   */

  this.__lookDirection = direction;

}

Creature.prototype.__setActiveTextElement = function(message, color) {

  /*
   * Function Creature.__setActiveTextElement
   * Sets a new active text element for the creature
   */

  // Show NPC and Player inforation in the chat channel
  this.__activeTextElement = gameClient.interface.screenElementManager.createTextElement(
    this,
    message,
    color
  );

}

Creature.prototype.__getWalkingFrame = function(frameGroup) {

  /*
   * Function Creature.__getWalkingFrame
   * Returns the walking frame of the creature depending on the movement event
   */

  // Calculate the appropriate frame
  return Math.round((1 - this.getMovingFraction()) * (frameGroup.animationLength - 1));

}

Creature.prototype.__createCharacterElement = function() {

  /*
   * Function Creature.__createCharacterElement
   * Creates a name tag DOM element for the creature
   */

  // We use a sticky text element for the nametag
  this.characterElement = new CharacterElement(this);

  // Add it to the DOM
  gameClient.interface.screenElementManager.add(this.characterElement.element);

  // Make sure to update it directly
  this.characterElement.setHealthFraction(this.getHealthFraction());

}
