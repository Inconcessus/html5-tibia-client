const CreateAccountModal = function(element) {

  /*
   * Class CreateAccountModal
   * Modal that pops up to ask for a confirmation and apply a callback if succesful
   */

  // Inherit from modal
  Modal.call(this, element);

}

CreateAccountModal.prototype = Object.create(Modal.prototype);
CreateAccountModal.constructor = CreateAccountModal;

CreateAccountModal.prototype.__isValidSubmission = function(options) {

  /*
   * Function CreateAccountModal.__isValidSubmission
   * Returns true if the submission is valid
   */

  document.getElementById("create-username").style.border = null;
  document.getElementById("create-password").style.border = null;
  document.getElementById("create-name").style.border = null;
  document.getElementById("create-sex").style.border = null;

  if(options.account === "" || options.password === "" || options.name === "") {
    return false;
  }

  if(options.sex !== "male" && options.sex !== "female") {
    return false;
  }

  if(options.account.length < 6) {
    document.getElementById("create-username").style.border = "1px solid red"; 
    return false;
  }

  if(options.password.length < 6) {
    document.getElementById("create-password").style.border = "1px solid red"; 
    return false;
  }

  return true;

}

CreateAccountModal.prototype.handleConfirm = function() {

  /*
   * Function CreateAccountModal.handleConfirm
   * Callback fired when confirm action is pressed
   */

  let options = new Object({
    "account": document.getElementById("create-username").value,
    "password": document.getElementById("create-password").value,
    "name": document.getElementById("create-name").value.toLowerCase(),
    "sex": document.getElementById("create-sex").value
  });


  if(!this.__isValidSubmission(options)) {
    return false;
  }

  gameClient.networkManager.createAccount(options);
  return true;

}
