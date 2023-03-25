const SkillWindow = function(element) {

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
SkillWindow.prototype = Object.create(InteractiveWindow.prototype);
SkillWindow.prototype.constructor = SkillWindow;

SkillWindow.prototype.setSkillValue = function(which, value, percentage) {

  /*
   * Function SkillWindow.setSkillValue
   * Updates the skill value with a new provided value
   */

  // Select the appropriate skill wrapper element
  let span = "div[skill=" + which + "]";
 
  // Select it from the skill window body
  let skill = this.__element.querySelector(span).querySelector(".skill");

  if(skill !== null) {
    skill.innerHTML = value.formatNumber();
  }

  // See if there is a bar
  let bar = this.__element.querySelector(span).querySelector(".bar");

  // Also update the bar element
  if(bar === null) {
    return;
  }

  // Update the DOM properties
  bar.title = "You need %s% to advance.".format(Math.ceil(100 - percentage));
  bar.children[0].style.width = percentage + "%";

}