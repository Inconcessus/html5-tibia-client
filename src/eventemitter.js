const EventEmitter = function() {

  /*
   * Class EventEmitter
   * Subscribes to events and wait for emit
   */

  this.events = new Object();

}

EventEmitter.prototype.emit = function(which, ...args) {

  /*
   * Function EventEmitter.emit
   * Emits a call to the event emitter and executes callbacks
   */

  // Not available
  if(!this.events.hasOwnProperty(which)) {
    return;
  }

  // Execute the callback
  this.events[which].forEach(callback => callback.apply(null, args));

}

EventEmitter.prototype.on = function(which, callback) {

  /*
   * Function EventEmitter.on
   * Subscribes a callback to an event
   */

  // Create a new event of this type
  if(!this.events.hasOwnProperty(which)) {
    this.events[which] = new Set();
  }

  // Add the function to the set
  this.events[which].add(callback);

  // Make sure to return a reference to the callback
  return callback;

}

EventEmitter.prototype.off = function(which, callback) {

  /*
   * Function EventEmitter.off
   * Unsubscribe a callback from an event
   */

  // Not available
  if(!this.events.hasOwnProperty(which)) {
    return;
  }

  this.events[which].delete(callback);

}

EventEmitter.prototype.clear = function() {

  /*
   * Function EventEmitter.clear
   * Clears an event emitter
   */

  this.events = new Object();

}
