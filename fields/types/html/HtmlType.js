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
	console.log("addToSchema");
	var schema = this.list.schema;

	var paths = this.paths = {
		// md: this._path.append('.md'),
		draft: this._path.append('.draft'),
		// draftHistory: this._path.append('.draftHistory'),
		html: this._path.append('.html'),
	};

	var markedOptions = this.markedOptions;

	// var setDraft = function (val) {
	// 	if (val && val.draft && val.html) {
	// 		console.log("\n setDraft", val.draft, typeof(val.draft));
	// 		console.log("\n setHtml", val.html);
	// 		this.set(paths.draft, JSON.stringify(val.draft));
	// 		this.set(paths.html, val.html);
	// 	}
	// 	return JSON.stringify(val.draft);
	// };
	console.log("this.path", this.path);

	schema.nested[this.path] = true;
	schema.add({
		html: { type: String },
		// md: { type: String, set: setMarkdown },
		draft: { type: Object },
		// draftHistory: { type: Array, set: setMarkdown },
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
	console.log("updateItem");
	if (value && value !== '') {
		var dObj = JSON.parse(value);
		console.log("\n *** data:", data, "\n *** dObj:", dObj);
		console.log("\n *** value.draft:", dObj.draft);
		if (dObj.draft) {
			item.set(this.paths.draft, dObj.draft);
			item.set(this.paths.html, dObj.html);
		}
		// if (data) {
		// 	item.set(this.paths.draft, value.draft);
		// } else if (this.paths.draft in data) {
		// 	item.set(this.paths.draft, data[this.paths.draft]);
		// }
	}

	process.nextTick(callback);
};


/* Export Field Type */
module.exports = html;
