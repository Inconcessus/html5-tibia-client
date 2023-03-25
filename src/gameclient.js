const GameClient = function() {

  /*
   * Class GameClient
   * Main container for the HTML5 ForbyJS Game Client
   *
   * API:
   *
   * Function reset - resets the gameclient for a new connection
   * Function connect(host, port) - Connects the gameclient to a remote gameserver
   * Function disconnect() - Disconnects from the game server
   * Function send() - Writes a packet to the gameserver
   * Function isSelf(creature) - Returns true if the passed creature is the player
   * Function setServerData(packet) - Sets important server data to the client (e.g., world size & tick interval)
   * Function getTickInterval() - Returns the configured tick interval
   *
   */

  // These are the required gameclient resources: sprites and data files that need to be selected by the user
  this.spriteBuffer = new SpriteBuffer(32);
  this.dataObjects = new ObjectBuffer();

  // Create a keyboard and mouse input handlers
  this.keyboard = new Keyboard();
  this.mouse = new Mouse();

  // Create a networking interface for communication with the server
  this.networkManager = new NetworkManager();

  // Class for the graphical user interface
  this.interface = new Interface();

  // This is the event scheduler that handles all scheduled events
  this.eventQueue = new EventQueue();

  // Create the gameloop with a callback function that is executed every frame
  this.gameLoop = new GameLoop(this.__loop.bind(this));

  // A reference to the player itself: null before login
  this.player = null;

  // The database that stores the minimap and game files
  this.database = new Database();

  // Set some state
  this.__tickInterval = 0;
  this.serverVersion = null;

  //
  document.getElementById("client-version").innerHTML = CLIENT_VERSION;

}

GameClient.prototype.setServerData = function(packet) {

  /*
   * Function GameClient.handleConnect
   * Handles event when connected to the gameserver
   */

  // The server suggested client version must match the local version
  if(packet.clientVersion !== this.spriteBuffer.__version || packet.clientVersion !== this.dataObjects.__version) {
    return gameClient.interface.modalManager.open("floater-connecting", "Server client version and local data client version do not match.");
  }

  // Enables features for specific versions
  this.interface.enableVersionFeatures(packet.clientVersion);

  // Update the clock speed
  Clock.prototype.CLOCK_SPEED = packet.clock;
  
  // Update the client & server version
  this.__setServerVersion(packet.version);
  this.__setClientVersion(packet.clientVersion);

  // Update the chunk properties
  Chunk.prototype.WIDTH = packet.chunk.width;
  Chunk.prototype.HEIGHT = packet.chunk.height;
  Chunk.prototype.DEPTH = packet.chunk.depth;

  // Create the game world based on the passed properties
  this.world = new World(packet.width, packet.height, packet.depth);

  // Create the renderer responsible for drawing the game screen
  this.renderer = new Renderer();

  // Set the number of miliseconds tick for the gameserver
  this.__setTickInterval(packet.tick);

  document.getElementById("anti-aliasing").dispatchEvent(new Event('change'));

}

GameClient.prototype.getFrame = function() {

  /*
   * Function GameClient.getFrame
   * Returns the current frame of the game client (always incremented)
   */

  return this.renderer.debugger.__nFrames;

}

GameClient.prototype.isRunning = function() {

  /*
   * Function GameClient.isRunning
   * Returns true is the game loop is running
   */

  return this.gameLoop.isRunning();

}

GameClient.prototype.getTickInterval = function() {

  /*
   * Function GameClient.getTickInterval
   * Returns the set tick interval
   */

  return this.__tickInterval;

}

GameClient.prototype.setErrorModal = function(message) {

  /*
   * Function GameClient.setErrorModal
   * Function to reset the gameclient to the initial state ready for another server connection
   */

  this.interface.modalManager.open("floater-connecting", message);

}

GameClient.prototype.reset = function() {

  /*
   * Function GameClient.reset
   * Function to reset the gameclient to the initial state ready for another server connection
   */

  // Save settings
  this.renderer.minimap.save();
  this.interface.settings.saveState();

  // Abort the gameloop
  this.gameLoop.abort();

  // Clear the screen
  this.renderer.screen.clear();

  if(gameClient.player) {
  // Close all references to contains
    this.player.closeAllContainers();
    gameClient.player = null;
  }

  // Close all windows
  this.interface.reset();

}

GameClient.prototype.connect = function(host, port) {

  /*
   * Function GameClient.connect
   * Delegates to the network manager to connect to the gameserver at host & port
   */

  if(this.networkManager.isConnected()) {
    return;
  }

  this.networkManager.connect(host, port);

}

GameClient.prototype.disconnect = function() {

  /*
   * Function GameClient.disconnect
   * Delegates to the network manager to disconnect the gameclient from the gameserver
   */

  this.networkManager.close();
  
}

GameClient.prototype.send = function(buffer) {

  /*
   * Public Function GameClient.send
   * Wrapping function to write a buffer to the network interface
   */

  this.networkManager.send(buffer);

}

GameClient.prototype.isSelf = function(creature) {

  /*
   * Function GameClient.isSelf
   * Returns true if the passed creature is the player
   */

  return this.player === creature;

}

GameClient.prototype.handleAcceptLogin = function(packet) {

  /*
   * Function GameClient.handleAcceptLogin
   * Handles incoming login registration: start the game client
   */

  // Show the game interface instead of the login box and close remaining modals
  this.interface.showGameInterface();
  this.interface.modalManager.close();

  // Create a new player with a particular server identifier
  this.player = new Player(packet);

  // Add the player to the game world
  this.world.createCreature(packet.id, this.player);
  this.renderer.updateTileCache();
  this.player.setAmbientSound();
  this.renderer.minimap.setRenderLayer(this.player.getPosition().z);

  // This triggers the start of the game loop
  this.gameLoop.init();

  // Load the configuration


}

GameClient.prototype.isConnected = function() {

  return this.networkManager.isConnected();

}

GameClient.prototype.hasExtendedAnimations = function(id) {

  /*
   * Function GameClient.hasExtendedAnimations
   * Returns true if the data object has extended animations
   */

  return this.dataObjects.__version >= 1050;
	
}

GameClient.prototype.__writeAccountInformation = function(event) {

  /*
   * Function GameClient.__writeAccountInformation
   * Sends account and password to the server
   */

  // Read the account and password from the DOM
  let { account, password } = this.interface.getAccountDetails();

  // Not filled in
  if(account === "" || password === "") {
    this.networkManager.close();
    return gameClient.interface.modalManager.open("floater-connecting", "nope.");
  }

  // Write account details to the server
  this.send(new PacketWriter(PacketWriter.prototype.opcodes.REQUEST_LOGIN).writeLogin(account, password));

}

GameClient.prototype.__setServerVersion = function(version) {


  /*
   * Function GameClient.__setServerVersion
   * Sets the server version to the passed value
   */

  this.serverVersion = version;

}

GameClient.prototype.__setClientVersion = function(version) {


  /*
   * Function GameClient.__setServerVersion
   * Sets the server version to the passed value
   */

  this.clientVersion = version;

}

GameClient.prototype.__setTickInterval = function(tick) {

  /*
   * Function GameClient.__setTickInterval
   * Sets the gameserver tick interval which is used to synchronize server and client events
   */

  this.__tickInterval = tick;

}

GameClient.prototype.__loop = function() {

  /*
   * Function GameClient.__loop
   * Main body of the internal game loop
   */

  // Increment the frame counter and execute all scheduled events
  this.eventQueue.tick();

  // Increment sound as well
  this.interface.soundManager.tick();

  // Read the keyboard input
  this.keyboard.handleInput();
 
  // Request to render the frame
  this.renderer.render();

}
