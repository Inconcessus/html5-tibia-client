const Settings = function(element) {

  /*
   * Class Settings
   * Container for all the settings
   *
   * API:
   *
   * @Settings.isFilterEnabled() - returns true if the filter setting is enabled
   * @Settings.getFilter() - returns the selected filter
   * @Settings.isWeatherEnabled() - returns true when the weather is enabled
   * @Settings.isLightingEnabled() - returns true when the lighting is enabled
   * @Settings.isSoundEnabled() - returns true when sound is enabled
   * @Settings.saveState() - Saves state to local storage
   * @Settings.clear() - Clears state from local storage
   * @Settings.showScreenText() - Enables whether to show text on the screen
   *
   */

  // Set the volume slider callback function
  document.getElementById("volume-slider").oninput = this.setVolume;
  document.getElementById("volume-slider-value").innerHTML = document.getElementById("volume-slider").value + "%";

  document.getElementById("enable-resolution").addEventListener("change", Interface.prototype.handleResize.bind(Interface.prototype));
  document.getElementById("resolution").addEventListener("change", Interface.prototype.handleResize.bind(Interface.prototype));
  document.getElementById("anti-aliasing").addEventListener("change", this.__setAA);

  this.__init();

  // Apply state to the DOM to keep it in sync
  Object.keys(this.__state).forEach(this.__applyState.bind(this));

}

Settings.prototype.__setAA = function() {

  if(this.checked) {
    gameClient.renderer.screen.canvas.style.imageRendering = "auto";
  } else {
    gameClient.renderer.screen.canvas.style.imageRendering = "pixelated";
  }

}

Settings.prototype.setVolume = function() {

  /*
   * Function Settings.setVolume
   * Sets the application master volume
   */

  // Update the value with a fraction
  gameClient.interface.soundManager.setMasterVolume(Number(this.value) / 100);
  document.getElementById("volume-slider-value").innerHTML = Number(this.value) + "%";

}

Settings.prototype.clear = function() {

  /*
   * Class Settings.clear
   * Clears local storage from the settings
   */

  localStorage.removeItem("settings");

}

Settings.prototype.isSoundEnabled = function() {

  /*
   * Class Settings.isSoundEnabled
   * Returns true if sound is enabled
   */

  return this.__state["enable-sound"];

}

Settings.prototype.isWeatherEnabled = function() {

  /*
   * Class Settings.isWeatherEnabled
   * Returns true if the weather is enabled
   */

  return this.__state["enable-weather"];

}

Settings.prototype.isLightingEnabled = function() {

  /*
   * Function Settings.isLightingEnabled
   * Returns true if the lightning setting is enabled
   */

  return this.__state["enable-lighting"];

}

Settings.prototype.saveState = function() {

  /*
   * Function Settings.saveState
   * Saves the settings state to localstorage (should be called when the screen is closed)
   */

  localStorage.setItem("settings", JSON.stringify(this.__state));

}

Settings.prototype.__toggle = function(event) {

  /*
   * Function Settings.__toggle
   * Sets a setting to a new state that needs to be saved
   */

  // Set state to DOM
  switch(event.target.id) {
    case "enable-lighting":
    case "enable-weather":
    case "enable-sound":
      this.__state[event.target.id] = event.target.checked;
      gameClient.interface.soundManager.enableSound(event.target.checked);
      break;
    case "toggle-scale-gamewindow":
      this.__state[event.target.id] = event.target.checked;
      this.__toggleScaleGamewindow(event.target.checked);
      break;
    default:
      return;
  }

  this.saveState();

}

Settings.prototype.__init = function() {

  /*
   * Function Settings.__init
   * Returns the settings state from local storage
   */

  // Fetch settings from storage
  let state = localStorage.getItem("settings");

  // No settings stored in local storage
  if(state === null) {
    return this.__state = this.__getCleanState();
  }

  // Load settings from
  this.__state = JSON.parse(state);
  this.__update();

}

Settings.prototype.__update = function() {

  /*
   * Function Settings.__update
   * Updates non-existant settings with what is inside the DOM
   */

  let cleanState = this.__getCleanState();

  // Add new settings
  Object.keys(cleanState).forEach(function(key) {
    if(!this.__state.hasOwnProperty(key)) {
      this.__state[key] = cleanState[key];
    }
  }, this);

  // Drop removed settings
  Object.keys(this.__state).forEach(function(key) {
    if(!cleanState.hasOwnProperty(key)) {
      delete this.__state[key];
    }
  }, this);

}

Settings.prototype.__getCleanState = function() {

  /*
   * Function Settings.__getCleanState
   * Returns the clean state by checking what is currently set in the DOM
   */

  return new Object({
    "enable-sound": document.getElementById("enable-sound").checked,
    "enable-lighting": document.getElementById("enable-lighting").checked,
    "enable-weather": document.getElementById("enable-weather").checked
  });

}

Settings.prototype.__applyState = function(id) {

  /*
   * Function Settings.__applyState
   * Adds event listeners to all the settings
   */

  let element = document.getElementById(id);

  element.addEventListener("change", this.__toggle.bind(this));

  // Set DOM to state
  switch(id) {
    case "enable-lighting":
    case "enable-weather":
    case "enable-sound":
      element.checked = this.__state[id];
      break;
    default:
      return;
  }
}