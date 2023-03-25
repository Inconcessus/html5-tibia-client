const ReadableModal = function(id) {

  Modal.call(this, id);

}

ReadableModal.prototype = Object.create(Modal.prototype);
ReadableModal.constructor = ReadableModal;

ReadableModal.prototype.handleOpen = function(packet) {

  document.getElementById("book-text-area").value = packet.content;
  document.getElementById("book-text-area").disabled = !packet.writeable;
  
  this.setTitle(packet.name);

}