"use strict";

const Spellbook = function() {

  /*
   * Class Spellbook
   * Container for the player spells
   */

  // List of all abilities on cooldown
  this.cooldowns = new Map();

}

// Identifier of the global cooldown
Spellbook.prototype.GLOBAL_COOLDOWN = 0xFFFF;
Spellbook.prototype.GLOBAL_COOLDOWN_DURATION = 20;

Spellbook.prototype.castSpell = function(sid) {

  /*
   * Function Spellbook.castSpell
   * Function to cast a spell from the spellbook
   */

  // The spell is still on cooldown
  if(this.cooldowns.has(this.GLOBAL_COOLDOWN) || this.cooldowns.has(sid)) {
    return this.__cooldownCallback();
  }

  // Write the turn request to the server
  gameClient.send(new PacketWriter(PacketWriter.prototype.opcodes.CAST_SPELL).writeCastSpell(sid));

}

Spellbook.prototype.serverCastSpell = function(packet) {

  /*
   * Function Spellbook.serverCastSpell
   * Handles messages from the server to lock a spell
   */

  this.__lockSpell(packet.id, packet.cooldown);

}

Spellbook.prototype.getCooldownSeconds = function(sid) {

  let gcdf = this.cooldowns.has(this.GLOBAL_COOLDOWN) ? this.cooldowns.get(this.GLOBAL_COOLDOWN).remainingSeconds() : 0;

  if(!this.cooldowns.has(sid)) {
    return gcdf;
  }

  return Math.max(gcdf, this.cooldowns.get(sid).remainingSeconds());

}

Spellbook.prototype.getCooldownFraction = function(sid) {

  /*
   * Function Spellbook.getCooldownFraction
   * Returns the cooldown of a speed with a particular identifier
   */

  // Global cooldown
  let gcdf = this.cooldowns.has(this.GLOBAL_COOLDOWN) ? (1 - this.cooldowns.get(this.GLOBAL_COOLDOWN).remainingFraction()) : 1;

  // Spell is not on cooldown: show the global cooldown time
  if(!this.cooldowns.has(sid)) {
    return gcdf;
  }

  // Return the minimum
  return Math.min(gcdf, 1 - this.cooldowns.get(sid).remainingFraction());

}

Spellbook.prototype.__cooldownCallback = function() {

  /*
   * Function Spellbook.__cooldownCallback
   * Callback fired when a spell is cast that is still on cooldown
   */

  gameClient.player.blockHit();
  gameClient.interface.setCancelMessage("You cannot cast this spell yet.");

}

Spellbook.prototype.__lockSpell = function(id, time) {

  /*
   * Function Spellbook.__lockSpell
   * Handles messages from the server to lock a spell
   */

  // Lock the spell itself
  this.cooldowns.set(id, gameClient.eventQueue.addEvent(this.__unlockSpell.bind(this, id), time));

  // Lock the global cooldown too
  this.cooldowns.set(this.GLOBAL_COOLDOWN, gameClient.eventQueue.addEvent(this.__unlockSpell.bind(this, this.GLOBAL_COOLDOWN), this.GLOBAL_COOLDOWN_DURATION));

}

Spellbook.prototype.__unlockSpell = function(id) {

  /*
   * Function Spellbook.__unlockSpell
   * Unlocks a spell from the spellbook, allowing it to be cast again
   */

  this.cooldowns.delete(id);

}