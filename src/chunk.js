const Chunk = function(id, position, tiles) {

  /*
   * Class Chunk
   * Container for chunk that is the parent of a group of tiles
   *
   * API:
   *
   * @besides(chunk) - returns true if this chunk is besides another chunk
   * @getFloorTiles(floor) - returns an array slice of the full floor of the sector (size WIDTH * HEIGHT)
   * @getTileFromWorldPosition(position) - returns an array slice of the full floor of the sector (size WIDTH * HEIGHT)
   * @getFirstTileFromTop(position) - returns the first tile starting from the top
   * @getFirstFloorFromBottom(position) - returns the first visible floor starting from the bottom
   *
   */

  // Set parameters of the chunk
  this.id = id;
  this.position = position;

  // Make sure to add references to the tiles too
  this.tiles = this.__update(tiles);

}

Chunk.prototype.besides = function(chunk) {

  /*
   * Function Chunk.besides
   * Returns true if the chunk is besides another chunk
   */

  return this.position.besides(chunk.position);

}

Chunk.prototype.getNumberTiles = function() {

  /*
   * Function Chunk.getNumberTiles
   * Returns the total number of tiles in a chunk
   */

  // These values are set by the server
  return Chunk.prototype.WIDTH * Chunk.prototype.HEIGHT * Chunk.prototype.DEPTH;

}

Chunk.prototype.getFloorTiles = function(floor) {

  /*
   * Function Chunk.getFloorTiles
   * Returns the slice of tiles for a particular layer (8x8)
   */

  // Chunks are truncated to a number of floors
  let index = floor % this.DEPTH;

  // Return the correct slice
  let min = Chunk.prototype.WIDTH * Chunk.prototype.HEIGHT * (index + 0);
  let max = Chunk.prototype.WIDTH * Chunk.prototype.HEIGHT * (index + 1);

  // Tiles are indexed properly so we can simply return a sliced reference
  return this.tiles.slice(min, max);

}

Chunk.prototype.getTileFromWorldPosition = function(position) {

  /*
   * Function Chunk.getTileFromWorldPosition
   * Returns a tile from a true world position (x, y, z)
   */

  return this.__getTileFromWorldPosition(position.projected());

}

Chunk.prototype.getFirstTileFromTop = function(position) {

  /*
   * Function Chunk.getFirstTileFromTop
   * Returns the top tile from an (x, y) screen position using when looking/throwing
   */

  // Must not look above the player
  let maximum = Math.max(0, gameClient.player.getMaxFloor() - 1);
  let minimum = 0;

  // Go down all floors to find the first encountered tile
  for(let z = maximum; z >= minimum; z--) {

    let tile = this.__getTileFromWorldPosition(new Position(position.x, position.y, z));

    // Discovered a tile: return it
    if(tile.id !== 0 || tile.items.length > 0) {
      return tile;
    }

  }

  return null;

}

Chunk.prototype.getFirstFloorFromBottomProjected = function(position) {

  // Start one above the position
  let minimum = (position.z % Chunk.prototype.DEPTH) + 1;

  // The maximum is of course the minimum + 7 but never more than 8!
  let maximum = Math.max(minimum, Chunk.prototype.DEPTH);

  // Go over all the upper floors and check if occupied
  for(let z = 1; z <= maximum - minimum; z++) {

    // Project the tile position
    let tilePosition = position;
    
    // Get the sector tile
    let tile = gameClient.world.getTileFromWorldPosition(new Position(tilePosition.x + z, tilePosition.y + z, tilePosition.z + z));
    
    if(tile === null) {
      continue;
    }
    
    // A tile exist above the player: stop looking except for when transparent (e.g., stairs)
    if(tile.id !== 0 && !tile.isTranslucent()) {
      return (tilePosition.z + z) % 8;
    }

  }

  // Can see everything
  return Chunk.prototype.DEPTH;

}

Chunk.prototype.getFirstFloorFromBottom = function(position) {

  /*
   * Function Chunk.getFirstFloorFromBottom
   * Returns the first tile looking from the bottom user for determining the maximum render layer
   */

  let positions = new Array(
    position,
    position.north(),
    position.west(),
  );

  // Start one above the position
  let minimum = (position.z % Chunk.prototype.DEPTH) + 1;

  // The maximum is of course the minimum + 7 but never more than 8!
  let maximum = Math.max(minimum, Chunk.prototype.DEPTH);

  // Go over all the upper floors and check if occupied
  for(let z = 1; z <= maximum - minimum; z++) {

    for(let i = 0; i < positions.length; i++) {

      // Project the tile position
      let tilePosition = positions[i];

      // Get the sector tile
      let tile = gameClient.world.getTileFromWorldPosition(new Position(tilePosition.x + z, tilePosition.y + z, tilePosition.z + z));

      if(tile === null) {
        continue;
      }

      // A tile exist above the player: stop looking except for when transparent (e.g., stairs)
      if((tile.id !== 0 && !tile.isTranslucent()) || tile.items.length > 0) {
        return (tilePosition.z + z) % 8;
      }

    }

  }

  // Can see everything
  return Chunk.prototype.DEPTH;

}

Chunk.prototype.__update = function(tiles) {

  /*
   * Function Chunk.__update
   * Updates the sector with the incoming definition of server tiles
   */

  // Chunk to world position
  let worldPosition = this.__getWorldPosition();
 
  // Refactor
  return tiles.map(function(tile, i) {

    // Add relative tile position within the chunk
    let relativeTilePosition = this.__getPositionFromIndex(i);

    // For the true world position we need to add the sector position and project the vertical back
    let tileWorldPosition = worldPosition.add(relativeTilePosition.unprojected());

    // Create a new tile with the tile identifier and position
    return new Tile(tile, tileWorldPosition);

  }, this);

}

Chunk.prototype.__getTileFromIndex = function(index) {

  /*
   * Function Sector.__getTileFromIndex
   * Returns the tile from a given index (if valid)
   */

  if(index < 0 || index >= this.tiles.length) {
    return null;
  }

  // Return at the requested index
  return this.tiles[index];

}

Chunk.prototype.__getTileFromWorldPosition = function(worldPosition) {

  /*
   * Function Sector.__getTileFromWorldPosition
   * Returns the tile of a given sector on position x, y, z
   */

  // No tiles in the chunk
  if(this.tiles === null) {
    return null;
  }

  return this.__getTileFromIndex(this.__getTileIndex(worldPosition));

}

Chunk.prototype.__getWorldPosition = function() {

  /*
   * Function Chunk.__getWorldPosition
   * Returns the world position for the corner of the chunk. Inside tiles can be referenced relative to this point
   */

  return new Position(
    Chunk.prototype.WIDTH * this.position.x,
    Chunk.prototype.HEIGHT * this.position.y,
    Chunk.prototype.DEPTH * this.position.z
  );

}

Chunk.prototype.__getPositionFromIndex = function(index) {

  /*
   * Function Chunk.__getPositionFromIndex
   * Returns the position of a tile in the chunk from 0 to N
   */

  // Problem somehow
  if(index < 0 || index >= Chunk.prototype.WIDTH * Chunk.prototype.HEIGHT * Chunk.prototype.DEPTH) {
    throw("Could not map chunk index to world position.");
  }

  // Determine the x, y, z coordinate of the tile based on the tile index (mod size)
  let x = index % Chunk.prototype.WIDTH;
  let y = ((index / Chunk.prototype.WIDTH) % Chunk.prototype.HEIGHT) | 0;
  let z = (index / (Chunk.prototype.WIDTH * Chunk.prototype.HEIGHT)) | 0;

  return new Position(x, y, z);

}

Chunk.prototype.__getTileIndex = function(worldPosition) {

  /*
   * Function Sector.__getTileIndex
   * Returns the index tile of a tile given a world position
   */

  return (worldPosition.x % Chunk.prototype.WIDTH) + 
         (worldPosition.y % Chunk.prototype.HEIGHT * Chunk.prototype.WIDTH) +
         (worldPosition.z % Chunk.prototype.DEPTH * Chunk.prototype.WIDTH * Chunk.prototype.HEIGHT);

}
