var FieldType = require('../Type');
var TextType = require('../text/TextType');
var util = require('util');

/**
 * HTML FieldType Constructor
 * @extends Field
 * @api public
 */
function html (list, path, options) {
	// this._nativeType = String;
	this._defaultSize = 'full';
	this.wysiwyg = options.wysiwyg || false;
	this.height = options.height || 180;
	this._properties = ['wysiwyg', 'height'];
	html.super_.call(this, list, path, options);
}
util.inherits(html, FieldType);

/* Inherit from TextType prototype */
html.prototype.addFilterToQuery = TextType.prototype.addFilterToQuery;


/**
 * Registers the field on the List's Mongoose Schema.
 *
 * Adds String properties for .markdown and .html markdown, and a setter
 * for .markdown that generates html when it is updated.
 *
 * @api public
 */

html.prototype.addToSchema = function () {
	var schema = this.list.schema;

	var paths = this.paths = {
		draft: this._path.append('.draft'),
		html: this._path.append('.html'),
	};

	var markedOptions = this.markedOptions;

	schema.nested[this.path] = true;
	schema.add({
		html: { type: String },
		draft: { type: Object },
	}, this.path + '.');

	this.bindUnderscoreMethods();
};


/**
 * Formats the field value
 *
 * @api public
 */

html.prototype.format = function (item) {
	return item.get(this.paths.html);
};

/**
 * Validates that a value for this field has been provided in a data object
 *
 * Will accept either the field path, or paths.md
 *
 * @api public
 */

html.prototype.inputIsValid = function (data, required, item) {
	if (!(this.path in data || this.paths.draft in data) && item && item.get(this.paths.draft)) {
		return true;
	}
	return (!required || data[this.path] || data[this.paths.draft]) ? true : false;
};


/**
 * Detects whether the field has been modified
 *
 * @api public
 */

html.prototype.isModified = function (item) {
	return item.isModified(this.paths.html);
};


/**
 * Updates the value for this field in the item from a data object
 *
 * Will accept either the field path, or paths.draft
 *
 * @api public
 */

html.prototype.updateItem = function (item, data, callback) {
	var value = this.getValueFromData(data);
	if (value && value !== '') {
		var dObj = JSON.parse(value);
		if (dObj.draft) {
			item.set(this.paths.draft, dObj.draft);
			item.set(this.paths.html, dObj.html);
		}
	}

	process.nextTick(callback);
};


/* Export Field Type */
module.exports = html;
