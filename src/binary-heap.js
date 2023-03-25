"use strict";

const BinaryHeap = function() {

  /*
   * Class BinaryHeap
   * Implementation of a simple binary heap used as a priority queue
   * in e.g. the A* pathfinding algorithm or as a priority queue (cost is given by property .__f)
   */

  this.content = new Array();

}

BinaryHeap.prototype.push = function(element) {

  /*
   * Function BinaryHeap.push
   * Adds an element to the binary heap
   */

  // Add the new element to the end of the array.
  this.content.push(element);

  // Allow it to sink down.
  this.sinkDown(this.content.length - 1);

}

BinaryHeap.prototype.pop = function() {

  /*
   * Function BinaryHeap.pop
   * Pops the top element of the binary heap
   */

  // Store the first element so we can return it later.
  let result = this.content[0];

  // Get the element at the end of the array.
  let end = this.content.pop();

  // If there are any elements left, put the end element at the
  // start, and let it bubble up.
  if(this.content.length > 0) {
    this.content[0] = end;
    this.bubbleUp(0);
  }

  return result;

}

BinaryHeap.prototype.remove = function(node) {

  let length = this.content.length;

  // To remove a value, we must search through the array to find it
  for(let i = 0; i < length; i++) {

    if(this.content[i] !== node) {
      continue;
    }

    // When it is found, the process seen in 'pop' is repeated
    // to fill up the hole.
    let end = this.content.pop();

    // If the element we popped was the one we needed to remove,
    // we're done.
    if(i === length - 1) {
      break;
    }

    // Otherwise, we replace the removed element with the popped
    // one, and allow it to float up or sink down as appropriate.
    this.content[i] = end;
    this.bubbleUp(i);
    this.sinkDown(i);
    break;

  }

}

BinaryHeap.prototype.size = function() {

  /*
   * Function BinaryHeap.size
   * Returns the size of the binary heap
   */

  return this.content.length;

}

BinaryHeap.prototype.rescoreElement = function(node) {

  /*
   * Function BinaryHeap.rescoreElement
   * Rescores an element within the binary heap
   */

  this.sinkDown(this.content.indexOf(node));

}

BinaryHeap.prototype.sinkDown = function(n) {

  /*
   * Function BinaryHeap.sinkDown
   * Sinks an element down to its supposed location
   */

  // Fetch the element that has to be sunk.
  let element = this.content[n];

  // When at 0, an element can not sink any further.
  while(n > 0) {

    // Compute the parent element's index, and fetch it.
    let parentN = ((n + 1) >> 1) - 1;
    let parent = this.content[parentN];

    // Found a parent that is less, no need to sink any further.
    if(element.__f >= parent.__f) {
      break;
    }

    // Swap the elements if the parent is greater.
    this.content[parentN] = element;
    this.content[n] = parent;
    n = parentN;

  }

}

BinaryHeap.prototype.bubbleUp = function(n) {

  /*
   * Function BinaryHeap.bubbleUp
   * Bubbles up an element
   */

  // Look up the target element and its score.
  let length = this.content.length;
  let element = this.content[n];
  let elemScore = element.__f;

  while(true) {

    // Compute the indices of the child elements.
    let child2N = (n + 1) << 1;
    let child1N = child2N - 1;

    // This is used to store the new position of the element, if any.
    let swap = null;
    let child1Score;

    // If the first child exists (is inside the array)...
    if(child1N < length) {

      // Look it up and compute its score.
      let child1 = this.content[child1N];
      child1Score = child1.__f;

      // If the score is less than our element's, we need to swap.
      if(child1Score < elemScore) {
        swap = child1N;
      }

    }

    // Do the same checks for the other child.
    if(child2N < length) {

      let child2 = this.content[child2N];
      let child2Score = child2.__f;

      if(child2Score < (swap === null ? elemScore : child1Score)) {
        swap = child2N;
      }

    }

    if(swap === null) {
      break;
    }

    // If the element needs to be moved, swap it, and continue.
    this.content[n] = this.content[swap];
    this.content[swap] = element;
    n = swap;

  }

}
