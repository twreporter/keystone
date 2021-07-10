var FieldType = require('../Type');
var util = require('util');

/**
 * Preview FieldType Constructor
 * @extends Field
 * @api public
 */
function preview(list, path, options) {
  this._nativeType = String;
  preview.super_.call(this, list, path, options);
}
util.inherits(preview, FieldType);

/* Export Field Type */
module.exports = preview;
