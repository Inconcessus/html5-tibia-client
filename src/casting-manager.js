const CastingManager = function() {

  /*
   * Class CastingManager
   * Wrapper for casting functions that a creature can do
   */

  this.__castBegin = null;

}


CastingManager.prototype.isCasting = function() {

  /*
   * Function CastingManager.isCasting
   * Returns true if the creature is casting
   */

  return this.__castBegin !== null;

}

CastingManager.prototype.beginCast = function(spell) {

  /*
   * Function CastingManager.beginCast
   * Begins the process of casting a spell by scheduling an event
   */

  this.__castBegin = gameClient.eventQueue.addEvent(this.endCast.bind(this), spell.cast || spell.channel);
  this.__spell = spell;

}

CastingManager.prototype.endCast = function() {

  this.__castBegin = null;
  this.__spell = null;

}

CastingManager.prototype.getCastFraction = function() {

  /*
   * Function CastingManager.getCastFraction
   * Gets the fraction of a spell being cast (e.g. remaining ticks)
   */

  if(this.__castBegin === null) {
    return 0;
  }
 
 return 1 - this.__castBegin.remainingFrames();

}