"use strict";

const Book = function(id) {

  /*
   * Class Book
   * Container for writeable items
   */

  // Inherits from item
  Item.call(this, id, 1);

  // Set the
  this.__content = null;

}

Book.prototype = Object.create(Item.prototype);
Book.prototype.constructor = Book;

Book.prototype.getContent = function() {

  /*
   * Function Book.getContent
   * Returns the content of a book
   */

  return this.__content;

}

Book.prototype.setContent = function(content) {

  /*
   * Function Book.getContent
   * Overwrites the content of a book
   */

  this.__content = content;

}