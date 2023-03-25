const Renderer = function() {

  /*
   * Class Renderer
   * Class that is resposnbile for the rendering of the game screen
   *
   * API:
   *
   * Renderer.render - renders the gameworld and interface
   * Renderer.getTileCache() - returns the currently cache of tiles that need to be rendered
   * Renderer.updateTileCache() - updates the tilecache
   * Renderer.setAmbientColor(r, g, b, a) - Sets the ambient color of the fog
   * Renderer.setWeather(boolean) - Turns on/off weather with bool
   * Renderer.addDistanceAnimation() - Adds a new distance animation
   * Renderer.addPositionAnimation() - Adds a new position animation
   *
   */

  // This is the main game screen for all the sprites
  this.screen = new Canvas("screen", Interface.prototype.SCREEN_WIDTH_MIN, Interface.prototype.SCREEN_HEIGHT_MIN);

  // This is the screen through which lighting is handled
  this.lightscreen = new LightCanvas(null, Interface.prototype.SCREEN_WIDTH_MIN, Interface.prototype.SCREEN_HEIGHT_MIN);

  // This is the canvas through which weather is handled (e.g., fog and clouds)
  this.weatherCanvas = new WeatherCanvas(this.screen);

  // This is a tiny canvas through which item outlines are rendered in white
  this.outlineCanvas = new OutlineCanvas(null, 130, 130);

  // The minimap to display the world in preview in the top-right corner
  this.minimap = new Minimap(gameClient.world.width, gameClient.world.height);

  // Debugger for internal statistics to be displayed
  this.debugger = new Debugger();

  // State variables of the renderer
  this.__start = performance.now();
  this.__nMiliseconds = 0;
  this.drawCalls = 0;
  this.numberOfTiles = 0;

  // This is the cache where we collect all tiles to be renderered: only needs to be updated when the player moves
  this.__tileCache = new Array();

  // Distance animations belong to a layer
  this.__createAnimationLayers();

}

Renderer.prototype.render = function() {

  /*
   * Function Renderer.render
   * Main entry point that is called every frame
   */

  // Increment the renderer with the delta (ms) from previous frame
  this.__increment();

  // Render the gameworld
  this.__renderWorld();

  // Render other overlaid things
  this.__renderOther();

}

Renderer.prototype.getTileCache = function() {

  /*
   * Function Renderer.getTileCache
   * Returns all the tiles that are visible on the screen
   */

  return this.__tileCache;

}

Renderer.prototype.updateTileCache = function() {

  /*
   * Function Renderer.updateTileCache
   * Request an updates to the tile cache. This is the selection of tiles to be drawn to the screen every frame
   */

  // Empty and refill the cache
  this.__tileCache = new Array();
  this.numberOfTiles = 0;

  // Get the max visible floor
  let max = gameClient.player.getMaxFloor();

  // Collect all tiles up until the maximum floor to render
  for(let i = 0; i < max; i++) {

    let tiles = this.__getFloorTilesTiles(i);
    this.__tileCache.push(tiles);
    this.numberOfTiles = this.numberOfTiles + tiles.length;

  }

}

Renderer.prototype.takeScreenshot = function(event) {

  /*
   * Function Renderer.takeScreenshot
   * Takes a screenshot of the gamescreen and downloads it to file. Getting the canvas is easy but rendering the DOM text takes some extra work
   */

  // Stop default F12 behavior
  event.preventDefault();

  // Set up downloading element
  let element = document.createElement("a");
  element.download = "screenshot-%s.png".format(new Date().toISOString());

  // Render the character plates
  Object.values(gameClient.world.activeCreatures).forEach(function(activeCreature) {

    let style = window.getComputedStyle(activeCreature.characterElement.element.querySelector("span"));
    let position = this.getCreatureScreenPosition(activeCreature);

    this.screen.renderText(
      activeCreature.name,
      32 * position.x,
      32 * position.y,
      style.color,
      style.font
    );

  }, this);

  // Render the text elements to the canvas
  gameClient.interface.screenElementManager.activeTextElements.forEach(function(element) {

    let style = window.getComputedStyle(element.element.querySelector("span"));
    let position = this.getStaticScreenPosition(element.__position);

    this.screen.renderText(
      element.__message,
      32 * position.x,
      32 * position.y,
      style.color,
      style.font
    );

  }, this);

  // Click and clean up
  element.href = this.screen.canvas.toDataURL();
  element.click();
  element.remove();

}

Renderer.prototype.setAmbientColor = function(r, g, b, a) {

  /*
   * Function Renderer.setAmbientColor
   * Delegates to the lightscreen and sets the ambient color of the world to rgba
   */

  this.lightscreen.setAmbientColor(r, g, b, a);

}

Renderer.prototype.setWeather = function(bool) {

  /*
   * Function Renderer.setWeather
   * Sets the weather to either on/off
   */

  this.weatherCanvas.setWeather(bool);

}

Renderer.prototype.addDistanceAnimation = function(packet) {

  /*
   * Function Renderer.addDistanceAnimation
   * Adds a distance animation
   */

  let animationId = gameClient.dataObjects.getDistanceAnimationId(packet.type);

  if(animationId === null) {
    return;
  }

  let animation = new DistanceAnimation(animationId, packet.from, packet.to);

  this.__animationLayers[packet.from.z % 8].add(animation);

}

Renderer.prototype.addPositionAnimation = function(packet) {

  /*
   * Function Renderer.addPositionAnimation
   * Adds an animation on the given tile position
   */

  let tile = gameClient.world.getTileFromWorldPosition(packet.position);

  if(tile === null) {
    return;
  }

  let animationId = gameClient.dataObjects.getAnimationId(packet.type);

  if(animationId === null) {
    return;
  }

  return tile.addAnimation(new Animation(animationId));

}

Renderer.prototype.getStaticScreenPosition = function(position) {

  /*
   * Function Renderer.getStaticScreenPosition
   * Return the static position of a particular world position
   */

  // Get the projected positions of everything
  let projectedPlayer = gameClient.player.getPosition().projected();
  let projectedThing = position.projected();

  // Oh god.. the sum of: the player moving, the tile position, the player position, the floor and player elevations, the viewport offset
  let x = 7 + gameClient.player.getMoveOffset().x + projectedThing.x - projectedPlayer.x;
  let y = 5 + gameClient.player.getMoveOffset().y + projectedThing.y - projectedPlayer.y;

  // Projected on "zeroth" 2D floor
  return new Position(x, y, 0);

}

Renderer.prototype.getCreatureScreenPosition = function(creature) {

  /*
   * Function Renderer.getCreatureScreenPosition
   * Returns the creature position which is a static position plus the creature move offset
   */

  // Add the creature moving offset to the static position
  let staticPosition = this.getStaticScreenPosition(creature.getPosition());
  let creatureMoveOffset = creature.getMoveOffset();

  // Add the move offset to the static position
  return new Position(
    staticPosition.x - creatureMoveOffset.x,
    staticPosition.y - creatureMoveOffset.y
  );

}

Renderer.prototype.__increment = function() {

  /*
   * Function Renderer.__increment
   * Increments the renderer by a number of miliseconds
   */

  // Add a frame to the debugger
  this.debugger.__nFrames++;

  this.__nMiliseconds = (performance.now() - this.__start);

}

Renderer.prototype.__getFloorTilesTiles = function(floor) {

  /*
   * Function Renderer.__getFloorTilesTiles
   * Returns the tiles in the viewport sorted by distinctive layers
   */

  let tiles = new Array();

  // Go over all the loaded chunks
  gameClient.world.chunks.forEach(function(chunk) {

    // Aggregate all the visible tiles
    chunk.getFloorTiles(floor).forEach(function(tile) {

      // Can be skipped because the tile cannot be seen
      if(!gameClient.player.canSee(tile)) {
        return;
      }

      if(tile.id === 0 && tile.items.length === 0 && tile.neighbours.length === 1) {
        return;
      }

      // Add the tile to the cache
      tiles.push(tile);

    }, this);

  }, this);

  return tiles;

}

Renderer.prototype.__renderWorld = function() {

  /*
   * Function Renderer.__renderWorld
   * Renders the game world, tiles, and creatures per layer
   */

  // Clear the full game canvas
  this.screen.clear();

  // Render all of the cached tiles: only needs to be updated when the character moves
  this.getTileCache().forEach(this.__renderFloor, this);

  // If requested render the weather canvas
  if(gameClient.interface.settings.isWeatherEnabled()) {
    this.weatherCanvas.drawWeather();
  }

  // Finally draw the lightscreen to the canvas and reset it
  if(gameClient.interface.settings.isLightingEnabled()) {

    // Has lighting
    if(gameClient.player.hasCondition(ConditionManager.prototype.LIGHT)) {
      this.lightscreen.renderLightBubble(7, 5, 5, 23, true);
    } else {
      this.lightscreen.renderLightBubble(7, 5, 2, 23, true);
    }

    this.screen.context.drawImage(this.lightscreen.canvas, 0, 0);
    this.lightscreen.setup();

  }

}

Renderer.prototype.__renderFloor = function(tiles, index) {

  /*
   * Function Renderer.__renderFloor
   * Renders a single floor to the gamescreen
   */

  // Render all the tiles on the floor
  tiles.forEach(this.__renderFullTile, this);

  // Render the animations on this layer
  this.__animationLayers[index].forEach(function(animation) {
    this.__renderDistanceAnimation(animation, this.__animationLayers[index]);
  }, this);

}

Renderer.prototype.__renderFullTile = function(tile) {

  /*
   * Function Renderer.__renderFullTile
   * Renders a full tile in the proper order (tile -> objects -> animations)
   */

  // Three steps
  this.__renderTile(tile);
  this.__renderTileObjects(tile);
  this.__renderTileAnimations(tile);

}

Renderer.prototype.__renderDistanceAnimation = function(animation, thing) {

  /*
   * Function Renderer.__renderDistanceAnimation
   * Renders a distance animation on a tile
   */

  // If the animation has expirted
  if(animation.expired()) {
    thing.delete(animation);
  }

  let position = this.getStaticScreenPosition(animation.getPosition());

  this.screen.drawDistanceAnimation(animation, position);

}

Renderer.prototype.__renderAnimation = function(animation, thing) {

  /*
   * Function Renderer.__renderAnimation
   * Renders an animation to the screen
   */

  // If the animation has expirted
  if(animation.expired()) {
    thing.deleteAnimation(animation);
  }

  // There is a flag that identifies light coming from the tile
  if(!(animation instanceof BoxAnimation)) { 
    if(gameClient.interface.settings.isLightingEnabled() && animation.isLight()) {
      let position = this.getStaticScreenPosition(thing.getPosition());
      this.__renderLight(thing, position, animation, false);
    }
  } 

  // Determine the rendering position
  if(animation instanceof BoxAnimation) {
    this.screen.drawInnerCombatRect(animation, this.getCreatureScreenPosition(thing));
  } else if(thing instanceof Tile) {
    this.screen.drawSprite(animation, this.getStaticScreenPosition(thing.getPosition()), 32);
  } else if(thing instanceof Creature) {
    this.screen.drawSprite(animation, this.getCreatureScreenPosition(thing), 32);
  }

  this.screen.context.globalAlpha = 1;

}

Renderer.prototype.__renderTileAnimations = function(tile) {

  /*
   * Function Renderer.__renderTileAnimations
   * Renders the animations that are present on the tile
   */

  tile.__animations.forEach(function(animation) {
    this.__renderAnimation(animation, tile);
  }, this);

}

Renderer.prototype.__renderLightThing = function(position, thing, intensity) {

  /*
   * Function Renderer.__renderLightThing
   * Renders light buble for a particular tile or item
   */

  // Get the light information from the data object prototype
  let info = thing.getDataObject().properties.light;
  let phase = 0;
  let size = info.level + (0.2 * info.level) * Math.sin(phase + gameClient.renderer.debugger.__nFrames / (8 * 2 * Math.PI));

  // Delegate to the canvas to render a light bubble
  this.lightscreen.renderLightBubble(
    position.x,
    position.y,
    size,
    info.color,
    intensity
  );

}

Renderer.prototype.__renderLight = function(tile, position, thing, intensity) {

  /*
   * Function Renderer.__renderLight
   * Renders the light at a position
   */

  let floor = gameClient.world.getChunkFromWorldPosition(tile.getPosition()).getFirstFloorFromBottomProjected(tile.getPosition());
 
  // Confirm light is visible and should be rendered
  if(floor === null || floor >= gameClient.player.getMaxFloor()) {
    this.__renderLightThing(position, thing, intensity);
  }

}

Renderer.prototype.__renderTileObjects = function(tile) {

  /*
   * Function Renderer.__renderTileObjects
   * Renders all objects & creatures on a tile
   */

  let position = this.getStaticScreenPosition(tile.getPosition());

  // Reference the items to be rendered
  let items = tile.items;

  // Render the items on the tile
  items.forEach(function(item, i) {

    // Immediatelly skip objects with on-top property: these are rendered later
    if(item.hasFlag(PropBitFlag.prototype.flags.DatFlagOnTop)) {
      return;
    }

    // Should render item light?
    if(gameClient.interface.settings.isLightingEnabled() && item.isLight()) {
      this.__renderLight(tile, position, item);
    }

    // Handle the current elevation of the tile
    let renderPosition = new Position(
      position.x - tile.__renderElevation,
      position.y - tile.__renderElevation
    );

    // Draw the sprite at the right position
    this.screen.drawSprite(item, renderPosition, 32);

    if(item.isPickupable() && i === items.length - 1 && tile === gameClient.mouse.getCurrentTileHover()) {
      this.screen.drawSpriteOverlay(item, renderPosition, 32);
    }

    // Add the elevation of the item
    if(item.isElevation()) {
      tile.addElevation(item.getDataObject().properties.elevation);
    }

  }, this);

  // Render the entities on the tile
  tile.monsters.forEach(function(creature) {
    this.__renderCreature(tile, creature, false);
  }, this);

  // Render all the entities on this tile that were deferred
  this.__renderDeferred(tile);

  // Render the items that always belong on top (e.g., doors)
  this.__renderAlwaysOnTopItems(items, position);

}

Renderer.prototype.__renderAlwaysOnTopItems = function(items, position) {

  /*
   * Function Renderer.__renderAlwaysOnTopItems
   * Renders the items that are always on top of the other items
   */

  // Render all top items on the tile
  items.forEach(function(item) {

    // This is the flag that we need to look at
    if(!item.hasFlag(PropBitFlag.prototype.flags.DatFlagOnTop)) {
      return;
    }

    // Draw the sprite
    this.screen.drawSprite(item, position, 32);

  }, this);

}

Renderer.prototype.__renderTile = function(tile) {

  /*
   * Function Renderer.__renderTile
   * Rendering function for a particular tile
   */

  if(tile.id === 0) {
    return;
  }

  // Reset the elevation of the tile
  tile.setElevation(0);

  // Get the position of the tile on the gamescreen
  let position = this.getStaticScreenPosition(tile.getPosition());

  // There is a flag that identifies light coming from the tile
  if(gameClient.interface.settings.isLightingEnabled() && tile.isLight()) {
    this.__renderLight(tile, position, tile);
  }

  // Draw the sprite to the screen
  this.screen.drawSprite(tile, position, 64);

}

Renderer.prototype.__renderDeferred = function(tile) {

  /*
   * Function Renderer.__renderDeferred
   * Renders the deferred entities on the tile
   */

  if(tile.__deferredCreatures.size === 0) {
    return;
  }

  tile.__deferredCreatures.forEach(function(creature) {
    let tile = gameClient.world.getTileFromWorldPosition(creature.__position);
    this.__renderCreature(tile, creature, true);
  }, this);

  tile.__deferredCreatures.clear();

}

Renderer.prototype.__renderCreature = function(tile, creature, deferred) {

  /*
   * Function Renderer.__renderCreature
   * Render the available creatures to the screen
   */

  // If the creature is not visible in the gamescreen: skip rendering
  if(!gameClient.player.canSee(creature)) {
    return;
  }

  // Get the position of the creature
  let position = this.getCreatureScreenPosition(creature);

  let renderPosition = new Position(
    position.x - tile.__renderElevation,
    position.y - tile.__renderElevation
  );

  // Should the rendering of the creature be deferred to another tile
  if(this.__shouldDefer(tile, creature) && !deferred) {
    return this.__defer(tile, creature);
  }

  // Render top animations
  this.__renderCreatureAnimationsBelow(creature);

  // Render the target box around the creature
  if(gameClient.player.isCreatureTarget(creature)) {
    this.screen.drawOuterCombatRect(this.getCreatureScreenPosition(creature), Interface.prototype.COLORS.RED);
  }

  if(creature.hasCondition(ConditionManager.prototype.INVISIBLE)) {
    this.__renderAnimation(LoopedAnimation.prototype.MAGIC_BLUE, creature);
  } else {

    // Otherwise render the character to the screen
    this.screen.drawCharacter(creature, renderPosition, 32, 0.25);

  }

  creature.__renderElevation = 0;

  // Render top animations
  this.__renderCreatureAnimationsAbove(creature);

}

Renderer.prototype.__defer = function(tile, creature) {

  /*
   * Function Renderer.__defer
   * Defers rendering of a creature to a new tile
   */

  // Deferred rendering happens to the tile the player moved from
  let deferTile = this.__getDeferTile(tile, creature);

  // Make sure the tile exists and is not itself
  if(deferTile !== null) {
    deferTile.__deferredCreatures.add(creature);
  }

}

Renderer.prototype.__getDeferTile = function(tile, creature) {

  /*
   * Function Renderer.__getDeferTile
   * Get the tile we need to defer the rendering of the creature to
   */

  // Depends on the moving position
  if(creature.__lookDirection === Position.prototype.opcodes.NORTH_EAST) {
    return gameClient.world.getTileFromWorldPosition(creature.getPosition().south());
  } else if(creature.__lookDirection === Position.prototype.opcodes.SOUTH_WEST) {
    return gameClient.world.getTileFromWorldPosition(creature.getPosition().east());
  } else {
    return gameClient.world.getTileFromWorldPosition(creature.__previousPosition);
  }

}

Renderer.prototype.__shouldDefer = function(tile, creature) {

  /*
   * Function Renderer.__shouldDefer
   * Renders true if the drawing of a creature should be deferred to another tile
   */

  if(creature.__teleported) {
    return false;
  }

  if(!creature.isMoving()) {
    return false;
  }

  if(creature.getPosition().z !== creature.__previousPosition.z) {
    return false;
  }

  if((creature.__lookDirection === Position.prototype.opcodes.NORTH || creature.__lookDirection === Position.prototype.opcodes.WEST || creature.__lookDirection === Position.prototype.opcodes.NORTH_WEST)) {
    if(!creature.__previousPosition.equals(tile.getPosition())) {
      return true;
    }
  }

  if((creature.__lookDirection === Position.prototype.opcodes.NORTH_EAST)) {
    if(!creature.__previousPosition.equals(tile.getPosition().west())) {
      return true;
    }
  }

  if((creature.__lookDirection === Position.prototype.opcodes.SOUTH_WEST)) {
    if(!creature.__previousPosition.equals(tile.getPosition().north())) {
      return true;
    }
  }

  return false;

}

Renderer.prototype.__renderCreatureAnimationsAbove = function(creature) {

  /*
   * Function Renderer.__renderCreatureAnimationsAbove
   * Renders animations above the creature
   */

  creature.__animations.forEach(function(animation) {
    if(animation.constructor.name !== "BoxAnimation") {
      this.__renderAnimation(animation, creature);
    }
  }, this);

}

Renderer.prototype.__renderCreatureAnimationsBelow = function(creature) {

  /*
   * Function Renderer.__renderCreatureAnimationsBelow
   * Renders animations below the creature
   */

  creature.__animations.forEach(function(animation) {
    if(animation.constructor.name === "BoxAnimation") {
      this.__renderAnimation(animation, creature);
    }
  }, this);

}

Renderer.prototype.__renderOther = function() {

  /*
   * Function GameClient.__renderOther
   * Renders other information to the screen
   */

  // Render the equipment and modals if opened
  gameClient.player.equipment.render();
  gameClient.interface.modalManager.render();

  // Update opened containers
  this.__renderContainers();

  // This is the clock time
  gameClient.world.clock.updateClockDOM();

  // Update all active text elements
  gameClient.interface.screenElementManager.render();

  // The hotbar
  gameClient.interface.hotbarManager.render();

  // Update the statistics for the debugger
  this.debugger.renderStatistics();

}

Renderer.prototype.__renderContainers = function() {

  /*
   * Function Renderer.__renderContainers
   * Handles a tab-out event of the game window
   */

  gameClient.player.__openedContainers.forEach(container => container.__renderAnimated());

}

Renderer.prototype.__handleVisibiliyChange = function(event) {

  /*
   * Function Renderer.__handleVisibiliyChange
   * Handles a tab-out event of the game window
   */

  // Only when tabbing out
  if(!document.hidden) {
    return;
  }

  // Set the movement events of all creatures to null
  Object.values(gameClient.world.activeCreatures).forEach(function(creature) {
    creature.__movementEvent = null;
  });

}

Renderer.prototype.__drawCastbar = function(creature) {

  /*
   * Function Canvas.__drawCastbar
   * Draws a healthbar on top of the creature
   */

  // Get the player and monster offset 
  let position = this.getCreatureScreenPosition(creature);
  position.y += 6 / 32;
  let fraction = creature.getCastFraction();
  let color = "white";

  if(fraction === 1) {
    creature.endCast();
  }

  if(creature.__spell.channel !== null) {
    fraction = 1 - fraction;
  }

  // Render the health bar itself
  this.screen.drawBar(32, 4, position, fraction, color);

}

Renderer.prototype.__createAnimationLayers = function() {

  /*
   * Function Renderer.createAnimationLayers
   * Creates a set for all animations for a particular layer
   */

  this.__animationLayers = new Array();

  // Add sets
  for(let i = 0; i < 8; i++) {
    this.__animationLayers.push(new Set());
  }

}
