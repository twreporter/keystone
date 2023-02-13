var FieldType = require('../Type');
var NumberType = require('../number/NumberType');
var util = require('util');

/**
 * HTML FieldType Constructor
 * @extends Field
 * @api public
 */
function tag(list, path, options) {
  this._nativeType = Number;
  tag.super_.call(this, list, path, options);
}
util.inherits(tag, FieldType);

/* Inherit from NumberType prototype */
tag.prototype.addFilterToQuery = NumberType.prototype.addFilterToQuery;

/* Export Field Type */
module.exports = tag;
