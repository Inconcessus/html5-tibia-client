const OfferModal = function(element) {

  /*
   * Class OfferModal
   * Wrapper for the modal that can open trade windows with NPCs
   */

  // Inherit from modal
  Modal.call(this, element);

  // Some state for the modal
  this.__selectedElement = null;
  this.__selectedOffer = null;
  this.__offerType = "sell";
  this.__offers = null;

  document.getElementById("set-sell").addEventListener("click", this.setOfferType.bind(this, "sell"));
  document.getElementById("set-buy").addEventListener("click", this.setOfferType.bind(this, "buy"));
  document.getElementById("buy-count").addEventListener("input", this.__handleChangeCount.bind(this));

}

OfferModal.prototype = Object.create(Modal.prototype);
OfferModal.constructor = OfferModal;

OfferModal.prototype.__handleChangeCount = function(event) {

  /*
   * Function OfferModal.__handleChangeCount
   * Callback fired when input is given to the quantity select slider
   */

  document.getElementById("offer-count").innerHTML = event.target.value;
  this.handleChangeCount();

}

OfferModal.prototype.handleChangeCount = function() {

  /*
   * Function OfferModal.__handleChangeCount
   * Callback fired when input is given to the quantity select slider
   */

  let offer = this.__offers[this.__selectedOffer];

  let count = Number(document.getElementById("buy-count").value);

  if(document.getElementById("buy-count-wrapper").style.display === "none") {
    count = 1;
  }

  document.getElementById("offer-price").innerHTML = count * offer.price;
  document.getElementById("offer-count").innerHTML = count;

}

OfferModal.prototype.setOfferType = function(which) {

  /*
   * Function OfferModal.setOfferType
   * Toggles the offer type between sell/buy
   */

  document.getElementById("set-sell").className = "offer-tab";
  document.getElementById("set-buy").className = "offer-tab";
  document.getElementById("set-%s".format(which)).className += " selected";
  
  // Block if already set
  if(this.__offerType === which) {
    return;
  }

  this.__offerType = which;

  this.setOffers();

}

OfferModal.prototype.setOffers = function() {

  /*
   * Function OfferModal.setOffers
   * Updates the DOM with the items offered by the NPC
   */

  this.clear();

  let offerDOM = this.element.querySelector(".offers");

  // Reset the body
  offerDOM.innerHTML = "";

  if(this.__offers.filter(this.matchOfferType, this).length === 0) {
    return offerDOM.innerHTML = "No %s offers to display.".format(this.__offerType);
  }

  // Generate the required nodes and add them to the DOM
  this.__offers.filter(this.matchOfferType, this).map(this.createOfferNode, this).forEach(function(node) {
    offerDOM.appendChild(node);
  });

}

OfferModal.prototype.matchOfferType = function(offer) {

  /*
   * Function OfferModal.matchOfferType
   * Updates the DOM with the items offered by the NPC
   */

  return offer.type === this.__offerType;

}

OfferModal.prototype.createOfferNode = function(offer, index) {

  /*
   * Function OfferModal.createOfferNode
   * Creates an offer node with a single offet
   */

  // Create a canvas to show the item
  let canvas = new Canvas(null, 32, 32);
  canvas.canvas.className = "slot";
  canvas.drawSprite(new Item(offer.id), Position.prototype.NULL, 32);

  // Can be selected
  canvas.canvas.addEventListener("click", this.handleSelectOffer.bind(this, canvas, offer, index));
	
  return canvas.canvas;

}

OfferModal.prototype.clear = function(canvas, offer) {

  /*
   * Function OfferModal.clear
   * Clears
   */

  document.getElementById("offer-name").innerHTML = "Select an Offer";
  this.__selectedElement = null;
  this.__selectedOffer = null;

}

OfferModal.prototype.handleSelectOffer = function(canvas, offer, index) {

  /*
   * Function OfferModal.handleSelectOffer
   * Handles click of an offer to set as the currently selected offer
   */

  // Reset the previous selected node
  if(this.__selectedElement !== null) {
    this.__selectedElement.className = "slot";
  }

  // Update with the current node
  this.__selectedElement = canvas.canvas;
  this.__selectedOffer = index;
  canvas.canvas.className = "slot selected";

  this.__setOfferInformation(offer);
  this.handleChangeCount();

}

OfferModal.prototype.handleOpen = function(properties) {

  /*
   * Function OfferModal.handleOpen
   * Callback function fired when the modal is opened
   */

  let NPC = gameClient.world.getCreature(properties.id);

  this.__id = properties.id;
  this.__offers = properties.offers;

  this.setOffers();
  this.setTitle("%s Trade Offers".format(NPC.name));

  document.getElementById("buy-count-wrapper").style.display = "none";

}

OfferModal.prototype.handleConfirm = function() {

  /*
   * Function OfferModal.handleConfirm
   * Handles confirming
   */

  if(this.__selectedOffer === null) {
    return;
  }

  let count = Number(document.getElementById("buy-count").value);

  if(document.getElementById("buy-count-wrapper").style.display === "none") {
    count = 1;
  }

  // Write to server
  gameClient.send(new PacketWriter(PacketWriter.prototype.opcodes.BUY_OFFER).writeBuyOffer(this.__id, this.__selectedOffer, count));

  return false;

}

OfferModal.prototype.__setPriceInformation = function(offer) {

}

OfferModal.prototype.__setOfferInformation = function(offer) {

  /*
   * Function OfferModal.__setOfferInformation
   * Sets text span with the current offer information
   */
  
  let thing = new Item(offer.id);
  
  if(thing.isStackable()) {
    document.getElementById("buy-count-wrapper").style.display = "flex";
  } else {
    document.getElementById("buy-count-wrapper").style.display = "none";
  }

  document.getElementById("offer-name").innerHTML = offer.name;
  document.getElementById("offer-price").innerHTML = offer.price;

}