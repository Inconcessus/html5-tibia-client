const BattleWindow = function(element) {

  /*
   * Class InteractiveWindow
   * Makes an element with the window class interactive
   *
   * API:
   *  - generateContent(content): Generates the body content for the window based on the friend list array
   */

  InteractiveWindow.call(this, element);

}

// Set the prototype and constructor
BattleWindow.prototype = Object.create(InteractiveWindow.prototype);
BattleWindow.prototype.constructor = BattleWindow;

BattleWindow.prototype.removeCreature = function(id) {

  let element = this.getBody().querySelector('[id="%s"]'.format(id));

  if(element === null) {
    return;
  }

  element.remove();

}

BattleWindow.prototype.setTarget = function(creature) {

  Array.from(this.getBody().children).forEach(function(x) {

    if(creature === null) {
      return x.style.border = "1px solid black";
    }

    if(Number(x.getAttribute('id')) === creature.id) {
      x.style.border = "1px solid red";
    } else {
      x.style.border = "1px solid black";
    }

  });

}

BattleWindow.prototype.addCreature = function(creature) {

  /*
   * Function BattleWindow.addCreature
   * Updates the DOM with the targeted creature
   */

  //if(creature.type !== 1) return;
  // Create the target node and add
  let node = document.getElementById("battle-window-target").cloneNode(true);
  node.style.display = "flex";
  node.setAttribute("id", creature.id);

  // Create a new canvas
  let canvas = new Canvas(node.lastElementChild.firstElementChild, 64, 64);

  let frames =  creature.getCharacterFrames();
  let zPattern = (frames.characterGroup.pattern.z > 1 && creature.isMounted()) ? 1 : 0;

  // Call to draw the character
  canvas.__drawCharacter(
    creature.spriteBuffer,
    creature.spriteBufferMount,
    creature.outfit,
    new Position(1, 1),
    frames.characterGroup,
    frames.mountGroup,
    frames.characterFrame,
    frames.mountFrame,
    Position.prototype.opcodes.SOUTH,
    zPattern,
    32,
    0
  );

  let nodeList = node.querySelectorAll(".battle-window-bar-wrapper");

  nodeList[0].firstElementChild.innerHTML = "%s|%s".format(creature.state.health, creature.maxHealth);
  nodeList[1].lastElementChild.innerHTML = "%s|%s".format(creature.state.mana || 0, creature.maxMana || 0);

  let nameSpan = node.firstElementChild.firstElementChild;
  nameSpan.innerHTML = creature.name;

  this.getBody().appendChild(node);

  node.addEventListener("click", function() {
    let creature = gameClient.world.getCreature(this.id);
    gameClient.player.setTarget(creature);
    gameClient.send(new PacketWriter(PacketWriter.prototype.opcodes.TARGET_CREATURE).writeTargetCreature(this.id));
  });

}
