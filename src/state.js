"use strict";

const State = function() {

  /*
   * Class State
   * Wrapper that contains properties for state variables with optional callbacks after getting/setting the property
   * For example: updating the DOM after a creature's health is changed
   */

  // Internal private container for the state
  this.__state = new Object();

}

State.prototype.add = function(key, callback) {

  /*
   * Function State.add
   * Creates a new properties in the state variable
   */

  // Create the new state variable
  this.__state[key] = null;

  // Define the pattern
  let pattern = this.__createPattern(key, callback);

  // Define the getter & setter as the callback:
  Object.defineProperty(this, key, pattern);

}

State.prototype.__createPattern = function(key, callback) {

  /*
   * Function State.__createPattern
   * Creates a new setter and getter pattern for a property
   */

  // Create the getter
  let get = function stateGetter() {
    return this.__state[key];
  }

  // Create the setter
  let set = function stateSetter(value) {

    this.__state[key] = value;

    // If a callback was supplied: execute it with the set value
    if(callback !== null) {
      return callback(value);
    }

  }

  return { get, set }

}