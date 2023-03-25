const ReplayManager = function() {

  /*
   * Classs ReplayManager
   * Container for a packet replayer (playback) for recorded packets
   * This is a feature similar to what TibiaCam provided
   */

  this.__recording = false;
  this.__replaying = false;
  this.__aborted = false;
  this.__forward = false;

  this.__recordedPackets = new Array();
  this.__encodedLength = 0;

}

ReplayManager.prototype.abort = function(callback) {

  this.__replaying = false;
  this.__aborted = true;
  this.abortCallback = callback;

}

ReplayManager.prototype.record = function() {

  /*
   * Function ReplayManager.record
   * Starts a recording of the game packets by setting the recording state (picked up by network manager on recv)
   */

  document.getElementById("recording-span").innerHTML = "<button onclick='downloadSafe()'>&#128308</button> Recording..";
  this.__recording = true;
  this.start = Date.now();

}

ReplayManager.prototype.abortCallback = Function.prototype;

ReplayManager.prototype.replay = function(data) {

  /*
   * Function ReplayManager.replay
   * Replays all packets as sent by the server
   */

  // If already replaying: abort the current replay
  if(this.__replaying) {
    this.abort(this.replay.bind(this, data));
    return;
  }

  this.__replaying = true;
  this.__aborted = false;

  // Hide the login modal
  document.getElementById("asset-modal").style.display = "none";
  document.getElementById("skip").style.display = "block";

  // Parse the input data file
  this.data = JSON.parse(data);
  this.packets = this.data.packets;

  this.length = this.data.end - this.data.start;

  gameClient.interface.reset();
  gameClient.setServerData(this.data.metadata);

  // State for the replay
  this.replayStart = this.packets[0].timestamp;
  this.now = Date.now();
  this.replayIndex = 0;

  // Begin replaying the 
  this.playback();

}

ReplayManager.prototype.isReplayForwarding = function() {

  return this.__forward;

}

ReplayManager.prototype.setFraction = function(fraction) {

  /*
   * Function ReplayManager.setFraction
   * Sets the replay to the number of elapsed seconds by replaying everything
   */

  if(this.__replaying) {
    this.abort(this.setFraction.bind(this, fraction));
    return;
  }

  gameClient.interface.reset();
  gameClient.setServerData(this.data.metadata);

  this.__replaying = true;
  this.__aborted = false;


  this.replayIndex = 0;

  let seconds = (fraction * this.length) | 0;
  let elapsed = this.replayStart + seconds;
  this.now = Date.now() - seconds;

  // Set forwarding state and catch up to current situation
  this.__forward = true;
  this.catchup(elapsed);
  this.__forward = false;

}

ReplayManager.prototype.finish = function() {

  /*
   * Function ReplayManager.finish
   * Finishes the replay of the server
   */

  this.__replaying = false;
  this.__aborted = false;
  this.abortCallback = Function.prototype;
  this.__encodedLength = 0;
  gameClient.networkManager.__connected = false;
  gameClient.renderer.screen.clear();
  this.updateStatistics(this.replayStart + this.length, 100);


}

ReplayManager.prototype.catchup = function(elapsed) {

  /*
   * Function ReplayManager.catchup
   * Catches up to the elapsed time
   */

  if(this.replayIndex >= this.packets.length) {
    return this.finish();
  }

  while(elapsed >= this.packets[this.replayIndex].timestamp) {

    gameClient.networkManager.handleMessage({
      "data": this.decode64(this.packets[this.replayIndex++].buffer)
    });

    if(this.replayIndex >= this.packets.length) {
      return this.finish();
    }

  }

}

ReplayManager.prototype.updateStatistics = function(elapsed, percent) {

  document.getElementById("recording-span-text").innerHTML = new Date(elapsed).toISOString();
  document.getElementById("skip").firstElementChild.style.width = percent.toFixed(0) + "%";
  document.getElementById("skip").lastElementChild.innerHTML = percent.toFixed(0) + "%";

}

ReplayManager.prototype.playback = function() {

  /*
   * Function ReplayManager.playback
   * Replay loop to handle all virtual packets from the server
   */

  // Percentage completed
  let elapsed = this.replayStart + (Date.now() - this.now);
  let percent = 100 * ((Date.now() - this.now) / this.length);

  this.updateStatistics(elapsed, percent);
  this.catchup(elapsed);

}

ReplayManager.prototype.download = function(filename) {

  /*
   * Function ReplayManager.download
   * Downloads the recorded packets to a JSON file
   */

  // Not recording or no packets: nothing to download
  if(!this.__recording || this.__recordedPackets.length === 0) {
    return;
  }

  // Create the payload
  let data = JSON.stringify({
    "packets": this.__recordedPackets,
    "end": Date.now(),
    "start": this.start,
    "clientVersion": gameClient.clientVersion,
    "metadata": {
      "tick": gameClient.getTickInterval(),
      "version": gameClient.serverVersion,
      "width": gameClient.world.width,
      "height": gameClient.world.height,
      "depth": gameClient.world.depth
    }
  });

  let file = new Blob([data], {"type": "application/json"});
  let a = document.createElement("a");
  let url = URL.createObjectURL(file);

  // Some hackery to download a file
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

}

ReplayManager.prototype.encode64 = function(buffer) {

  /*
   * Function ReplayManager.encode64
   * Encodes the received packet buffers to base 64
   */

  return btoa(String.fromCharCode.apply(null, buffer));

}

ReplayManager.prototype.decode64 = function(string) {

  /*
   * Function ReplayManager.decode64
   * Encodes the received packet buffers from base64 to something that can be replayed
   */

  return atob(string).split("").map(function(x) {
    return x.charCodeAt(0);
  });

}

ReplayManager.prototype.recordPacket = function(buffer) {

  /*
   * Function ReplayManager.recordPacket
   * Records an incoming packet from the server including the timestamp
   */

  let encoded = this.encode64(buffer);

  this.__encodedLength += encoded.length;

  this.__recordedPackets.push({
    "timestamp": Date.now(),
    "buffer": encoded
  });

}