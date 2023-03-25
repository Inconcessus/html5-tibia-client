const Enum = function(array) {

  /*
   * Class Enum
   * Generates an enum by returning an object with symbols
   */

  // Go over each elements
  let enumerator = new Object();

  array.forEach(function(x) {
    enumerator[x] = Symbol(x);
  });

  return Object.freeze(enumerator);

}
