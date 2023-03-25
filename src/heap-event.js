const HeapEvent = function(callback, when) {

  /*
   * Class HeapEvent
   * Container for events that fire a callback at a given server frame
   */

  // The function to execute
  this.callback = callback;
  this.length = when;
  this.cancelled = false;

  // At what frame the event is scheduled
  this.__f = gameClient.eventQueue.__internalDelta + when;

}

HeapEvent.prototype.extendTo = function(when) {

  /*
   * Function Event.extendTo
   * Extends a scheduled event to a given moment
   */

  // Cancel the previous event
  this.cancel();

  // Add the new event
  return gameClient.eventQueue.__addEvent(this.callback, gameClient.eventQueue.__internalDelta + when);

}

HeapEvent.prototype.complete = function() {

  /*
   * Function Event.complete
   * Immediately completes the scheduled event
   */

  // Remove it from the queue by canceling but still execute the callback
  this.cancel();
  this.callback();

}

HeapEvent.prototype.cancel = function() {

  /*
   * Function Event.cancel
   * Cancels a scheduled event (e.g. by extending it)
   */

  this.cancelled = true;

}

HeapEvent.prototype.remainingMillis = function() {

  /*
   * Function Event.remainingFrames
   * Returns the number of frames remaining before the event is scheduled
   */

  return this.__f - gameClient.eventQueue.__internalDelta;

}

HeapEvent.prototype.remainingSeconds = function() {

  return 1E-3 * this.remainingMillis();

}

HeapEvent.prototype.remainingFraction = function() {

  /*
   * Function Event.remainingFraction
   * Returns the number of frames remaining before the event is scheduled
   */

  return this.remainingMillis() / this.length;

}
