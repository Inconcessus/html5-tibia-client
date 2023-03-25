const GameLoop = function(frameCallback) {

  /*
   * Class GameLoop
   * Wrapper for the game loop that executes as fast as possible allowed by the client
   *
   * API:
   *
   * GameLoop.isRunning() - returns true if the game loop is running
   * GameLoop.init() - initializes the game loop
   * GameLoop.abort() - aborts the game loop
   *
   */

  // Callback fired every frame
  this.__frameCallback = frameCallback;

  // State
  this.__running = false;
  this.__aborted = false;
  this.__initialized = null;

}

GameLoop.prototype.isRunning = function() {

  /*
   * Function GameLoop.isRunning
   * Returns true if the game loop is running
   */

  return this.__running;

}

GameLoop.prototype.init = function() {

  /*
   * Function GameLoop.init
   * Initializes the game loop
   */

  // Already running
  if(this.isRunning()) {
    return;
  }

  this.__initialized = performance.now();

  // Set state and begin the loop
  this.__aborted = false;
  this.__running = true;

  this.__loop();

}

GameLoop.prototype.abort = function() {

  /*
   * Function GameLoop.abort
   * Aborts the currently running gameloop
   */

  this.__aborted = true;
  this.__running = false;

}

GameLoop.prototype.__loop = function() {

  /*
   * Function GameClient.__loop
   * Main body of the internal game loop
   */

  // The internal loop was aborted: stop running
  if(this.__aborted) {
    return;
  }

  // Execute the configured callback with delta since last frame and update the frame end
  this.__frameCallback();

  // Schedule the next draw as soon as possible (targeted at 60 FPS)
  requestAnimationFrame(this.__loop.bind(this));

}
