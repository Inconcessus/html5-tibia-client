const Friendlist = function() {

  /*
   * Class Friendlist
   * Container for the player friend list
   *
   * API:
   *
   * Friendlist.has(name) - returns true if the friendlist contains a friend by name
   * Friendlist.add(name) - adds a friend with a particular name
   * Friendlist.setOnlineStatus(name, status) - updates the online status of a friend
   * Friendlist.toggleShowOffline() - toggles whether to show offline/online friends
   * Friendlist.sortBy(type) - sets state to sort friendlist by a particular sort algorithm
   *
   */

  // Create a map to keep the information
  this.friends = new Map();

  // Callback used to sort the friendlist before rendering it to the DOM
  this.__sortFunction = this.__nameSort;
  this.__showOffline = true;

}

Friendlist.prototype.has = function(friend) {

  /*
   * Function Friendlist.has
   * Returns true if the friendlist has an entry
   */

  return this.friends.has(friend);

}

Friendlist.prototype.add = function(friend) {

  /*
   * Function Friendlist.add
   * Adds a friend to the friend list
   */

  // Already exists
  if(this.has(friend.name)) {
    return console.error("Friend %s is already in the friend list.".format(friend.name));
  }

  this.friends.set(friend.name, friend.online);
  this.updateDOM();

}

Friendlist.prototype.setOnlineStatus = function(name, online) {

  /*
   * Function Friendlist.setOnlineStatus
   * Sets the online status of a friend
   */

  // Skip if not in the map
  if(!this.has(name)) {
    return;
  }

  // Update the online status
  this.friends.set(name, online);
  this.updateDOM();

}

Friendlist.prototype.sortBy = function(which) {

  /*
   * Function FriendWindow.sortBy
   * Overwrites the internal sort by function
   */

  switch(which) {
    case "normal":
      this.__sortFunction = this.__nameSort;
      break;
    case "reversed":
      this.__sortFunction = this.__reversedNameSort;
      break;
  }

  this.updateDOM();

}

Friendlist.prototype.remove = function(name) {

  /*
   * Function Friendlist.remove
   * Removes a friend from the friend list
   */

  // Update the online status
  if(!this.has(name)) {
    return console.error("Friend %s is not in your friend list.".format(name));
  }

  this.friends.delete(name);
  this.updateDOM();

}

Friendlist.prototype.updateDOM = function() {

  /*
   * Function Friendlist.updateDOM
   * Delegates call to the window manager to update the friend list
   */

  // Deconstruct data
  let array = Array.from(this.friends, this.__deconstructMap).filter(this.__showOfflineFilter, this).sort(this.__sortFunction);

  // Pass it to the interface
  gameClient.interface.windowManager.getWindow("friend-window").generateContent(array);

}

Friendlist.prototype.toggleShowOffline = function() {

  /*
   * Function FriendWindow.toggleShowOffline
   * Toggles the show offline filter
   */

  this.__showOffline = !this.__showOffline;
  this.updateDOM();

}


Friendlist.prototype.__deconstructMap = function([ name, online ]) {

  /*
   * Function FriendWindow.__deconstructMap
   * Deconstructs the friendlist map to an object
   */

  return new Object({ name, online });

}

Friendlist.prototype.__showOfflineFilter = function(x) {

  /*
   * Function FriendWindow.__showOfflineFilter
   * Filter function to show only 
   */

  return x.online || this.__showOffline;

}

Friendlist.prototype.__reversedNameSort = function(a, b) {

  /*
   * Function Friendlist.__nameSort
   * Sorts by online status and names alphabetically second
   */

  return (Number(b.online) - Number(a.online)) || (a.name.toLowerCase() < b.name.toLowerCase());

}

Friendlist.prototype.__nameSort = function(a, b) {

  /*
   * Function Friendlist.__nameSort
   * Sorts by online status and names alphabetically second
   */

  return (Number(b.online) - Number(a.online)) || (a.name.toLowerCase() > b.name.toLowerCase());

}
