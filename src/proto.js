"use strict";

String.prototype.capitalize = function() {

  /*
   * Function String.capitalize
   * Capitalizes a string
   */

  return this.charAt(0).toUpperCase() + this.slice(1);

}

Function.prototype.TRUE = function() {

  /*
   * Function Function.TRUE
   * Function that always returns true!
   */

  return true;

}

Number.prototype.toPercentage = function() {

  /*
   * Function Number.toPercentage
   * Converts a fraction to a percentage
   */

  return 100 * this.clamp(0, 1);

}

String.prototype.format = function() {

  /*
   * Function String.format
   * Formats a string with interpolation of %s
   */

  let string = this;

  Array.from(arguments).forEach(function(argument) {
    string = string.replace("%s", argument);
  });

  return string;

}

Number.prototype.formatNumber = function() {

  /*
   * Function Number.formatNumber
   * Adds commas to large numbers (e.g., 1000 -> 1,000)
   */

  return this.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

}

Array.prototype.head = function() {

  /*
   * Function Array.last
   * Returns a reference to the last element in an array
   */

  return this[0];

}

Array.prototype.last = function() {

  /*
   * Function Array.last
   * Returns a reference to the last element in an array
   */

  return this[this.length - 1];

}

Number.prototype.random = function(min, max) {

  /*
   * Function Number.random
   * Returns a random number between min and max (inclusive)
   */

  return Math.floor(Math.random() * (max - min + 1) + min);

}

Number.prototype.clamp = function(min, max) {

  /*
   * Function Number.clamp
   * Clamps a number between min and max (both inclusive)
   */

  return Math.min(Math.max(min, this), max);

}
