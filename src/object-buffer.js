const ObjectBuffer = function() {

  /*
   * Class ObjectBuffer
   * Container for Tibia.dat that contains item information and pointers to sprites
   *
   * API:
   *
   * @ObjectBuffer.prototype.SIGNATURE - the signature of the Tibia.dat file
   * @ObjectBuffer.prototype.getOutfit(id) - returns an outfit with a particular identifier
   * @ObjectBuffer.prototype.getAnimation(id) - returns an animation with a particular identifier
   * @ObjectBuffer.prototype.getAnimationId(id) - returns the true Tibia.dat identifier of an animation
   * @ObjectBuffer.prototype.getDistanceAnimation(id) - returns a distance animation with a particular identifier
   * @ObjectBuffer.prototype.getDistanceAnimationId(id) - returns the true Tibia.dat identifier of a distance animation
   * @ObjectBuffer.prototype.get(id) - returns the data object from an identifier
   * @ObjectBuffer.prototype.load(name, event) - loads the Tibia.dat file from a filename and reader event
   *
   *
   */

  // Save reference to all objects
  this.dataObjects = new Object();
  this.__version = null;

}

ObjectBuffer.prototype.SIGNATURES = new Object({
  "42A3": 1098,
  "41BF619C": 740
});

ObjectBuffer.prototype.attributes = new Object({
  "ThingAttrGround": 0,
  "ThingAttrGroundBorder": 1,
  "ThingAttrOnBottom": 2,
  "ThingAttrOnTop": 3,
  "ThingAttrContainer": 4,
  "ThingAttrStackable": 5,
  "ThingAttrForceUse": 6,
  "ThingAttrMultiUse": 7,
  "ThingAttrWritable": 8,
  "ThingAttrWritableOnce": 9,
  "ThingAttrFluidContainer": 10,
  "ThingAttrSplash": 11,
  "ThingAttrNotWalkable": 12,
  "ThingAttrNotMoveable": 13,
  "ThingAttrBlockProjectile": 14,
  "ThingAttrNotPathable": 15,
  "ThingAttrPickupable": 16,
  "ThingAttrHangable": 17,
  "ThingAttrHookSouth": 18,
  "ThingAttrHookEast": 19,
  "ThingAttrRotateable": 20,
  "ThingAttrLight": 21,
  "ThingAttrDontHide": 22,
  "ThingAttrTranslucent": 23,
  "ThingAttrDisplacement": 24,
  "ThingAttrElevation": 25,
  "ThingAttrLyingCorpse": 26,
  "ThingAttrAnimateAlways": 27,
  "ThingAttrMinimapColor": 28,
  "ThingAttrLensHelp": 29,
  "ThingAttrFullGround": 30,
  "ThingAttrLook": 31,
  "ThingAttrCloth": 32,
  "ThingAttrMarket": 33,
  "ThingAttrUsable": 34,
  "ThingAttrWrapable": 35,
  "ThingAttrUnwrapable": 36,
  "ThingAttrTopEffect": 37,
  "ThingAttrOpacity": 100,
  "ThingAttrNotPreWalkable": 101,
  "ThingAttrFloorChange": 252,
  "ThingAttrNoMoveAnimation": 253,
  "ThingAttrChargeable": 254,
  "ThingAttrLast": 255
});

ObjectBuffer.prototype.getOutfit = function(id) {

  /*
   * Function ObjectBuffer.getOutfit
   * Returns the data object that belongs to an outfit with identifier: id
   */

  // Invalid
  if(id < 0 || id > this.outfitCount) {
    return null;
  }

  return this.get(this.__getOutfitIdentifier(id));

}

ObjectBuffer.prototype.getAnimation = function(id) {

  /*
   * Function ObjectBuffer.getAnimation
   * Returns the internal outfit identifier of an external outfit identifier 
   */

  // Invalid
  if(id < 0 || id > this.effectCount) {
    return null;
  }

  return this.get(this.getAnimationId(id));

}

ObjectBuffer.prototype.getAnimationId = function(id) {

  /*
   * Function ObjectBuffer.getAnimationId
   * Returns the internal animation identifier of an external animation identifier 
   */

  if(id < 1 || id > this.effectCount) {
    return null;
  }

  return this.itemCount + this.outfitCount + id;

}

ObjectBuffer.prototype.getDistanceAnimationId = function(id) {

  /*
   * Function ObjectBuffer.getDistanceAnimationId
   * Returns the internal animation identifier of an external animation identifier 
   */

  // Invalid identifiers
  if(id < 1 || id > this.distanceCount) {
    return null;
  }

  return this.itemCount + this.outfitCount + this.effectCount + id;

}

ObjectBuffer.prototype.getDistanceAnimation = function(id) {

  /*
   * Function ObjectBuffer.getDistanceAnimation
   * Returns the internal animation identifier of an external animation identifier 
   */

  return this.get(this.getDistanceAnimationId(id));

}

ObjectBuffer.prototype.get = function(id) {

  /*
   * ObjectBuffer.get
   * Returns an item identifier from the buffer if it exists
   */

  // Does not exist?
  if(!this.dataObjects.hasOwnProperty(id)) {
    return null;
  }

  return this.dataObjects[id];

}

ObjectBuffer.prototype.load = function(name, event) {

  /*
   * Function ObjectBuffer.load
   * Reads Tibia.dat file with the item information
   */

  try {
    this.__load(name, event.target.result);
    gameClient.database.storeFile(name, event.target.result);
  } catch(exception) {
    gameClient.interface.modalManager.open("floater-connecting", exception);
  }

}

ObjectBuffer.prototype.__getOutfitIdentifier = function(id) {

  /*
   * Function ObjectBuffer.__getOutfitIdentifier
   * Returns the internal outfit identifier of an external outfit identifier 
   */

  // Outfit definitions come after all of the items
  return this.itemCount + id;

}

ObjectBuffer.prototype.__isOutfit = function(id) {

  /*
   * Function ObjectBuffer.__isOutfit
   * Returns whether the current item is an outfit
   */

  return id > this.itemCount && id <= (this.itemCount + this.outfitCount);

}

ObjectBuffer.prototype.__hasFrameGroups = function(id) {

  /*
   * Function ObjectBuffer.__hasFrameGroups
   * Returns true if the data object has frame groups and is an outfit
   */

  return this.__version >= 1050 && this.__isOutfit(id);

}

ObjectBuffer.prototype.__load = function(name, buffer) {

  /*
   * Function ObjectBuffer.__load
   * Loads Tibia.dat to a data structure in memory
   */

  let start = performance.now();

  // Wrap the buffer in a packet reader class
  let packet = new PacketReader(buffer);

  // Read the signature from the file
  let signature = packet.readUInt32().toString(16).toUpperCase();

  // Verify the 4 byte data signature
  if(!this.SIGNATURES.hasOwnProperty(signature)) {
    throw("Unknown Tibia.dat file supplied.");
  }

  this.__version = this.SIGNATURES[signature];

  // Number of outfits, effects, and distance effects
  this.itemCount = packet.readUInt16();
  this.outfitCount = packet.readUInt16();
  this.effectCount = packet.readUInt16();
  this.distanceCount = packet.readUInt16();

  this.totalObjectCount = (this.itemCount + this.outfitCount + this.effectCount + this.distanceCount);

  // Item identifiers start at 100. Do not ask me why..
  for(let id = 100; id <= this.totalObjectCount; id++) {

    // Create a new data object
    let dataObject = new DataObject(this.__readFlags(packet));

    // Update the group count if this is an outfit
    dataObject.setGroupCount(this.__hasFrameGroups(id) ? packet.readUInt8() : 1);

    // Should increment over the group count: do not use index..
    for(let _ = 0; _ < dataObject.groupCount; _++) {

      // Create a new frame group
      let frameGroup = new FrameGroup();

      frameGroup.type = this.__hasFrameGroups(id) ? packet.readUInt8() : 0;

      // Read sprite parameters: this defines the width and height (e.g. 64x64 pillar/wall)
      let width = packet.readUInt8();
      let height = packet.readUInt8();

      // Set the size
      frameGroup.setSize(width, height);

      // If big then skip the following byte
      if(width > 1 || height > 1) {
        packet.readUInt8();
      }

      // Some frames are blended (e.g. the combination of multiple sprites
      frameGroup.setLayers(packet.readUInt8());

      let x = packet.readUInt8();
      let y = packet.readUInt8();
      let z = (this.__version > 740) ? packet.readUInt8() : 1;

      // Next three bytes are x, y, z patterns
      frameGroup.setPattern(x, y, z);

      frameGroup.setAnimationLength(packet.readUInt8());

      // These are frame durations: read them!
      if(frameGroup.isAnimated() && this.__version > 740) {

        let animationLengths = new Array();

        frameGroup.asynchronous = packet.readUInt8();
        frameGroup.nLoop = packet.readUInt32()
        frameGroup.start = packet.readInt8();

        // Read the animation lengths
        for(let i = 0; i < frameGroup.animationLength; i++) {
          animationLengths.push(packet.readAnimationLength());
        }

        frameGroup.setAnimation(animationLengths);

      }

      // Read all the sprite identifiers
      for(let i = 0; i < frameGroup.getNumberSprites(); i++) {
		frameGroup.sprites.push(this.__version > 740 ? packet.readUInt32() : packet.readUInt16());
      }

      dataObject.frameGroups.push(frameGroup);

    }

    // Reference in a hashmap by identifier
    this.dataObjects[id] = dataObject;

  }

  this.__createLoopedAnimations();

  console.log("Completed loading %s data objects in %s miliseconds.".format(this.totalObjectCount, Math.round(performance.now() - start)))

  gameClient.interface.loadAssetCallback("data", name);

}

ObjectBuffer.prototype.__createLoopedAnimations = function() {

  LoopedAnimation.prototype.DRAWBLOOD = new LoopedAnimation(this.getAnimationId(1));
  LoopedAnimation.prototype.LOSEENERGY = new LoopedAnimation(this.getAnimationId(2));
  LoopedAnimation.prototype.POFF = new LoopedAnimation(this.getAnimationId(3));
  LoopedAnimation.prototype.BLOCKHIT = new LoopedAnimation(this.getAnimationId(4));
  LoopedAnimation.prototype.EXPLOSIONAREA = new LoopedAnimation(this.getAnimationId(5));
  LoopedAnimation.prototype.EXPLOSIONHIT = new LoopedAnimation(this.getAnimationId(6));
  LoopedAnimation.prototype.FIREAREA = new LoopedAnimation(this.getAnimationId(7));
  LoopedAnimation.prototype.YELLOW_RINGS = new LoopedAnimation(this.getAnimationId(8));
  LoopedAnimation.prototype.GREEN_RINGS = new LoopedAnimation(this.getAnimationId(9));
  LoopedAnimation.prototype.HITAREA = new LoopedAnimation(this.getAnimationId(10));
  LoopedAnimation.prototype.TELEPORT = new LoopedAnimation(this.getAnimationId(11));
  LoopedAnimation.prototype.ENERGYHIT = new LoopedAnimation(this.getAnimationId(12));
  LoopedAnimation.prototype.MAGIC_BLUE = new LoopedAnimation(this.getAnimationId(13));
  LoopedAnimation.prototype.MAGIC_RED = new LoopedAnimation(this.getAnimationId(14));
  LoopedAnimation.prototype.MAGIC_GREEN = new LoopedAnimation(this.getAnimationId(15));
  LoopedAnimation.prototype.HITBYFIRE = new LoopedAnimation(this.getAnimationId(16));
  LoopedAnimation.prototype.HITBYPOISON = new LoopedAnimation(this.getAnimationId(17));
  LoopedAnimation.prototype.MORTAREA = new LoopedAnimation(this.getAnimationId(18));
  LoopedAnimation.prototype.SOUND_GREEN = new LoopedAnimation(this.getAnimationId(19));
  LoopedAnimation.prototype.SOUND_RED = new LoopedAnimation(this.getAnimationId(20));
  LoopedAnimation.prototype.POISONAREA = new LoopedAnimation(this.getAnimationId(21));
  LoopedAnimation.prototype.SOUND_YELLOW = new LoopedAnimation(this.getAnimationId(22));
  LoopedAnimation.prototype.SOUND_PURPLE = new LoopedAnimation(this.getAnimationId(23));
  LoopedAnimation.prototype.SOUND_BLUE = new LoopedAnimation(this.getAnimationId(24));
  LoopedAnimation.prototype.SOUND_WHITE = new LoopedAnimation(this.getAnimationId(25));

}

ObjectBuffer.prototype.__mapVersionFlag = function(flag) {

  /*
   * Function ObjectBuffer.__mapVersionFlag
   * Conversion to map the right flag in the right Tibia.dat versions (taken from RME/EDUBART)
   */

  // This always means the final flag regardless of the version
  if(flag === this.attributes.ThingAttrLast) {
    return flag;
  }

  // Specific .dat version handling
  if(this.__version >= 1000) {

    if(flag === 16) {
      return this.attributes.ThingAttrNoMoveAnimation;
    } else if(flag > 16) {
      return flag - 1;	
    }

  } else if(this.__version >= 740) {

    // Increment flags 1 to 15
    if(flag > 0 && flag <= 15) {
      if(flag === 5) return this.attributes.ThingAttrMultiUse;
      if(flag === 6) return this.attributes.ThingAttrForceUse;
      return flag + 1;
    } else {
    
      // Switch around some flags
      switch(flag) {
        case 16: return this.attributes.ThingAttrLight;
        case 17: return this.attributes.ThingAttrFloorChange;
        case 18: return this.attributes.ThingAttrFullGround;
        case 19: return this.attributes.ThingAttrElevation;
        case 20: return this.attributes.ThingAttrDisplacement;
        case 22: return this.attributes.ThingAttrMinimapColor;
        case 23: return this.attributes.ThingAttrRotateable;
        case 24: return this.attributes.ThingAttrLyingCorpse;
        case 25: return this.attributes.ThingAttrHangable;
        case 26: return this.attributes.ThingAttrHookSouth;
        case 27: return this.attributes.ThingAttrHookEast;
        case 28: return this.attributes.ThingAttrAnimateAlways;
      }
    }

  }

  return flag;

}

ObjectBuffer.prototype.__readFlags = function(packet) {

  /*
   * Function ObjectBuffer.__readFlags
   * Reads specific flags of that are configured for the data object
   */

  let flags = new PropBitFlag();
  let properties = new Object();

  // Read all the data file flags
  while(true) {

    let flag = this.__mapVersionFlag(packet.readUInt8());

    switch(flag) {

      // End byte: we are finished reading the data flags
      case this.attributes.ThingAttrLast: {
        return new Object({ flags, properties });
      }

      case this.attributes.ThingAttrGround: {
        flags.set(PropBitFlag.prototype.flags.DatFlagGround);
        properties.speed = packet.readUInt16();
        break;
      }

      case this.attributes.ThingAttrGroundBorder: {
        flags.set(PropBitFlag.prototype.flags.DatFlagGroundBorder);
        break;
      }

      case this.attributes.ThingAttrOnBottom: {
        flags.set(PropBitFlag.prototype.flags.DatFlagOnBottom);
        break;
      }

      case this.attributes.ThingAttrOnTop: {
        flags.set(PropBitFlag.prototype.flags.DatFlagOnTop);
        break;
      }

      case this.attributes.ThingAttrContainer: {
        flags.set(PropBitFlag.prototype.flags.DatFlagContainer);
        break;
      }

      case this.attributes.ThingAttrStackable: {
        flags.set(PropBitFlag.prototype.flags.DatFlagStackable);
        break;
      }

      case this.attributes.ThingAttrForceUse: {
        flags.set(PropBitFlag.prototype.flags.DatFlagForceUse);
        break;
      }

      case this.attributes.ThingAttrMultiUse: {
        flags.set(PropBitFlag.prototype.flags.DatFlagMultiUse);
        break;
      }

      case this.attributes.ThingAttrWritable: {
        flags.set(PropBitFlag.prototype.flags.DatFlagWritable);
        let length = packet.readUInt16();
        break;
      }

      case this.attributes.ThingAttrWritableOnce: {
        flags.set(PropBitFlag.prototype.flags.DatFlagWritableOnce);
        let length = packet.readUInt16();
        break;
      }

      case this.attributes.ThingAttrFluidContainer: {
        flags.set(PropBitFlag.prototype.flags.DatFlagFluidContainer);
        break;
      }

      case this.attributes.ThingAttrSplash: {
        flags.set(PropBitFlag.prototype.flags.DatFlagSplash);
        break;
      }

      case this.attributes.ThingAttrNotWalkable: {
        flags.set(PropBitFlag.prototype.flags.DatFlagNotWalkable);
        break;
      }

      case this.attributes.ThingAttrNotMoveable: {
        flags.set(PropBitFlag.prototype.flags.DatFlagNotMoveable);
        break;
      }

      case this.attributes.ThingAttrBlockProjectile: {
        flags.set(PropBitFlag.prototype.flags.DatFlagBlockProjectile);
        break;
      }

      case this.attributes.ThingAttrNotPathable: {
        flags.set(PropBitFlag.prototype.flags.DatFlagNotPathable);
        break;
      }

      case this.attributes.ThingAttrPickupable: {
        flags.set(PropBitFlag.prototype.flags.DatFlagPickupable);
        break;
      }

      case this.attributes.ThingAttrHangable: {
        flags.set(PropBitFlag.prototype.flags.DatFlagHangable);
        break;
      }

      case this.attributes.ThingAttrHookSouth: {
        flags.set(PropBitFlag.prototype.flags.DatFlagHookSouth);
        break;
      }

      case this.attributes.ThingAttrHookEast: {
        flags.set(PropBitFlag.prototype.flags.DatFlagHookEast);
        break;
      }

      case this.attributes.ThingAttrRotateable: {
        flags.set(PropBitFlag.prototype.flags.DatFlagRotateable);
        break;
      }

      case this.attributes.ThingAttrLight: {
        flags.set(PropBitFlag.prototype.flags.DatFlagLight);
        properties.light = packet.readLight();
        break;
      }

      case this.attributes.ThingAttrDontHide: {
        flags.set(PropBitFlag.prototype.flags.DatFlagDontHide);
        break;
      }

      case this.attributes.ThingAttrTranslucent: {
        flags.set(PropBitFlag.prototype.flags.DatFlagTranslucent);
        break;
      }

      case this.attributes.ThingAttrDisplacement: {
        flags.set(PropBitFlag.prototype.flags.DatFlagDisplacement);
        if(this.__version >= 755) {
          packet.readLight();
        }
        break;
      }

      case this.attributes.ThingAttrElevation: {
        flags.set(PropBitFlag.prototype.flags.DatFlagElevation);
        properties.elevation = packet.readUInt16();
        break;
      }

      case this.attributes.ThingAttrLyingCorpse: {
        flags.set(PropBitFlag.prototype.flags.DatFlagLyingCorpse);
        break;
      }

      case this.attributes.ThingAttrAnimateAlways: {
        flags.set(PropBitFlag.prototype.flags.DatFlagAnimateAlways);
        break;
      }

      case this.attributes.ThingAttrMinimapColor: {
        flags.set(PropBitFlag.prototype.flags.DatFlagMinimapColor);
        properties.minimapColor = packet.readUInt16();
        break;
      }

      case this.attributes.ThingAttrLensHelp: {
        flags.set(PropBitFlag.prototype.flags.DatFlagLensHelp);
        packet.readUInt16();
        break;
      }

      // Not implemented
      case this.attributes.ThingAttrFullGround: {
        break;
      }

      case this.attributes.ThingAttrLook: {
        break;
      }

      case this.attributes.ThingAttrCloth: {
        packet.readUInt16();
        break;
      }

      case this.attributes.ThingAttrMarket: {
        packet.skip(6);
        packet.readString();
        packet.skip(4);
        break;
      }

      case this.attributes.ThingAttrUsable: {
        packet.readUInt16();
        break;
      }

      case this.attributes.ThingAttrWrapable: {
        break;
      }

      case this.attributes.ThingAttrUnwrapable: {
        break;
      }

      case this.attributes.ThingAttrTopEffect: {
        break;
      }

      case this.attributes.ThingAttrOpacity: {
        break;
      }

      case this.attributes.ThingAttrNotPreWalkable: {
        break;
      }

      case this.attributes.ThingAttrFloorChange: {
        break;
      }

      case this.attributes.ThingAttrNoMoveAnimation: {
        break;
      }

      case this.attributes.ThingAttrChargeable: {
        break;
      }

      default: {
        throw("Could not parse flag " + flag.toString(16) + " of Tibia.dat");
      }

    }

  }

}
