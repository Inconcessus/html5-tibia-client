const ModalManager = function() {

  /*
   * Class ModalManager
   * Manager for all modal __modals that can be opened
   */

  // The currently opened modal
  this.__openedModal = null;

  this.__modals = new Object();

  // Register all the following modals
  this.register(OutfitModal, "outfit-modal");
  this.register(MoveItemModal, "move-item-modal");
  this.register(ChatModal, "chat-modal");
  this.register(Modal, "settings-modal");
  this.register(EnterNameModal, "enter-name-modal");
  this.register(ConfirmModal, "confirm-modal");
  this.register(TextModal, "floater-connecting");
  this.register(Modal, "settings-box");
  this.register(Modal, "floater-enter");
  this.register(CreateAccountModal, "floater-create");
  this.register(Modal, "information-modal");
  this.register(ReadableModal, "readable-modal");
  this.register(OfferModal, "offer-modal");
  this.register(MapModal, "map-modal");
  this.register(SpellbookModal, "spellbook-modal");

  this.__addEventListeners();

}

ModalManager.prototype.__addEventListeners = function() {

  /*
   * Function ModalManager.__addEventListeners
   * Adds event listeners to the modals
   */

  // Listener for clicking open modal buttons
  document.getElementById("open-chat-modal").addEventListener("click", this.open.bind(this, "chat-modal"));
  document.getElementById("openOutfit").addEventListener("click", this.open.bind(this, "outfit-modal"));
  document.getElementById("openSettings").addEventListener("click", this.open.bind(this, "settings-modal"));

  // Main login window buttons
  document.getElementById("information").addEventListener("click", this.open.bind(this, "information-modal"));
  document.getElementById("login-info").addEventListener("click", this.open.bind(this, "floater-enter"));
  document.getElementById("create-account").addEventListener("click", this.open.bind(this, "floater-create"));
  document.getElementById("settings").addEventListener("click", this.open.bind(this, "settings-box"));

  // Add event listeners to the header elements of the modals
  Array.from(document.querySelectorAll(".modal-header")).forEach(header => header.addEventListener("mousedown", this.__handleHeaderMouseDown));

}

ModalManager.prototype.__handleHeaderMouseDown = function(event) {

  /*
   * Function ModalManager.__handleHeaderMouseDown
   * Handles dragging of modal windows ("this" references the header element)
   */
 
  event.preventDefault();

  let __handleRelease = function(event) {

    /*
     * Function ModalManager.__handleHeaderMouseDown.__handleRelease
     * Handles mouse up event when a modal is being dragged
     */

    event.preventDefault();

    // Delete listeners when mouse is released (also self!)
    document.removeEventListener("mousemove", __handleDrag);
    document.removeEventListener("mouseup", __handleRelease);

  }

  let __handleDrag = function(event) {

    /*
     * Function ModalManager.__handleHeaderMouseDown.__handleDrag
     * Handles mouse up event when a modal is being dragged
     */

    event.preventDefault();
    
    let rect = gameClient.renderer.screen.canvas.getBoundingClientRect();

    let modalElement = this.parentElement;

    // Calculate the required offset
    let left = event.clientX - rect.left - 0.5 * modalElement.offsetWidth;
    let top = event.clientY - rect.top - 0.5 * this.offsetHeight;
    
    // Clamp to the game window
    left = left.clamp(0, rect.width - modalElement.offsetWidth);
    top = top.clamp(0, rect.height - modalElement.offsetHeight);
    
    // Set the position of the modal
    modalElement.style.left = "%spx".format(left);
    modalElement.style.top = "%spx".format(top);

  }.bind(this)

  // Attach two new listeners
  document.addEventListener("mousemove", __handleDrag);
  document.addEventListener("mouseup", __handleRelease);

}

ModalManager.prototype.register = function(Class, id) {

  /*
   * Function ModalManager.register
   * Registers a new modal with the manager
   */

  // Prevent double registering of modals
  if(this.__modals.hasOwnProperty(id)) {
    return console.error("A modal with identifier " + id + " already exists.");
  }

  // Apply the class with the proper identifier
  this.__modals[id] = new Class(id);

}

ModalManager.prototype.handleConfirm = function() {

  /*
   * Function ModalManager.handleConfirm
   * Generic confirm function to trigger confirm in any modal
   */

  if(!this.isOpened()) {
    return;
  }

  this.__openedModal.handleConfirm();
  this.close();

}

ModalManager.prototype.close = function() {

  /*
   * Function ModalManager.close
   * Closes the currently opened modal
   */

  if(!this.isOpened()) {
    return;
  }

  // Hide the current modal
  this.__openedModal.element.style.display = "none";
  this.__openedModal = null;

  // Remove focus from any focused element and return it to the gamescreen
  if(document.activeElement) {
    document.activeElement.blur();
  }

}

ModalManager.prototype.render = function() {

  /*
   * Function ModalManager.render
   * Delegates call to the modal window to render
   */

  // Nothing is opened
  if(!this.isOpened()) {
    return;
  }

  this.__openedModal.handleRender();

}

ModalManager.prototype.get = function(id) {

  /*
   * Function ModalManager.get
   * Returns the window with the passed identifier
   */

  // The requested modal does not exist
  if(!this.__modals.hasOwnProperty(id)) {
    return null;
  }

  return this.__modals[id];

}

ModalManager.prototype.isOpened = function() {

  /*
   * Function ModalManager.isOpened
   * Returns true if any of the modals is active
   */

  return this.__openedModal !== null;

}

ModalManager.prototype.open = function(id, options) {

  /*
   * Function ModalManager.open
   * Opens modal with the requested identifier and passes options
   */

  // Does not exist
  if(!this.__modals.hasOwnProperty(id)) {
    return null;
  }

  // Already opened: close the previous modal
  if(this.isOpened()) {
    this.close();
  }

  this.__openedModal = this.get(id);
  this.__openedModal.show();
  this.__openedModal.handleOpen(options);

  return this.__openedModal;

}
