var FieldType = require('../Type');
var TextType = require('../text/TextType');
var util = require('util');

/**
 * HTML FieldType Constructor
 * @extends Field
 * @api public
 */
function tag(list, path, options) {
  this._nativeType = String;
  tag.super_.call(this, list, path, options);
}
util.inherits(tag, FieldType);

/* Inherit from TextType prototype */
tag.prototype.addFilterToQuery = TextType.prototype.addFilterToQuery;

/* Export Field Type */
module.exports = tag;
