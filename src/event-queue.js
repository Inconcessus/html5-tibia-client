const EventQueue = function() {

  /*
   * Class EventQueue
   * Container for priority queuing class based on a binary heap
   *
   * API:
   *
   * EventQueue.tick(delta) - ticks the event queue with the passed interval in miliseconds
   * EventQueue.addEvent(callback, ticks) - schedule an event a number of ticks from now
   * EventQueue.addEventMs(callback, miliseconds) - schedule an event a number of ticks from now
   *
   */

  // Interval milisecond counter
  this.__internalDelta = 0;
  this.__start = performance.now();

  // Create the binary heap that we use as a priority queue for all events
  this.heap = new BinaryHeap();

}

EventQueue.prototype.tick = function() {

  /*
   * Function EventQueue.tick
   * Executes all events scheduled to be run in the queue
   */

  // Increment with the elapsed time
  this.__update();

  while(true) {

    // If there are no more items in the queue
    if(this.heap.content.length === 0) {
      return;
    }

    // Check that the frame is beyond the current counter
    if(this.heap.content.head().__f > this.__internalDelta) {
      return;
    }

    let nextEvent = this.heap.pop();

    if(nextEvent.cancelled) {
      continue;
    }

    // Execute the next bound callback
    nextEvent.callback();

  }

}

EventQueue.prototype.addEvent = function(callback, when) {

  /*
   * Function EventQueue.addEvent
   * Public function to add an event (in unit of ticks)
   */

  // Calculate server tick frames to time
  when = Math.floor(Math.max(when, 0) * gameClient.getTickInterval());

  // Determine the frame when to execute the function
  return this.__addEvent(callback, when);

}

EventQueue.prototype.addEventMs = function(callback, ms) {

  /*
   * Function EventQueue
   * Adds an event a number of miliseconds from now
   */

  let seconds = Math.floor(ms / gameClient.getTickInterval());

  // Number of ticks
  return this.addEvent(callback, seconds);

}

EventQueue.prototype.__update = function() {

  /*
   * EventQueue.__update
   * Updates the internal count delta for datasets
   */

  this.__internalDelta = performance.now() - this.__start;

}

EventQueue.prototype.__isValidFrame = function(frame) {

  /*
   * Function EventQueue.__isValidFrame
   * Returns true if the frame is valid..
   */

  return frame >= 0 && !isNaN(frame);

}

EventQueue.prototype.__addEvent = function(callback, frame) {

  /*
   * Function EventQueue.__addEvent
   * Internal function to add an event to the event queue
   */

  // Invalid frame
  if(!this.__isValidFrame(frame)) {
    return console.error("Could not add event with an invalid frame.");
  }
  
  // Create a new heap event to be executed at the said frame
  let event = new HeapEvent(callback, frame);

  // Add the event to the heap
  this.heap.push(event);

  // Return the event for reference
  return event;

}
