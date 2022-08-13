var FieldType = require('../Type');
var TextType = require('../text/TextType');
var keystone = require('../../../');
var util = require('util');

/**
 * HTML FieldType Constructor
 * @extends Field
 * @api public
 */
function categorySet(list, path, options) {
  this._nativeType = [{
    category: {id: keystone.mongoose.Schema.Types.ObjectId, name: String},
    subcategory: {id: keystone.mongoose.Schema.Types.ObjectId, name: String}
  }];
  this._defaultSize = 'full';
  categorySet.super_.call(this, list, path, options);
}
util.inherits(categorySet, FieldType);

/* Inherit from TextType prototype */
categorySet.prototype.addFilterToQuery = TextType.prototype.addFilterToQuery;

/**
 * Updates the value for this field in the item from a data object
 *
 * Will accept either the field path, or paths.draft
 *
 * @api public
 */

categorySet.prototype.updateItem = function(item, data, callback) {
  var value = this.getValueFromData(data);
  if (value && value !== '') {
    var dObj = {};
    try {
      dObj = JSON.parse(value);
    } catch (err) {
      console.error('Error to JSON.parse:', err);
    }
    item.set(this.path, Array.isArray(dObj) ? dObj : []);
  }

  process.nextTick(callback);
};


/* Export Field Type */
module.exports = categorySet;
