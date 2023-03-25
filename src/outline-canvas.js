const OutlineCanvas = function(id, width, height) {

  /*
   * Class OutlineCanvas
   * Container for the canvas used to draw item outlines
   */

  Canvas.call(this, id, width, height);

  this.context.fillStyle = "white";
  this.__currentIdentifier = 0;

}

OutlineCanvas.prototype = Object.create(Canvas.prototype);
OutlineCanvas.constructor = OutlineCanvas;

Canvas.prototype.createOutline = function(spriteIdentifier) {

  /*
   * Function OutlineCanvas.createOutline
   * Creates the outline
   */

  // Null pointer or current identifier no need to redraw: save some cycles
  if(spriteIdentifier === 0 || spriteIdentifier === this.__currentIdentifier) {
    return;
  }

  // Update the current sprite (cache)
  this.__currentIdentifier = spriteIdentifier;

  // Clear the canvas
  this.context.globalCompositeOperation = "source-over";
  this.clear();

  let position = gameClient.spriteBuffer.getSpritePosition(spriteIdentifier);

  this.context.filter = "blur(2px)";
  this.drawOutlineSprite(position);
  this.context.filter = "none";

  // Use the sprite as a mask to fill with white fill color
  this.context.globalCompositeOperation = "source-in";
  this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

  // Cut out the sprite itself
  this.context.globalCompositeOperation = "destination-out";
  this.drawOutlineSprite(position);

}

Canvas.prototype.drawOutlineSprite = function(position) {

  /*
   * Function OutlineCanvas.drawOutlineSprite
   * Pulls the correct sprite from the sprite buffer and draws it to the outline canvas
   */

  this.context.drawImage(
    gameClient.spriteBuffer.__spriteBufferCanvas.canvas,
    position.x * 32,
    position.y * 32,
    32, 32,
    1, 1,
    32, 32
  );

}