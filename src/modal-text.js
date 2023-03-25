const TextModal = function(id) {

  Modal.call(this, id);

}

TextModal.prototype = Object.create(Modal.prototype);
TextModal.constructor = TextModal;

TextModal.prototype.handleOpen = function(x) {

  document.getElementById("serve-feedback").innerHTML = x;

}