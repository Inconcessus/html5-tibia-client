const Debugger = function() {

  /*
   * Class Debugger
   * Container for debugging information visible when pressing F8
   *
   * API:
   *
   * @Debugger.renderStatistics - renders the statistics to the screen
   * @Debugger.toggleStatistics - toggles visibility of statistics on/off
   * @Debugger.UPDATE_INTERVAL - constant that determines how often the statistics are updated (unit is frames)
   *
   */

   // Debugger state
  this.__showStatistics = false;
  this.__nFrames = 0;
  this.__averageFPS = 0;
  this.__averageEvictions = 0;
  this.__averageDrawCalls = 0;
  this.__nSeconds = performance.now();

  // Information on the GPU
  this.__GPU = this.__getGPUInformation();

}

// How often the statistics are updated
Debugger.prototype.UPDATE_INTERVAL = 60;

Debugger.prototype.isActive = function() {

  /*
   * Function Debugger.isActive
   * Returns true if the debugger is active
   */

  return this.__showStatistics;

}

Debugger.prototype.renderStatistics = function() {

  /*
   * Function Debugger.renderStatistics
   * Render statistics to the top of the screen
   */

  // Statistics are not opened
  if(!this.isActive()) {
    return;
  }

  // Update the average number of frames
  if(!this.__shouldUpdate()) {
    return;
  }

  this.__renderStatistics();

}

Debugger.prototype.toggleStatistics = function() {

  /*
   * Function Debugger.toggleStatistics
   * Toggles visibility of debugging statistics on/off
   */

  // Update the state
  this.__showStatistics = !this.__showStatistics;

  // Not active: hide the statistics
  if(!this.isActive()) {
    return document.getElementById("debug-statistics").innerHTML = "";
  } else {
    return this.__renderStatistics();
  }

}

Debugger.prototype.__getGPUInformation = function() {

  /*
   * Function Debugger.__getGPUInformation
   * Returns the GPU information if available
   */

  let webgl = document.createElement("canvas").getContext("webgl");

  return webgl.getParameter(webgl.RENDERER);

}

Debugger.prototype.__updateAverageStatistics = function() {

  /*
   * Function Debugger.__updateAverageStatistics
   * Updates the state variables of the debugger
   */

   // Time elapsed since the previous update
   let elapsed = performance.now() - this.__nSeconds;

   // Calculate average statistics over the interval
   this.__averageEvictions = ((1E3 * gameClient.spriteBuffer.nEvictions) / elapsed).toFixed(0);
   this.__averageFPS = (1E3 * this.UPDATE_INTERVAL / elapsed).toFixed(0);
   this.__averageDrawCalls = (gameClient.renderer.drawCalls / this.UPDATE_INTERVAL).toFixed(0);

   this.__nSeconds = performance.now();

   gameClient.networkManager.getLatency();

   // Reset
   gameClient.renderer.drawCalls = 0;
   gameClient.spriteBuffer.nEvictions = 0;

}

Debugger.prototype.__shouldUpdate = function() {

  /*
   * Function Debugger.__shouldUpdate
   * Returns true if the debugger should update on this frame (1 / 60)
   */

  return this.__nFrames % this.UPDATE_INTERVAL === 0;

}

Debugger.prototype.__getMemoryUsage = function() {

  /*
   * Function Debugger.getMemoryUsage
   * Returns the number of bytes used in memory (MB) - may not be supported by a browser
   */

  try {
    return (1E-6 * performance.memory.totalJSHeapSize).toFixed(0) + "MB";
  } catch(exception) {
    return "Metric Not Available";
  }

}

Debugger.prototype.__renderStatistics = function() {

  /*
   * Function Debugger.__renderStatistics
   * Renders debug statistics to the top-left of the gamescreen
   */

  // Update the average statistics
  this.__updateAverageStatistics();

  // Update the innerHTML of the statistics element
  document.getElementById("debug-statistics").innerHTML = new Array(
    // Version information
    "Server Version: ".format(gameClient.serverVersion),
    "Client Version: ".format(gameClient.clientVersion),
    "Server Tick Interval: %sms".format(gameClient.getTickInterval()),
    // Graphics information
    "Frame Rate: %sfps".format(this.__averageFPS),
    "Draw Calls: %s".format(this.__averageDrawCalls),
    "Draw Tiles: %s".format(gameClient.renderer.numberOfTiles),
    // Entity information
    "Active Entities: %s".format(Object.keys(gameClient.world.activeCreatures).length),
    // Other
    "Latency: %sms".format(Math.round(gameClient.networkManager.state.latency)),
    "Packets Received: %s".format(gameClient.networkManager.state.nPackets),
    "Packets Sent: %s".format(gameClient.networkManager.nPacketsSent),
    "Bytes Recieved: %sKB".format(Math.round(1E-3 * gameClient.networkManager.state.bytesRecv)),
    "Bytes Sent: %sKB".format(Math.round(1E-3 * gameClient.networkManager.state.bytesSent)),
    // Performance
    "Sprite Buffer Size: %sMB".format(Math.round(1E-6 * gameClient.spriteBuffer.size * gameClient.spriteBuffer.size * 4 * 32 * 32)),
    "Sprite Buffer Evictions: %s".format(this.__averageEvictions),
    "Memory Usage: %s".format(this.__getMemoryUsage()),
    "GPU: %s".format(this.__GPU),
    // Player information
    "Identifier: %s".format(gameClient.player.id),
    "Current Position: %s".format(gameClient.player.getPosition().toString()),
    "Current Sector: %s".format(gameClient.player.getChunk().id),
    "Opened Containers: %s".format(gameClient.player.__openedContainers.size),
    "Outfit: %s".format(gameClient.player.outfit.toString())
  ).join("<br>");

}
