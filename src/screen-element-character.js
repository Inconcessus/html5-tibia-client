const CharacterElement = function(creature) {

  /*
   * Class CharacterElement
   * Container for a character element that floats above creatures
   */
  
  // Inherit from screen element
  ScreenElement.call(this, "character-element-prototype");

  this.__creature = creature;

  // Update settings
  this.setName(creature.name);

}

CharacterElement.prototype = Object.create(ScreenElement.prototype);
CharacterElement.prototype.constructor = CharacterElement;

CharacterElement.prototype.setDefault = function() {

  /*
   * Class CharacterElement.setDefault
   * Sets the default colors of the healthbar
   */

  this.setHealthFraction(this.__creature.getHealthFraction());
  this.setManaColor(Interface.prototype.COLORS.BLUE);

}

CharacterElement.prototype.setGrey = function() {

  /*
   * Class CharacterElement.setGrey
   * Sets the fraction of the mana bar width
   */

  this.setHealthColor(Interface.prototype.COLORS.LIGHTGREY);
  this.setManaColor(Interface.prototype.COLORS.LIGHTGREY);

}

CharacterElement.prototype.setHealthFraction = function(fraction) {

  /*
   * Class CharacterElement.setHealthFraction
   * Sets the fraction of the mana bar width
   */

  // Set the color of the health bar too
  let color = (fraction > 0.50) ? Interface.prototype.COLORS.LIGHTGREEN :
              (fraction > 0.25) ? Interface.prototype.COLORS.ORANGE :
              (fraction > 0.10) ? Interface.prototype.COLORS.RED : Interface.prototype.COLORS.DARKRED;

  // Fetch the healthbar from the element
  let healthBar = this.element.querySelector(".value-health");

  // Set styling
  healthBar.style.width = fraction.toPercentage() + "%";

  this.setHealthColor(color);

}

CharacterElement.prototype.setHealthColor = function(color) {

  this.element.querySelector(".value-health").style.backgroundColor = Interface.prototype.getHexColor(color);

  this.setNameColor(color);

}

CharacterElement.prototype.setManaColor = function(color) {

  this.element.querySelector(".value-mana").style.backgroundColor = Interface.prototype.getHexColor(color);

}

CharacterElement.prototype.setManaFraction = function(fraction) {

  /*
   * Class CharacterElement.setManaFraction
   * Sets the fraction of the mana bar width
   */

  this.element.querySelector(".value-mana").style.width = fraction.toPercentage() + "%";

}

CharacterElement.prototype.setNameColor = function(color) {

  /*
   * Class CharacterElement.setNameColor
   * Sets the color of the name plate of the character element
   */

  this.element.querySelector("span").style.color = Interface.prototype.getHexColor(color);

}

CharacterElement.prototype.setName = function(name) {

  /*
   * Class CharacterElement.setName
   * Sets the name plate of the character element
   */

  this.element.querySelector("span").innerHTML = name;

}

CharacterElement.prototype.setTextPosition = function() {

  /*
   * Function CharacterElement.setTextPosition
   * Sets the text position of the character element
   */

  // Get the offset for the character element
  let offset = this.__getAbsoluteOffset(gameClient.renderer.getCreatureScreenPosition(this.__creature));
  let fraction = gameClient.interface.getSpriteScaling();

  // Add an offset to make the nameplate hover above the player
  offset.top -= fraction / 2;

  // Delegate to the generic move function
  this.__updateTextPosition(offset);

}
