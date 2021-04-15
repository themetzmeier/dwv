// namespaces
var dwv = dwv || {};

/**
 * View controller.
 *
 * @param {dwv.image.View} view The associated view.
 * @class
 */
dwv.ViewController = function (view) {
  // closure to self
  var self = this;
  // Slice/frame player ID (created by setInterval)
  var playerID = null;

  /**
   * Initialise the controller.
   */
  this.initialise = function () {
    // set window/level to first preset
    this.setWindowLevelPresetById(0);
    // default position
    this.setCurrentPosition2D(0, 0);
  };

  /**
   * Get the window/level presets names.
   *
   * @returns {Array} The presets names.
   */
  this.getWindowLevelPresetsNames = function () {
    return view.getWindowPresetsNames();
  };

  /**
   * Add window/level presets to the view.
   *
   * @param {object} presets A preset object.
   * @returns {object} The list of presets.
   */
  this.addWindowLevelPresets = function (presets) {
    return view.addWindowPresets(presets);
  };

  /**
   * Set the window level to the preset with the input name.
   *
   * @param {string} name The name of the preset to activate.
   */
  this.setWindowLevelPreset = function (name) {
    view.setWindowLevelPreset(name);
  };

  /**
   * Set the window level to the preset with the input id.
   *
   * @param {number} id The id of the preset to activate.
   */
  this.setWindowLevelPresetById = function (id) {
    view.setWindowLevelPresetById(id);
  };

  /**
   * Check if the controller is playing.
   *
   * @returns {boolean} True is the controler is playing slices/frames.
   */
  this.isPlaying = function () {
    return (playerID !== null);
  };

  /**
   * Get the current position.
   *
   * @returns {object} The position.
   */
  this.getCurrentPosition = function () {
    return view.getCurrentPosition();
  };

  /**
   * Get the current position.
   *
   * @returns {object} The position.
   */
  this.getCurrentPositionAsObject = function () {
    return view.getCurrentPositionAsObject();
  };

  /**
   * Get the current spacing.
   *
   * @returns {Array} The 2D spacing.
   */
  this.get2DSpacing = function () {
    var spacing = view.getImage().getGeometry().getSpacing();
    return [spacing.getColumnSpacing(), spacing.getRowSpacing()];
  };

  /**
   * Get some values from the associated image in a region.
   *
   * @param {dwv.math.Point2D} min Minimum point.
   * @param {dwv.math.Point2D} max Maximum point.
   * @returns {Array} A list of values.
   */
  this.getImageRegionValues = function (min, max) {
    var iter = dwv.image.getRegionSliceIterator(
      view.getImage(),
      this.getCurrentPosition(),
      true, min, max
    );
    var values = [];
    if (iter) {
      values = dwv.image.getIteratorValues(iter);
    }
    return values;
  };

  /**
   * Get some values from the associated image in variable regions.
   *
   * @param {Array} regions A list of regions.
   * @returns {Array} A list of values.
   */
  this.getImageVariableRegionValues = function (regions) {
    var iter = dwv.image.getVariableRegionSliceIterator(
      view.getImage(),
      this.getCurrentPosition(),
      true, regions
    );
    var values = [];
    if (iter) {
      values = dwv.image.getIteratorValues(iter);
    }
    return values;
  };

  /**
   * Can the image values be quantified?
   *
   * @returns {boolean} True if possible.
   */
  this.canQuantifyImage = function () {
    return view.getImage().getNumberOfComponents() === 1;
  };

  /**
   * Can window and level be applied to the data?
   *
   * @returns {boolean} True if the data is monochrome.
   */
  this.canWindowLevel = function () {
    return view.getImage().getPhotometricInterpretation()
      .match(/MONOCHROME/) !== null;
  };

  /**
   * Is the data mono-frame?
   *
   * @returns {boolean} True if the data only contains one frame.
   */
  this.isMonoFrameData = function () {
    return view.getImage().getGeometry().getSize().getNumberOfFrames() === 1;
  };

  /**
   * Set the current position.
   *
   * @param {object} pos The position.
   * @param {boolean} silent If true, does not fire a positionchange event.
   * @returns {boolean} False if not in bounds.
   */
  this.setCurrentPosition = function (pos, silent) {
    return view.setCurrentPosition(pos, silent);
  };

  /**
   * Set the current position from an object.
   *
   * @param {object} pos The position.
   * @returns {boolean} False if not in bounds.
   */
  this.setCurrentPositionFromObject = function (pos) {
    return view.setCurrentPositionFromObject(pos);
  };

  /**
   * Set the current 2D (i,j) position.
   *
   * @param {number} i The column index.
   * @param {number} j The row index.
   * @returns {boolean} False if not in bounds.
   */
  this.setCurrentPosition2D = function (i, j) {
    return view.setCurrentPosition(
      new dwv.math.Index([
        i,
        j,
        view.getCurrentPosition().get(2),
        view.getCurrentPosition().get(3)
      ])
    );
  };

  /**
   * Increment the provided dimension.
   *
   * @param {number} dim The dimension to increment.
   * @param {boolean} silent Do not send event.
   * @returns {boolean} False if not in bounds.
   */
  this.incrementIndex = function (dim, silent) {
    var pos = view.getCurrentPosition();
    var values = new Array(pos.length());
    values.fill(0);
    if (dim < values.length) {
      values[dim] = 1;
    } else {
      console.warn('Cannot increment given index: ', dim, values.length);
    }
    var incr = new dwv.math.Index(values);
    return view.setCurrentPosition(pos.add(incr), silent);
  };

  /**
   * Decrement the provided dimension.
   *
   * @param {number} dim The dimension to increment.
   * @param {boolean} silent Do not send event.
   * @returns {boolean} False if not in bounds.
   */
  this.decrementIndex = function (dim, silent) {
    var pos = view.getCurrentPosition();
    var values = new Array(pos.length());
    values.fill(0);
    if (dim < values.length) {
      values[dim] = -1;
    } else {
      console.warn('Cannot decrement given index: ', dim, values.length);
    }
    var incr = new dwv.math.Index(values);
    return view.setCurrentPosition(pos.add(incr), silent);
  };

  /**
   *
   */
  this.play = function () {
    if (playerID === null) {
      var size = view.getImage().getGeometry().getSize();
      var nSlices = size.getNumberOfSlices();
      var nFrames = size.getNumberOfFrames();
      var recommendedDisplayFrameRate =
        view.getImage().getMeta().RecommendedDisplayFrameRate;
      var milliseconds = view.getPlaybackMilliseconds(
        recommendedDisplayFrameRate);

      playerID = setInterval(function () {
        if (nSlices !== 1) {
          if (!self.incrementIndex(2)) {
            var pos1 = self.getCurrentPosition();
            self.setCurrentPosition(
              new dwv.math.Index([
                pos1.get(0),
                pos1.get(1),
                0,
                pos1.get(3)
              ])
            );
          }
        } else if (nFrames !== 1) {
          if (!self.incrementIndex(2)) {
            var pos = self.getCurrentPosition();
            self.setCurrentPosition(
              new dwv.math.Index([
                pos.get(0),
                pos.get(1),
                pos.get(2),
                0
              ])
            );
          }
        }

      }, milliseconds);
    } else {
      this.stop();
    }
  };

  /**
   *
   */
  this.stop = function () {
    if (playerID !== null) {
      clearInterval(playerID);
      playerID = null;
    }
  };

  /**
   * Get the window/level.
   *
   * @returns {object} The window center and width.
   */
  this.getWindowLevel = function () {
    return {
      width: view.getCurrentWindowLut().getWindowLevel().getWidth(),
      center: view.getCurrentWindowLut().getWindowLevel().getCenter()
    };
  };

  /**
   * Set the window/level.
   *
   * @param {number} wc The window center.
   * @param {number} ww The window width.
   */
  this.setWindowLevel = function (wc, ww) {
    view.setWindowLevel(wc, ww);
  };

  /**
   * Get the colour map.
   *
   * @returns {object} The colour map.
   */
  this.getColourMap = function () {
    return view.getColourMap();
  };

  /**
   * Set the colour map.
   *
   * @param {object} colourMap The colour map.
   */
  this.setColourMap = function (colourMap) {
    view.setColourMap(colourMap);
  };

  /**
   * Set the colour map from a name.
   *
   * @param {string} name The name of the colour map to set.
   */
  this.setColourMapFromName = function (name) {
    // check if we have it
    if (!dwv.tool.colourMaps[name]) {
      throw new Error('Unknown colour map: \'' + name + '\'');
    }
    // enable it
    this.setColourMap(dwv.tool.colourMaps[name]);
  };

}; // class dwv.ViewController
