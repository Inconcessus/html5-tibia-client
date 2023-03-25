const Canvas = function(id, width, height) {

  /*
   * Class Canvas
   * Container for writing to a HTML5 canvas
   *
   * This is the class used for the main game screen and all additional smaller canvasses
   *
   */

  // Reference the passed canvas or identifier
  this.canvas = this.__reference(id);

  // Set the width and height of the canvas element
  this.canvas.width = width;
  this.canvas.height = height;

  // Reference the canvas context (2d), we do not use WebGL: this still uses the GPU is available
  this.context = this.canvas.getContext("2d");
  this.context.imageSmoothingEnabled = false;

}

Canvas.prototype.setScale = function(scale) {

  /*
   * Function Canvas.setScale
   * Updates the scale of the gamescreen canvas. The canvas is always drawn using 32x32 sprites and we upscale using CSS transforms with the GPU
   */

  this.canvas.style.transform = "scale(%s)".format(scale);

}

Canvas.prototype.renderText = function(text, x, y, color, font) {

  /*
   * Function Canvas.renderText
   * Renders text with a particular color to the canvas
   */

  // Set the font
  this.context.font = font;

  // Calculate the width
  let width = 0.5 * this.context.measureText(text).width;

  // Create an outline of the text by repeating
  this.context.fillStyle = "black";
  for(let i = -1; i < 2; i++) {
    for(let j = -1; j < 2; j++) {
      this.context.fillText(text, x + i - width, y + j);
    }
  }

  // Color and text
  this.context.fillStyle = color;
  this.context.fillText(text, x - width, y);

}

Canvas.prototype.getWorldCoordinates = function(event) {

  /*
   * Function Canvas.getWorldCoordinates
   * Returns the clicked canvas coordinates in world coordinates
   */

  // Where on the canvas the event happens
  let { x, y } =  this.getCanvasCoordinates(event);

  // The scaling that needs to be applied
  let scaling = gameClient.interface.getSpriteScaling();
  let position = gameClient.player.getPosition();

  // The chunk can easily be determined
  let projectedViewPosition = new Position(
    Math.floor(x / scaling) + position.x - 7,
    Math.floor(y / scaling) + position.y - 5,
    position.z
  );

  // Get the sector from the viewed position
  let chunk = gameClient.world.getChunkFromWorldPosition(projectedViewPosition);

  // Somehow we did not recover a chunk
  if(chunk === null) {
    return null;
  }

  // Now apply a correction to get the top tile of the stack
  return chunk.getFirstTileFromTop(projectedViewPosition.projected());

}

Canvas.prototype.getCanvasCoordinates = function(event) {

  /*
   * Function Canvas.getCanvasCoordinates
   * Returns the clicked canvas coordinates from 0, 0 to canvas width & height in pixels
   */

  // Calculate the relative coordinates
  let rect = this.canvas.getBoundingClientRect();

  let x = (event.clientX - rect.left);
  let y = (event.clientY - rect.top);

  return { x, y }

}

Canvas.prototype.black = function() {

  /*
   * Function Canvas.clear
   * Clears the canvas fully and transparently
   */

  // Set the fill style
  this.context.fillStyle = "black";

  this.context.fillRect(
    0, 0,
    this.canvas.width,
    this.canvas.height
  );

}

Canvas.prototype.clear = function() {

  /*
   * Function Canvas.clear
   * Clears the canvas fully and transparently
   */

  // Clear transparently
  this.context.clearRect(
    0, 0,
    this.canvas.width,
    this.canvas.height
  );

}

Canvas.prototype.applyFilter = function(filter) {

  /*
   * Function Canvas.applyFilter
   * Applies a post-processing filter to the rendered canvas
   */

  // Redraw the screen and set the filter back to nothing
  this.__setFilter(filter);
  this.context.drawImage(this.canvas, 0, 0);
  this.__setFilter("none");

}

Canvas.prototype.drawOuterCombatRect = function(position, color) {

  /*
   * Function Canvas.drawOuterCombatRect
   * Draws a 4 width targeting border around the creature
   */

  // Half offset width
  this.drawRect(
    32 * position.x + 0.5,
    32 * position.y + 0.5,
    30,
    color
  );

}

Canvas.prototype.drawInnerCombatRect = function(animation, position) {

  /*
   * Function Canvas.drawInnerCombatRect
   * Draws a 4 width being attacked border around the creature
   */

  this.drawRect(
    32 * position.x + 2.5,
    32 * position.y + 2.5,
    26,
    animation.color
  );

}

Canvas.prototype.drawRect = function(x, y, size, color) {

  /*
   * Function Canvas.drawRect
   * Wrapper function to draw a rectangle
   */

  // Start path and go
  this.context.beginPath();
  this.context.strokeStyle = Interface.prototype.getHexColor(color);
  this.context.lineWidth = 2;
  this.context.rect(x, y, size, size);
  this.context.stroke();

}

Canvas.prototype.drawCharacter = function(creature, position, size, offset) {

  /*
   * Function Canvas.drawCharacter
   * Renders a character to the screen
   */

  // Get the required character frame groups and frames
  let frames = creature.getCharacterFrames();

  // Somehow no frames could be found?
  if(frames === null) {
    return;
  }

  // xPattern is set as the facing direction of the creature
  let xPattern = creature.__lookDirection % 4;

  // zPattern is the flag for mounted
  let zPattern = (frames.characterGroup.pattern.z > 1 && creature.isMounted()) ? 1 : 0;

  // Delegate to the internal draw handler
  this.__drawCharacter(
    creature.spriteBuffer,
    creature.spriteBufferMount,
    creature.outfit,
    position,
    frames.characterGroup,
    frames.mountGroup,
    frames.characterFrame,
    frames.mountFrame,
    xPattern,
    zPattern,
    size,
    offset
   );

}

Canvas.prototype.drawDistanceAnimation = function(animation, position) {

  /*
   * Function Canvas.drawDitanceAnimation
   * Draws a projectile animation to the canvas
   */

  // Get the fraction
  let fraction = animation.getFraction();

  let renderPosition = new Position(
    position.x + fraction * (animation.toPosition.x - animation.fromPosition.x),
    position.y + fraction * (animation.toPosition.y - animation.fromPosition.y),
    0
  )

  // Should render light coming from the distance animation
  if(gameClient.interface.settings.isLightingEnabled() && animation.isLight()) {
    gameClient.renderer.__renderLightThing(renderPosition, animation);
  }

  // Draw sprite to the canvas
  return this.drawSprite(animation, renderPosition, 32);

}

Canvas.prototype.drawSprite = function(thing, position, size) {

  /*
   * Function Canvas.drawSprite
   * Draws a particular thing to the canvas: this function is called MANY times
   */

  // Things always have frame group none
  let frameGroup = thing.getFrameGroup(FrameGroup.prototype.NONE);

  // Get the frame and pattern of this thing
  let frame = thing.getFrame();
  let pattern = thing.getPattern();

  // Must handle big sprites: go over width and height
  for(let x = 0; x < frameGroup.width; x++) {
    for(let y = 0; y < frameGroup.height; y++) {
      for(let l = 0; l < frameGroup.layers; l++) {

        // Calculate the sprite index
        let index = frameGroup.getSpriteIndex(frame, pattern.x, pattern.y, pattern.z, l, x, y);
        
        // Draw the actual sprite
        this.__drawSprite(frameGroup.getSprite(index), position, x, y, size);
  
      }
    }
  }
  
}

Canvas.prototype.drawSpriteOverlay = function(thing, position, size) {

  /*
   * Function Canvas.drawSpriteOverlay
   * Draws the blurred overlay over a draggable thing
   */

  // Get the required information
  let frameGroup = thing.getFrameGroup(FrameGroup.prototype.GROUP_IDLE);
  let frame = thing.getFrame();
  let pattern = thing.getPattern();

  // Must handle big sprites
  for(let x = 0; x < frameGroup.width; x++) {
    for(let y = 0; y < frameGroup.height; y++) {
      for(let l = 0; l < frameGroup.layers; l++) {

        let index = frameGroup.getSpriteIndex(frame, pattern.x, pattern.y, pattern.z, l, x, y);

        gameClient.renderer.outlineCanvas.createOutline(frameGroup.sprites[index]);

        this.context.drawImage(
          gameClient.renderer.outlineCanvas.canvas,
          0, 0,
          33, 33,
          position.x * 32 - 1,
          position.y * 32 - 1,
          33, 33
        );
  
      }
    }
  }
  
}

Canvas.prototype.__setFilter = function(filter) {

  /*
   * Function Canvas.__setFilter
   * Sets an SVG filter for the canvas
   */

  switch(filter) {
    case "matrix": return this.context.filter = "url(#matrix)";
    case "greyscale": return this.context.filter = "grayscale()";
    case "hue": return this.context.filter = "hue-rotate(" + (gameClient.getFrame() % 360) + "deg)";
    case "invert": return this.context.filter = "invert()";
    case "sepia": return this.context.filter = "sepia()";
    case "blur": return this.context.filter = "blur(4px)";
    case "saturate": return this.context.filter = "saturate(20%)";
    case "none": return this.context.filter = "none";
  }

}

Canvas.prototype.__drawSprite = function(sprite, position, x, y, size) {

  /*
   * Function Canvas.__drawSprite
   * Internal function to draw a sprite to the game screen
   */

  // Stop on remaining null pointers
  if(sprite === null) {
    return;
  }

  // Increment the drawcall number
  gameClient.renderer.drawCalls++;

  // Draw the sprite to the screen from the spritebuffer
  this.context.drawImage(
    sprite.src,
    32 * sprite.position.x,
    32 * sprite.position.y,
    32, 32,
    Math.round(32 * (position.x - x)),
    Math.round(32 * (position.y - y)),
    32, 32
  );

}

Canvas.prototype.__drawCharacter = function(spriteBuffer, spriteBufferMount, outfit, position, characterGroup, mountGroup, characterFrame, mountFrame, xPattern, zPattern, size, offset) {

  /*
   * Function Canvas.__drawCharacter
   * Internal function to render a character to the screen
   *
   * Outfits are composed and cached on a sprite buffer that is attached to the character
   * each outfit may be composed of a mount and three layers (base, addon one, addon two), including
   * a color mask for each
   */

  // We have to offset characters of size 64 by 16 pixels
  position = new Position(position.x - offset, position.y - offset);

  // Go over the width and height of the sprite
  for(let x = 0; x < characterGroup.width; x++) {
    for(let y = 0; y < characterGroup.height; y++) {

      // Get the base identifier for the outfit (yPattern = 0)
      let baseIdentifier = characterGroup.getSpriteId(characterFrame, xPattern, 0, zPattern, 0, x, y);

      // No customizable outfit: just draw the outfit as is (i.e., normal monsters) and proceed
      if(!outfit.hasLookDetails()) {
        this.__drawSprite(spriteBuffer.get(baseIdentifier), position, x, y, size);
        continue;
      }

      // Try to get an identifier that is not zero from all layers.. maybe try the addons?
      // The addons are stored in the yPattern parameter
      if(baseIdentifier === 0 && outfit.addonOne) {
        baseIdentifier = characterGroup.getSpriteId(characterFrame, xPattern, 1, zPattern, 0, x, y);
      }

      if(baseIdentifier === 0 && outfit.addonTwo) {
        baseIdentifier = characterGroup.getSpriteId(characterFrame, xPattern, 2, zPattern, 0, x, y);
      }

      // Nothing found: stop trying here
      if(baseIdentifier === 0) {
        continue;
      }

      // If the sprite is not in the buffer lets compose and add it to the spritebuffer
      if(!spriteBuffer.has(baseIdentifier)) {
        spriteBuffer.addComposedOutfit(baseIdentifier, outfit, characterGroup, characterFrame, xPattern, zPattern, x, y);
      }

      // The mount is enabled and available. Add the mount that is cached to a different canvas
      if(zPattern === 1 && mountGroup) {
        let mountSprite = mountGroup.getSpriteId(mountFrame, xPattern, 0, 0, 0, x, y);
        this.__drawSprite(spriteBufferMount.get(mountSprite), position, x, y, size);
      }

      // Draw the sprite from the spritebuffer to the game screen
      this.__drawSprite(spriteBuffer.get(baseIdentifier), position, x, y, size);

    }

  }

}

Canvas.prototype.__reference = function(id) {

  /*
   * Function Canvas.__reference
   * References a new or existing canvas
   */

  // Create an offscreen canvas or find the one existing in the DOM from string, or use a passed canvas
  if(id === null) {
    return document.createElement("canvas");
  }

  // If the passed identifier is a string: read it from the DOM
  if(typeof id === "string") {
    return document.getElementById(id);
  }

  return id;

}
