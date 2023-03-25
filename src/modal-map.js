const MapModal = function(element) {

  /*
   * Class MapModal
   * Wrapper for the world map modal that shows the world map
   */

  // Inherit from modal
  Modal.call(this, element);

  // Current center of the map
  this.canvas = new Canvas("map-modal-canvas", 256, 256);
  this.span = document.querySelector(".map-modal-wrapper > span");

  // Attach listeners to be able to scroll the map
  this.canvas.canvas.addEventListener("mousedown", this.__attachMove.bind(this));
  this.canvas.canvas.addEventListener("wheel", this.__handleScroll.bind(this));
  document.addEventListener("mouseup", this.__removeMove.bind(this));

  this.__center = Position.prototype.NULL;
  this.__mouseDownPosition = Position.prototype.NULL;
  this.__boundMoveCallback = this.__handleMove.bind(this);
  this.__zoomLevel = 0;

}

MapModal.prototype = Object.create(Modal.prototype);
MapModal.constructor = MapModal;

MapModal.prototype.__removeMove = function() {

  /*
   * Function MapModal.__removeMove
   * Removes movement listener from the canvas
   */

  this.canvas.canvas.removeEventListener("mousemove", this.__boundMoveCallback);

}

MapModal.prototype.__handleScroll = function(event) {

  /*
   * Function MapModal.__handleScroll
   * Scrolls the minimap with the scroll wheel
   */

  // Check the direction of the scrollwheel
  if(event.deltaY < 0) {
    this.__changeZoomLevel(1);
  } else {
    this.__changeZoomLevel(-1);
  }

}

MapModal.prototype.__changeZoomLevel = function(value) {

  /*
   * Function GameClient.changeZoomLevel
   * Changes the state of the zoom level (clamped between 0 & 4) and renders the minimap
   */

  this.__zoomLevel += value;
  this.__zoomLevel = Math.min(Math.max(0, this.__zoomLevel), 4);

  this.draw();

}

MapModal.prototype.__attachMove = function(event) {

  /*
   * Function MapModal.__attachMove
   * Attaches movement listener to the canvas
   */

  this.__mouseDownPosition = this.canvas.getCanvasCoordinates(event);

  this.canvas.canvas.addEventListener("mousemove", this.__boundMoveCallback);

}

MapModal.prototype.__handleMove = function(event) {

  /*
   * Function MapModal.__handleMove
   * Callback fired when the mouse is moved to update the world map position
   */

  let { x, y } = this.canvas.getCanvasCoordinates(event);	

  let position = new Position(this.__mouseDownPosition.x - x, this.__mouseDownPosition.y - y, 0);

  // Handle zoom level
  position.x = Math.round(position.x * (1 / (this.__zoomLevel + 1)));
  position.y = Math.round(position.y * (1 / (this.__zoomLevel + 1)));

  // Update the offset
  this.__center = this.__center.add(position);

  // Update this position too
  this.__mouseDownPosition = this.canvas.getCanvasCoordinates(event);

  this.draw();

}

MapModal.prototype.handleOpen = function() {

  /*
   * Function MapModal.handleOpen
   * Callback fired when the world map is opened
   */

  // Update the offset
  this.__center = gameClient.player.getPosition().copy();

  this.draw();

}

MapModal.prototype.draw = function() {

  /*
   * Function MapModal.draw
   * Draws the world map at the requested position
   */

  // Add position to the span
  this.span.innerHTML = this.__center.toString();
 
  let position = this.__center;

  // Collect the number of chunks to be rendered (5x5 around player)
  let chunkPositions = new Array();

  // Fetch the chunks around the player
  for(let x = -2; x <= 2; x++) {
    for(let y = -2; y <= 2; y++) {
      chunkPositions.push(new Position(position.x - x * 128, position.y - y * 128, position.z));
    }
  }

  this.canvas.clear();

  // Load all the visible chunks from the database
  gameClient.database.preloadCallback(chunkPositions, function(chunks) {

    Object.entries(chunks).forEach(function([ id, chunk ]) {

      let [x, y, z] = id.split(".").map(Number);
      
      // And paste it at the right position on the minimap canvas
      this.canvas.context.putImageData(
        chunk.imageData,
        x * 128 - position.x + 128,
        y * 128 - position.y + 128
      );

    }, this);

  }.bind(this));

  this.canvas.context.globalCompositeOperation = "copy";

  // Handle zooming
  for(let i = 0; i < this.__zoomLevel; i++) {
    this.canvas.context.drawImage(this.canvas.canvas, 0, 0, 256, 256, -128, -128, 512, 512);
  }

  let pos = gameClient.player.getPosition();

  gameClient.database.dropWorldMapChunks(this.__center);

}