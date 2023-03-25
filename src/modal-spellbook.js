const SpellbookModal = function(element) {

  /*
   * Class SpellbookModal
   * Wrapper for the modal that can open chat windows
   */

  // Inherit from modal
  Modal.call(this, element);

  this.__wrapper = document.getElementById("spellbook-list");
  this.__index = 0;

}

SpellbookModal.prototype = Object.create(Modal.prototype);
SpellbookModal.constructor = SpellbookModal;

SpellbookModal.prototype.__handleClick = function(sid) {

  /*
   * Class SpellbookModal
   * Wrapper for the modal that can open chat windows
   */

  // Add the slots to the hotbar
  gameClient.interface.hotbarManager.addSlot(this.__index, sid);

  this.__buttonClick({
    "target": this.element.querySelector("button[action='cancel']")
  });

}

SpellbookModal.prototype.createSpellList = function(spells) {

  /*
   * Function SpellbookModal.createSpellList
   * Creates the spell list with the available player spells
   */

  // Update all the children
  document.getElementById("spellbook-list").replaceChildren(...spells.map(this.__createSpellNode, this));

}


SpellbookModal.prototype.__createSpellNode = function(id) {

  /*
   * Function SpellbookModal.__createSpellNode
   * Creates a single spell node for the modal spellbook
   */

  // Get the spell from the interface
  let spell = gameClient.interface.getSpell(id);

  let DOMElement = document.getElementById("spellbook-wrapper-prototype").cloneNode(true);
  let DOMElementCanvas = DOMElement.firstElementChild;
  let canvas = new Canvas(DOMElementCanvas, 32, 32);

  // Draw icon on the canvas
  canvas.context.drawImage(
    HotbarManager.prototype.ICONS,
    32 * spell.icon.x,
    32 * spell.icon.y,
    32, 32,
    0, 0,
    32, 32
  );

  // Set some more information
  DOMElement.lastElementChild.innerHTML = "%s<br><small>%s</small>".format(spell.name, spell.description);
  DOMElement.addEventListener("click", this.__handleClick.bind(this, id));
  DOMElement.title = spell.description;
  DOMElement.style.display = "flex";

  return DOMElement;

}

SpellbookModal.prototype.handleOpen = function(index) {

  /*
   * Function SpellbookModal.handleOpen
   * Callback fired when the spellbook modal is opened
   */

  this.__index = index;

}