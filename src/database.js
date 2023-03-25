"use strict";

const Database = function() {

  /*
   * Class Database
   * Wrapper around indexedDB for storing minimap information and game files
   */

  // State variable to keep the database
  this.__database = null;

  // Parameters for minimap storage
  this.__minimapChunkSize = 128;
  this.__loadedMinimapChunks = new Object();

  this.init();

}

Database.prototype.init = function() {

  /*
   * Function Database.init
   * Initializes the database and assigns callbacks
   */

  // Database version (increment will run an upgrade script)
  const VERSION = 1;

  // Open the database
  let openRequest = indexedDB.open("game", VERSION);
  
  // Callbacks
  openRequest.onerror = this.__handleOpenError.bind(this);
  openRequest.onsuccess = this.__handleOpenSuccess.bind(this);
  openRequest.onupgradeneeded = this.__handleUpgrade.bind(this);

}

Database.prototype.clear = function() {

  /*
   * Function Database.clear
   * Drops the game database completely
   */

  // Ask for confirmation
  if(!confirm("Are you sure you want to reset the client?")) {
    return;
  }

  // Clear localstorage and the indexDB
  localStorage.clear();
  indexedDB.deleteDatabase("game");

  return gameClient.interface.modalManager.open("floater-connecting", "The client has been reset.");
  
}

Database.prototype.transaction = function(store, mode) {

  /*
   * Function Database.transaction
   * Transaction wrapper for the IndexDB
   */

  return this.__database.transaction(store, mode).objectStore(store);

}

Database.prototype.saveChunks = function() {

  /*
   * Function Database.saveChunks
   * Saves all active chunks to the Indexdb
   */

  // Go over all chunks to be saved
  Object.keys(this.__loadedMinimapChunks).forEach(function(id) {
    this.__saveChunk(id);
  }, this);

}

Database.prototype.preloadCallback = function(positions, callback) {

  /*
   * Function Database.preloadCallback
   * Function to preload minimap chunks and fire a callback when all chunked are loaded to memory
   */

  // Only pick the valid minimap chunk positions
  positions = positions.filter(this.isValidMinimapChunk);

  // Following code sort of implements Promise.all
  let count = 0;
  
  // Collect all callbacks and when all have been completed
  let finishCallback = function() {
    if(++count === positions.length) {
      return callback(this.getLoadedMinimapChunks());
    }
  }.bind(this);

  // Go over each position
  positions.forEach(function(position) {    
    this.loadChunk(this.getChunkIdentifier(position), finishCallback);
  }, this);

}

Database.prototype.isValidMinimapChunk = function(position) {

  /*
   * Function Database.isValidMinimapChunk
   * Returns the chunk identifier by concatenation of x, y, z
   */

  return position.x >= 0 && position.y >= 0 && position.z >= 0;

}

Database.prototype.getChunkIdentifier = function(position) {

  /*
   * Function Database.getChunkIdentifier
   * Returns the chunk identifier by concatenation of x, y, z
   */

  // Divide by the chunk size
  let xChunk = Math.floor(position.x / this.__minimapChunkSize);
  let yChunk = Math.floor(position.y / this.__minimapChunkSize);

  // The z-coordinate is single
  return xChunk + "." + yChunk + "." + position.z;
  
}

Database.prototype.getLoadedMinimapChunks = function() {

  /*
   * Function Database.getLoadedMinimapChunks
   * Returns the loaded minimap chunks that exist in memory
   */

  return this.__loadedMinimapChunks;

}

Database.prototype.loadChunk = function(id, callback) {

  /*
   * Function Database.loadChunk
   * Loads minimap chunk with a particular identifier to memory
   */

  // Already loaded: immediately return by calling the callback
  if(this.__loadedMinimapChunks.hasOwnProperty(id)) {
    return callback();
  }

  this.transaction("minimap", "readonly").get(id).onsuccess = function(event) {

    // Does not have this chunk in the database yet: create a new one
    if(event.target.result === undefined) {
      this.__loadedMinimapChunks[id] = this.__createView(this.__createChunk());
    } else {
      this.__loadedMinimapChunks[id] = this.__createView(event.target.result.data);
    }

    // In-memory is ready!
    callback();

  }.bind(this);

}

Database.prototype.storeFile = function(filename, data) {

  /*
   * Function Database.storeFile
   * Cached a file to indexDB and writes a notification to localStorage for quick loading
   */

  // Update local storage with the information
  localStorage.setItem(filename, true);

  let fileStore = this.transaction("files", "readwrite");

  // Put the updated file
  let request = fileStore.put({
    "filename": filename,
    "data": data
  });

  request.onsuccess = function(event) {
    console.debug("Cached file " + filename + " to indexDB.");
  }

}

Database.prototype.loadGameAssets = function() {

  /*
   * Function Database.loadGameAssets
   * Wrapper around indexedDB for storing minimap information
   */

  // Quickly check localstorage for state of assets
  if(!localStorage.getItem("Tibia.spr") || !localStorage.getItem("Tibia.dat")) {
    return gameClient.networkManager.loadGameFilesServer();
  }

  this.__loadGameAssets();

}

Database.prototype.__handleUpgrade = function(event) {

  /*
   * Function Database.handleUpgrade
   * Handles upgrading of the database when the version no longer matches
   */

  console.debug("Initializing IndexedDB with new version.");

  // Set the database
  this.__database = event.target.result;

  let objectStore = this.__database.createObjectStore("minimap", {keyPath: "chunk"});
  objectStore.createIndex("id", "chunk");
  let fileStore = this.__database.createObjectStore("files", {keyPath: "filename"});
  fileStore.createIndex("id", "filename");

  fileStore.onsuccess = this.loadGameAssets.bind(this);

}

Database.prototype.__handleOpenError = function(event) {

  /*
   * Function Database.handleOpenError
   * Wrapper around error function
   */

  console.error("Error", event.target.error);

}

Database.prototype.__handleOpenSuccess = function(event) {

  /*
   * Function Database.handleOpenSuccess
   * Wrapper around indexedDB for storing minimap information
   */

  console.debug("Succesfully initialized IndexedDB.");

  this.__database = event.target.result;

  // Attempt to load stored game assets
  this.loadGameAssets();

}

Database.prototype.__createView = function(chunk) {

  /*
   * Function Database.__createView
   * Returns image data and a Uint32Array view of the imagedata
   */

  // The chunk and 32-bit view of the ImageData ready for manipulation
  return new Object({
    "imageData": chunk,
    "view": new Uint32Array(chunk.data.buffer)
  });

}

Database.prototype.__createChunk = function() {

  /*
   * Function Database.__createChunk
   * Creates an empty chunk to be returned
   */

  // 4 bytes per pixel in 2D is equal to the length
  let size = 4 * this.__minimapChunkSize * this.__minimapChunkSize;

  return new ImageData(new Uint8ClampedArray(size), this.__minimapChunkSize, this.__minimapChunkSize);

}

Database.prototype.__loadGameAssets = function() {

  /*
   * Function Database.__loadGameAssets
   * Internal call to load the data from IndexDB
   */

  // Notify user we are currently loading assets..
  gameClient.setErrorModal("Welcome back! Loading game assets from local storage.");
 
  this.transaction("files", "readonly").getAll().onsuccess = function(event) {

    // Close the modal manager if it is still opened
    gameClient.interface.modalManager.close();

    // Somehow no data was returned..
    if(event.target.result.length === 0) {
      return;
    }

    // Go over the returned sprite and data file from the database: parse them to use in game
    event.target.result.forEach(function(file) {
  
      // Delegate the data file to the appropriate handler
      switch(file.filename) {
        case "Tibia.dat":
          return gameClient.dataObjects.__load(file.filename, file.data);
        case "Tibia.spr":
          return gameClient.spriteBuffer.__load(file.filename, file.data);
        default:
          return;
      }

    });
  
  }

}

Database.prototype.dropWorldMapChunks = function(position) {

  /*
   * Function Database.dropChunks
   * Drops reference to all chunks that no longer need to be kept in memory
   */

  // Get the identifier
  let [ rx, ry, rz ] = this.getChunkIdentifier(position).split(".").map(Number);
  
  Object.keys(this.__loadedMinimapChunks).forEach(function(id) {

    let [ x, y, z ] = id.split(".").map(Number);
   
    if(Math.abs(rx - x) > 2 || Math.abs(ry - y) > 2 || rz !== z) {
      delete this.__loadedMinimapChunks[id];
    }

  }, this);

}

Database.prototype.checkChunks = function(id) {

  /*
   * Function Database.checkChunks
   * Saves reference to all chunks that no longer need to be kept in memory
   */

  Object.keys(this.__loadedMinimapChunks).forEach(function(id) {
    let [x, y, z] = id.split(".").map(Number);
    if(gameClient.player.getPosition().z !== z) {
      this.__saveChunk(id);
    }
  }, this);

}

Database.prototype.__saveChunk = function(id) {

  /*
   * Function Database.__saveChunk
   * Saves chunk to database without removing from memory
   */

  let minimapStore = this.transaction("minimap", "readwrite");

  let request = minimapStore.put({
    "chunk": id,
    "data": this.__loadedMinimapChunks[id].imageData
  });

  // When done remove reference from memory
  request.onsuccess = function() {
    delete this.__loadedMinimapChunks[id];
  }.bind(this)

}
