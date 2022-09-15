// namespaces
var dwv = dwv || {};
dwv.dicom = dwv.dicom || {};

/**
 * Immutable tag.
 *
 * @class
 * @param {string} group The tag group as '0x####'.
 * @param {string} element The tag element as '0x####'.
 */
dwv.dicom.Tag = function (group, element) {
  /**
   * Get the tag group.
   *
   * @returns {string} The tag group.
   */
  this.getGroup = function () {
    return group;
  };
  /**
   * Get the tag element.
   *
   * @returns {string} The tag element.
   */
  this.getElement = function () {
    return element;
  };
}; // Tag class

/**
 * Check for Tag equality.
 *
 * @param {dwv.dicom.Tag} rhs The other tag to compare to.
 * @returns {boolean} True if both tags are equal.
 */
dwv.dicom.Tag.prototype.equals = function (rhs) {
  return rhs !== null &&
    this.getGroup() === rhs.getGroup() &&
    this.getElement() === rhs.getElement();
};

/**
 * Check for Tag equality.
 *
 * @param {object} rhs The other tag to compare to provided as a simple object.
 * @returns {boolean} True if both tags are equal.
 */
dwv.dicom.Tag.prototype.equals2 = function (rhs) {
  if (rhs === null ||
    typeof rhs.group === 'undefined' ||
    typeof rhs.element === 'undefined') {
    return false;
  }
  return this.equals(new dwv.dicom.Tag(rhs.group, rhs.element));
};

/**
 * Get the group-element key used to store DICOM elements.
 *
 * @returns {string} The key as 'x########'.
 */
dwv.dicom.Tag.prototype.getKey = function () {
  // group and element are in the '0x####' form
  return 'x' + this.getGroup().substring(2) + this.getElement().substring(2);
};

/**
 * Get a simplified group-element key.
 *
 * @returns {string} The key as '########'.
 */
dwv.dicom.Tag.prototype.getKey2 = function () {
  // group and element are in the '0x####' form
  return this.getGroup().substring(2) + this.getElement().substring(2);
};

/**
 * Get the group name as defined in dwv.dicom.TagGroups.
 *
 * @returns {string} The name.
 */
dwv.dicom.Tag.prototype.getGroupName = function () {
  // group is in the '0x####' form
  // TagGroups include the x
  return dwv.dicom.TagGroups[this.getGroup().substring(1)];
};


/**
 * Split a group-element key used to store DICOM elements.
 *
 * @param {string} key The key in form "x00280102" as generated by tag::getKey.
 * @returns {object} The DICOM tag.
 */
dwv.dicom.getTagFromKey = function (key) {
  return new dwv.dicom.Tag(key.substring(1, 5), key.substring(5, 9));
};

/**
 * Does this tag have a VR.
 * Basically the Item, ItemDelimitationItem and SequenceDelimitationItem tags.
 *
 * @returns {boolean} True if this tag has a VR.
 */
dwv.dicom.Tag.prototype.isWithVR = function () {
  var element = this.getElement();
  return !(this.getGroup() === '0xFFFE' &&
    (element === '0xE000' || element === '0xE00D' || element === '0xE0DD')
  );
};

/**
 * Is the tag group a private tag group ?
 * see: http://dicom.nema.org/medical/dicom/2015a/output/html/part05.html#sect_7.8
 *
 * @returns {boolean} True if the tag group is private,
 *   ie if its group is an odd number.
 */
dwv.dicom.Tag.prototype.isPrivate = function () {
  // group is in the '0x####' form
  var groupNumber = parseInt(this.getGroup().substring(2), 16);
  return groupNumber % 2 === 1;
};

/**
 * Get the tag info from the dicom dictionary.
 *
 * @returns {Array} The info as [vr, multiplicity, name].
 */
dwv.dicom.Tag.prototype.getInfoFromDictionary = function () {
  var info = null;
  if (typeof dwv.dicom.dictionary[this.getGroup()] !== 'undefined' &&
    typeof dwv.dicom.dictionary[this.getGroup()][this.getElement()] !==
      'undefined') {
    info = dwv.dicom.dictionary[this.getGroup()][this.getElement()];
  }
  return info;
};

/**
 * Get the tag Value Representation (VR) from the dicom dictionary.
 *
 * @returns {string} The VR.
 */
dwv.dicom.Tag.prototype.getVrFromDictionary = function () {
  var vr = null;
  var info = this.getInfoFromDictionary();
  if (info !== null) {
    vr = info[0];
  }
  return vr;
};

/**
 * Get the tag name from the dicom dictionary.
 *
 * @returns {string} The VR.
 */
dwv.dicom.Tag.prototype.getNameFromDictionary = function () {
  var name = null;
  var info = this.getInfoFromDictionary();
  if (info !== null) {
    name = info[2];
  }
  return name;
};

/**
 * Get the TransferSyntaxUID Tag.
 *
 * @returns {object} The tag.
 */
dwv.dicom.getTransferSyntaxUIDTag = function () {
  return new dwv.dicom.Tag('0x0002', '0x0010');
};

/**
 * Get the FileMetaInformationGroupLength Tag.
 *
 * @returns {object} The tag.
 */
dwv.dicom.getFileMetaInformationGroupLengthTag = function () {
  return new dwv.dicom.Tag('0x0002', '0x0000');
};

/**
 * Is the input tag the FileMetaInformationGroupLength Tag.
 *
 * @param {dwv.dicom.Tag} tag The tag to test.
 * @returns {boolean} True if the asked tag.
 */
dwv.dicom.isFileMetaInformationGroupLengthTag = function (tag) {
  return tag.equals(dwv.dicom.getFileMetaInformationGroupLengthTag());
};

/**
 * Get the Item Tag.
 *
 * @returns {dwv.dicom.Tag} The tag.
 */
dwv.dicom.getItemTag = function () {
  return new dwv.dicom.Tag('0xFFFE', '0xE000');
};

/**
 * Is the input tag the Item Tag.
 *
 * @param {dwv.dicom.Tag} tag The tag to test.
 * @returns {boolean} True if the asked tag.
 */
dwv.dicom.isItemTag = function (tag) {
  return tag.equals(dwv.dicom.getItemTag());
};

/**
 * Get the ItemDelimitationItem Tag.
 *
 * @returns {dwv.dicom.Tag} The tag.
 */
dwv.dicom.getItemDelimitationItemTag = function () {
  return new dwv.dicom.Tag('0xFFFE', '0xE00D');
};

/**
 * Is the input tag the ItemDelimitationItem Tag.
 *
 * @param {dwv.dicom.Tag} tag The tag to test.
 * @returns {boolean} True if the asked tag.
 */
dwv.dicom.isItemDelimitationItemTag = function (tag) {
  return tag.equals(dwv.dicom.getItemDelimitationItemTag());
};

/**
 * Get the SequenceDelimitationItem Tag.
 *
 * @returns {dwv.dicom.Tag} The tag.
 */
dwv.dicom.getSequenceDelimitationItemTag = function () {
  return new dwv.dicom.Tag('0xFFFE', '0xE0DD');
};

/**
 * Is the input tag the SequenceDelimitationItem Tag.
 *
 * @param {dwv.dicom.Tag} tag The tag to test.
 * @returns {boolean} True if the asked tag.
 */
dwv.dicom.isSequenceDelimitationItemTag = function (tag) {
  return tag.equals(dwv.dicom.getSequenceDelimitationItemTag());
};

/**
 * Get the PixelData Tag.
 *
 * @returns {dwv.dicom.Tag} The tag.
 */
dwv.dicom.getPixelDataTag = function () {
  return new dwv.dicom.Tag('0x7FE0', '0x0010');
};

/**
 * Is the input tag the PixelData Tag.
 *
 * @param {dwv.dicom.Tag} tag The tag to test.
 * @returns {boolean} True if the asked tag.
 */
dwv.dicom.isPixelDataTag = function (tag) {
  return tag.equals(dwv.dicom.getPixelDataTag());
};

/**
 * Get a tag from the dictionary using a tag string name.
 *
 * @param {string} tagName The tag string name.
 * @returns {object} The tag object.
 */
dwv.dicom.getTagFromDictionary = function (tagName) {
  var group = null;
  var element = null;
  var dict = dwv.dicom.dictionary;
  var keys0 = Object.keys(dict);
  var keys1 = null;
  // label for nested loop break
  outLabel:
  // search through dictionary
  for (var k0 = 0, lenK0 = keys0.length; k0 < lenK0; ++k0) {
    group = keys0[k0];
    keys1 = Object.keys(dict[group]);
    for (var k1 = 0, lenK1 = keys1.length; k1 < lenK1; ++k1) {
      element = keys1[k1];
      if (dict[group][element][2] === tagName) {
        break outLabel;
      }
    }
  }
  var tag = null;
  if (group !== null && element !== null) {
    tag = new dwv.dicom.Tag(group, element);
  }
  return tag;
};
