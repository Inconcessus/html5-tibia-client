"use strict";

const Clock = function() {

  /*
   * Class Clock
   * Client side time keeper: has an offset that is defined by the server.
   * The client may be started when it's 12:00 world time.. so we need to account for this to sync client -> server
   *
   * API:
   *
   * Clock.setPhase(phase) - Sets the phase offset of the client clock.
   * Clock.getUnix() - Returns the "unix" time of the server in miliseconds.
   * Clock.getTimeString() - Returns the string representation HH:MM of the game world time.
   * Clock.updateClockDOM() - Updates the clock DOM element.
   *
   */

  // This is the phase offset of the clock that is provided by the server
  this.__phase = 0;
  this.__initialized = performance.now();

}

// This is updated by the server configuration
Clock.prototype.CLOCK_SPEED = 0;

Clock.prototype.setPhase = function(phase) {

  /*
   * Function Clock.setPhase
   * Sets the phase of the world clock. We always start counting from 0 but the server has a leading time.. hence phase
   */

  this.__phase = phase;
  this.__initialized = performance.now();

}

Clock.prototype.getUnix = function() {

  /*
   * Function Clock.getUnix
   * Returns the "Unix" time of the server
   */

  // Wrap around by modular arithmetic
  return (this.__phase + this.CLOCK_SPEED * (performance.now() - this.__initialized)) % (24 * 60 * 60 * 1000);


}

Clock.prototype.getTimeString = function() {

  /*
   * Function Clock.getTimeString
   * Returns the string representation of the world time
   */

  // Determine the unix time of the server
  let unix = this.getUnix();

  // Extract from the unix time
  let seconds = Math.floor(unix / 1000) % 60;
  let minutes = Math.floor(unix / (60 * 1000)) % 60;
  let hours = Math.floor(unix / (60 * 60 * 1000)) % 24;

  // Return the formatted string HH:MM
  return "%s:%s".format(
    String(hours).padStart(2, "0"),
    String(minutes).padStart(2, "0")
  );

}

Clock.prototype.updateClockDOM = function() {

  /*
   * Function GameClient.updateClockDOM
   * Renders clock information to the DOM
   */

  // Update the DOM with the current time
  document.getElementById("clock-time").innerHTML = this.getTimeString();

}
