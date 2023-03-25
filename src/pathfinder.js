const Pathfinder = function() {

  /*
   * Class Pathfinder
   * Container for client-side pathfinding code inside the screen
   */

  // Cache to keep the tiles to walk on
  this.__pathfindCache = new Array();
  this.__dirtyNodes = new Array();

}

Pathfinder.prototype.search = function(from, to) {

  /*
   * Function Pathfinder.search
   * Does client side pathfinding
   */

  this.__dirtyNodes.forEach(node => node.cleanPathfinding());
  this.__dirtyNodes = new Array(from);

  from.__h = this.heuristic(from, to);

  let openHeap = new BinaryHeap();

  openHeap.push(from);

  while(openHeap.size() > 0) {

    // Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
    let currentNode = openHeap.pop();

    // End case -- result has been found, return the traced path.
    if(currentNode === to) {
      return this.pathTo(currentNode);
    }

    // Normal case -- move currentNode from open to closed, process each of its neighbors.
    currentNode.__closed = true;

    for(let i = 0; i < currentNode.neighbours.length; i++) {

      let neighbourNode = currentNode.neighbours[i];

      // Not a valid node to process, skip to next neighbor.
      if(neighbourNode.__closed || neighbourNode.isOccupied()) {
        continue;
      }

      // Add a penalty to diagonal movement (only done when absolutely necessary)
      let penalty = currentNode.__position.isDiagonal(neighbourNode.__position) ? 2 * Math.SQRT2 : 1;

      // Add the cost of the current node
      let gScore = currentNode.__g + penalty * neighbourNode.getCost(currentNode);
      let visited = neighbourNode.__visited;

      if(!visited || gScore < neighbourNode.__g) {

        // Found an optimal (so far) path to this node.  Take score for node to see how good it is.
        neighbourNode.__visited = true;
        neighbourNode.__parent = currentNode;
        neighbourNode.__h = neighbourNode.__h || this.heuristic(neighbourNode, to);
        neighbourNode.__g = gScore;
        neighbourNode.__f = neighbourNode.__g + neighbourNode.__h;

        this.__dirtyNodes.push(neighbourNode);

        if(!visited) {
          openHeap.push(neighbourNode);
        } else {
          openHeap.rescoreElement(neighbourNode);
        }

      }

    }

  }

  // No result was found - empty array signifies failure to find path.
  return new Array();

}

Pathfinder.prototype.heuristic = function(from, to) {

  /*
   * Function Pathfinder.heuristic
   * Manhattan heuristic for pathfinding
   */

  return Math.abs(from.__position.x - to.__position.x) + 
         Math.abs(from.__position.y - to.__position.y);

}

Pathfinder.prototype.pathTo = function(tile) {

  /*
   * Function Pathfinder.pathTo
   * Walks up the parent chain to find the recovered path
   */

  let path = new Array();

  while(tile.__parent) {
    path.unshift(tile);
    tile = tile.__parent;
  }

  return path;

}

Pathfinder.prototype.findPath = function(begin, stop) {

  /*
   * Function Pathfinder.findPath
   * Does client-side pathfinding
   */

  let start = gameClient.world.getTileFromWorldPosition(begin);
  let end = gameClient.world.getTileFromWorldPosition(stop);

  let path = this.search(start, end);

  if(path.length === 0) {
    return gameClient.interface.setCancelMessage("There is no way.");
  }

  // Determine the relative movement sequence to take
  path = path.map(function(node) {
    
    let tmp = start.__position.getLookDirection(node.__position);
    start = node;
    return tmp;

  });
 
  this.setPathfindCache(path);

}

Pathfinder.prototype.setPathfindCache = function(path) {

  /*
   * Function Pathfinder.setPathfindCache
   * Updates the pathfinding cache with a new path or nothing
   */

  if(path === null) {
    return this.__pathfindCache = new Array();
  }

  this.__pathfindCache = path;
  this.handlePathfind();

}

Pathfinder.prototype.getNextMove = function() {

  /*
   * Function Pathfinder.getNextMove
   * Returns the next pathfinding move
   */

  if(this.__pathfindCache.length === 0) {
    return null;
  }

  return this.__pathfindCache.shift();

}

Pathfinder.prototype.handlePathfind = function() {

  /*
   * Function Pathfinder.handlePathfind
   * Handles the next pathfinding action
   */

  // Delegate..
  switch(this.getNextMove()) {
    case Position.prototype.opcodes.NORTH: return gameClient.keyboard.handleCharacterMovement(Keyboard.prototype.KEYS.UP_ARROW);
    case Position.prototype.opcodes.EAST: return gameClient.keyboard.handleCharacterMovement(Keyboard.prototype.KEYS.RIGHT_ARROW);
    case Position.prototype.opcodes.SOUTH: return gameClient.keyboard.handleCharacterMovement(Keyboard.prototype.KEYS.DOWN_ARROW);
    case Position.prototype.opcodes.WEST: return gameClient.keyboard.handleCharacterMovement(Keyboard.prototype.KEYS.LEFT_ARROW);
    case Position.prototype.opcodes.NORTH_EAST: return gameClient.keyboard.handleCharacterMovement(Keyboard.prototype.KEYS.KEYPAD_9);
    case Position.prototype.opcodes.SOUTH_EAST: return gameClient.keyboard.handleCharacterMovement(Keyboard.prototype.KEYS.KEYPAD_3);
    case Position.prototype.opcodes.SOUTH_WEST: return gameClient.keyboard.handleCharacterMovement(Keyboard.prototype.KEYS.KEYPAD_1);
    case Position.prototype.opcodes.NORTH_WEST: return gameClient.keyboard.handleCharacterMovement(Keyboard.prototype.KEYS.KEYPAD_7);
    default: return;
  }

}