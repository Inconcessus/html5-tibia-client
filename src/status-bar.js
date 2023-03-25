const StatusBar = function() {

  /*
   * Class StatusBar
   * Container for the status bar that keeps active conditions
   */

  this.statusBarElement = document.getElementById("status-bar");

}

// Map to look up conditions
StatusBar.prototype.STATUS = new Map();
StatusBar.prototype.STATUS.set(0, {"title": "You are drunk.", "src": "/png/status/status-drunk.png"});
StatusBar.prototype.STATUS.set(1, {"title": "You are poisoned.", "src": "/png/status/status-poisoned.png"});
StatusBar.prototype.STATUS.set(2, {"title": "You are burning.", "src": "/png/status/status-burning.png"});
StatusBar.prototype.STATUS.set(3, {"title": "You are electrified.", "src": "/png/status/status-electrified.png"});
StatusBar.prototype.STATUS.set(4, {"title": "You are invisible.", "src": "/png/status/status-invisible.png"});
StatusBar.prototype.STATUS.set(5, {"title": "You are in a protection zone.", "src": "/png/status/status-protection-zone.png"});
StatusBar.prototype.STATUS.set(6, {"title": "You were recently in combat.", "src": "/png/status/status-combat.png"});
StatusBar.prototype.STATUS.set(12, {"title": "You are wearing a magic shield.", "src": "/png/status/status-magic-shield.png"});
StatusBar.prototype.STATUS.set(14, {"title": "You are hungry.", "src": "/png/status/status-hungry.png"});
StatusBar.prototype.STATUS.set(15, {"title": "You are hasted.", "src": "/png/status/status-haste.png"});

StatusBar.prototype.update = function() {

  /*
   * Function StatusBar.update
   * Updates the players status bar
   */

  // Create the nodes from the available identifiers: unknown are skipped
  let conditionNodes = Array.from(gameClient.player.conditions.__conditions).filter(function(cid) {
    return this.STATUS.has(cid) && cid !== ConditionManager.prototype.SATED;
  }, this).map(this.__createConditionNode, this);

 
  // We have to invert the sated condition: not sated means hungry
  if(!gameClient.player.hasCondition(ConditionManager.prototype.SATED)) {
    conditionNodes.push(this.__createConditionNode(ConditionManager.prototype.SATED));
  }

  this.statusBarElement.replaceChildren(...conditionNodes);

}

StatusBar.prototype.__createConditionNode = function(cid) {

  /*
   * Function StatusBar.__createConditionNode
   * Creates a single status node for the status bar (cache?)
   */

  let { src, title } = this.STATUS.get(cid);

  let img = document.createElement("img");
  img.src = src;
  img.title = title;

  return img;

}