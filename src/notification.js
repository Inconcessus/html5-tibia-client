const NotificationManager = function() {

  /*
   * Class NotificationManager
   * Manages notifications to the character (e.g. cancel messages)
   */

  this.__internalTimeout = null;
  this.__internalTimeoutServer = null;
  this.__internalZoneTimeout = null;

}

NotificationManager.prototype.setZoneMessage = function(message, title) {

  /*
   * Function NotificationManager.setZoneMessage
   * Sets a cancel message for a particular number of miliseconds
   */

  let element = document.getElementById("zone-message")
  element.style.display = "block";
  element.innerHTML = "&#128600 <span class='zone-title'>" + message + "</span> &#128602;<br><span class='zone-sub'>" + title + "</span>";

  if(this.__internalZoneTimeout !== null) {
    clearTimeout(this.__internalZoneTimeout);
  }

  this.__internalZoneTimeout = setTimeout(this.deferServerMessage.bind(element), 3000);

}

NotificationManager.prototype.setCancelMessage = function(message) {

  /*
   * Function NotificationManager.setCancelMessage
   * Sets a cancel message for a particular number of miliseconds
   */

  let element = document.getElementById("notification");

  element.innerHTML = message

  if(this.__internalTimeout !== null) {
    clearTimeout(this.__internalTimeout);
  }

  this.__internalTimeout = setTimeout(this.deferCancel.bind(element), 3000);

}

NotificationManager.prototype.setServerMessage = function(message, color) {

  /*
   * Function NotificationManager.setCancelMessage
   * Sets a cancel message for a particular number of miliseconds
   */

  let element = document.getElementById("server-message");
  element.style.display = "block";
  element.style.color = Interface.prototype.getHexColor(color);
  element.innerHTML = message;

  if(this.__internalTimeoutServer !== null) {
    clearTimeout(this.__internalTimeoutServer);
  }

  this.__internalTimeoutServer = setTimeout(this.deferServerMessage.bind(element), 3000);

}

NotificationManager.prototype.deferServerMessage = function() {

  /*
   * Function NotificationManager.deferServerMessage
   * Removes the notification from the server
   */

  this.style.display = "none";

}

NotificationManager.prototype.deferCancel = function() {

  /*
   * Function NotificationManager.deferCancel
   * Removes the notification from the gamescreen
   */

  this.innerHTML = "";

}
