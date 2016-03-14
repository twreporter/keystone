var FieldType = require('../Type');
var TextType = require('../text/TextType');
var util = require('util');

/**
 * HTML FieldType Constructor
 * @extends Field
 * @api public
 */
function html (list, path, options) {
	this._nativeType = String;
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

// html.prototype.addToSchema = function () {
//
// 	var schema = this.list.schema;
//
// 	var paths = this.paths = {
// 		// md: this._path.append('.md'),
// 		draft: this._path.append('.draft'),
// 		// draftHistory: this._path.append('.draftHistory'),
// 		html: this._path.append('.html'),
// 	};
//
// 	var markedOptions = this.markedOptions;
//
// 	var setDraft = function (value) {
// 		this.set(paths.html, value);
// 		return value;
// 	};
//
// 	schema.nested[this.path] = true;
// 	schema.add({
// 		html: { type: String },
// 		// md: { type: String, set: setMarkdown },
// 		draft: { type: Object, set: setDraft },
// 		// draftHistory: { type: Array, set: setMarkdown },
// 	}, this.path + '.');
//
// 	this.bindUnderscoreMethods();
// };


/* Export Field Type */
module.exports = html;
