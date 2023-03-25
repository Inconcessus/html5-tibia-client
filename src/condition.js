const ConditionManager = function(player, conditions) {

  /*
   * Class ConditionManager
   * Handler for player conditions
   */

  this.__player = player;

  // Wrapper around a set
  this.__conditions = new Set(conditions);

}

ConditionManager.prototype.has = function(cid) {

  /*
   * Function ConditionManager.has
   * Returns true if the player is currently suffering from the condition
   */

  return this.__conditions.has(cid);

}

ConditionManager.prototype.add = function(cid) {

  /*
   * Function ConditionManager.add
   * Adds a condition to the list of conditions
   */

  this.__conditions.add(cid);

  // Update the status bar
  if(this.__player === gameClient.player) {
    gameClient.interface.statusBar.update();
  }

  if(this.__player.hasCondition(ConditionManager.prototype.DRUNK)) {
    if(!this.__player.hasCondition(ConditionManager.prototype.SUPPRESS_DRUNK)) {
      document.getElementById("screen").style.filter = "blur(2px)";
    }
  }

}

ConditionManager.prototype.remove = function(cid) {

  /*
   * Function ConditionManager.remove
   * Removes a condition from the list of conditions
   */

  // Remove the condition identifier from the set
  this.__conditions.delete(cid);

  // Update the status bar
  if(this.__player === gameClient.player) {
    gameClient.interface.statusBar.update();
  }

  if(!this.__player.hasCondition(ConditionManager.prototype.DRUNK)) {
    document.getElementById("screen").style.filter = "";
  }

}

// Standards
ConditionManager.prototype.DRUNK = 0;
ConditionManager.prototype.POISONED = 1;
ConditionManager.prototype.BURNING = 2;
ConditionManager.prototype.ELECTRIFIED = 3;
ConditionManager.prototype.INVISIBLE = 4;
ConditionManager.prototype.PROTECTION_ZONE = 5;
ConditionManager.prototype.COMBAT_LOCK = 6;
ConditionManager.prototype.SUPPRESS_DRUNK = 7;
ConditionManager.prototype.LIGHT = 8;
ConditionManager.prototype.HEALING = 9;
ConditionManager.prototype.REGENERATION = 10;
ConditionManager.prototype.MORPH = 11;
ConditionManager.prototype.MAGIC_SHIELD = 12;
ConditionManager.prototype.SATED = 14;
ConditionManager.prototype.HASTE = 15;