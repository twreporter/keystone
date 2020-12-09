/*!
 * Module dependencies.
 */

var _ = require('underscore');
var fs = require('fs');
var gcsHelper = require('../../../lib/gcsHelper');
var keystone = require('../../../');
var moment = require('moment');
var super_ = require('../Type');
var util = require('util');
var utils = require('keystone-utils');

/**
 *  FieldType Constructor
 * @extends Field
 * @api public
 */

function gcsfile (list, path, options) {
	this._underscoreMethods = ['format', 'uploadFile'];
	this._fixedSize = 'full';

	// TODO: implement filtering, usage disabled for now
	options.nofilter = true;

	gcsfile.super_.call(this, list, path, options);

	// validate gcs config (has to happen after super_.call)
	if (!keystone.get('gcs config')) {
		throw new Error('Invalid Configuration\n\n'
			+ 'GcsFile fields (' + list.key + '.' + path + ') require the "gcs config" option to be set.\n\n'
			+ 'See http://keystonejs.com/docs/configuration/#services-gcsfile for more information.\n');
	}
}

/*!
 * Inherit from Field
 */

util.inherits(gcsfile, super_);

/**
 * Exposes the custom or keystone gcs config settings
 */

Object.defineProperty(gcsfile.prototype, 'gcsConfig', {
	get: function () {
		return this.options.gcsConfig || keystone.get('gcs config');
	},
});

/**
 * Registers the field on the List's Mongoose Schema.
 *
 * @api public
 */

gcsfile.prototype.addToSchema = function () {

	var field = this;
	var schema = this.list.schema;

	var paths = this.paths = {
		// fields
		filename: this._path.append('.filename'),
		filetype: this._path.append('.filetype'),
		gcsBucket: this._path.append('.gcsBucket'),
		gcsDir: this._path.append('.gcsDir'),
		size: this._path.append('.size'),
		url: this._path.append('.url'),

		// virtuals
		action: this._path.append('_action'),
		exists: this._path.append('.exists'),
		upload: this._path.append('_upload'),
	};

	var schemaPaths = this._path.addTo({}, {
		filename: String,
		filetype: String,
		gcsBucket: String,
		gcsDir: String,
		size: Number,
		url: String,
	});

	schema.add(schemaPaths);

	var exists = function (item) {
		return (item.get(paths.url) ? true : false);
	};

	// The .exists virtual indicates whether a file is stored
	schema.virtual(paths.exists).get(function () {
		return schemaMethods.exists.apply(this);
	});

	var reset = function (item) {
		item.set(field.path, {
			filename: '',
			filetype: '',
			gcsBucket: '',
			gcsDir: '',
			size: 0,
			url: '',
		});
	};

	var schemaMethods = {
		exists: function () {
			return exists(this);
		},
		/**
		 * Resets the value of the field
		 *
		 * @api public
		 */
		reset: function () {
			reset(this);
		},
		/**
		 * Deletes the file from gcs and resets the field
		 *
		 * @api public
		 */
		delete: function () {
			var _this = this;
			var promise = new Promise(function (resolve, reject) {
				var gcsConfig = field.gcsConfig;
				var bucket = gcsHelper.initBucket(gcsConfig, _this.get(paths.gcsBucket));
				var filename = _this.get(paths.filename);
				if (filename && typeof filename === 'string') {
					bucket.deleteFiles({
						prefix: _this.get(paths.gcsDir) + filename,
					}, function (err) {
						if (err) {
							return reject(err);
						}
						resolve();
					});
				} else {
					resolve();
				}
			});
			reset(this);
			return promise;
		},
	};

	_.each(schemaMethods, function (fn, key) {
		field.underscoreMethod(key, fn);
	});

	// expose a method on the field to call schema methods
	this.apply = function (item, method) {
		return schemaMethods[method].apply(item, Array.prototype.slice.call(arguments, 2));
	};

	this.bindUnderscoreMethods();
};


/**
 * Formats the field value
 *
 * @api public
 */

gcsfile.prototype.format = function (item) {
	if (this.hasFormatter()) {
		return this.options.format(item, item[this.path]);
	}
	return item.get(this.paths.url);
};


/**
 * Detects the field have formatter function
 *
 * @api public
 */

gcsfile.prototype.hasFormatter = function () {
	return typeof this.options.format === 'function';
};


/**
 * Detects whether the field has been modified
 *
 * @api public
 */

gcsfile.prototype.isModified = function (item) {
	return item.isModified(this.paths.url);
};


/**
 * Validates that a value for this field has been provided in a data object
 *
 * @api public
 */

gcsfile.prototype.inputIsValid = function (data) { // eslint-disable-line no-unused-vars
	// TODO - how should file field input be validated?
	return true;
};


/**
 * Updates the value for this field in the item from a data object
 *
 * @api public
 */

gcsfile.prototype.updateItem = function (item, data, callback) { // eslint-disable-line no-unused-vars
	// TODO - direct updating of data (not via upload)
	process.nextTick(callback);
};

/**
 * Uploads the file for this field
 *
 * @api public
 */

gcsfile.prototype.uploadFile = function (item, file, update, callback) {

	var ONE_YEAR = 60 * 60 * 24 * 365;
	var field = this;
	var gcsDir = field.options.destination || '';
	var publicRead = field.options.publicRead || false;
	var prefix = field.options.datePrefix ? moment().format(field.options.datePrefix) + '-' : '';
	var filename = prefix + file.name;
	var filetype = file.mimetype || file.type;

	if (typeof update === 'function') {
		callback = update;
		update = false;
	}

	if (field.options.allowedTypes && !_.contains(field.options.allowedTypes, filetype)) {
		return callback(new Error('Unsupported File Type: ' + filetype));
	}

	var doUpload = function () {

		var bucket = gcsHelper.initBucket(field.gcsConfig, field.options.bucket);
		gcsHelper.uploadFileToBucket(bucket, fs.createReadStream(file.path), {
			destination: gcsDir + filename,
			filetype: filetype,
			publicRead: publicRead,
			cacheControl: 'public, max-age=' + ONE_YEAR,
		}).then(function (response) {
			var fileData = {
				filename: filename,
				filetype: filetype,
				gcsBucket: field.options.bucket,
				gcsDir: gcsDir,
				size: file.size,
				url: gcsHelper.getPublicUrl(field.options.bucket, gcsDir + filename),
			};

			if (update) {
				item.set(field.path, fileData);
			}
			return callback(null, fileData);
		}).catch(function (err) {
			return callback(err);
		});
	};

	doUpload();
};


/**
 * Returns a callback that handles a standard form submission for the field
 *
 * Expected form parts are
 * - `field.paths.action` in `req.body` (`clear` or `delete`)
 * - `field.paths.upload` in `req.files` (uploads the file to gcs)
 *
 * @api public
 */

gcsfile.prototype.getRequestHandler = function (item, req, paths, callback) {

	var field = this;

	if (utils.isFunction(paths)) {
		callback = paths;
		paths = field.paths;
	} else if (!paths) {
		paths = field.paths;
	}

	callback = callback || function () {};

	return function () {

		if (req.body) {
			var action = req.body[paths.action];

			if (/^(delete|reset)$/.test(action)) {
				field.apply(item, action);
			}
		}

		if (req.files && req.files[paths.upload] && req.files[paths.upload].size) {
			var fileDelete;
			if (field.options.autoCleanup && item.get(field.paths.exists)) {
				// capture image delete promise
				fileDelete = field.apply(item, 'delete');
			}
			if (typeof fileDelete === 'undefined') {
				field.uploadFile(item, req.files[paths.upload], true, callback);
			} else {
				fileDelete.then(function (result) {
					field.uploadFile(item, req.files[paths.upload], true, callback);
				}, function (err) {
					callback(err);
				});
			}
		} else {
			return callback();
		}
	};
};


/**
 * Immediately handles a standard form submission for the field (see `getRequestHandler()`)
 *
 * @api public
 */

gcsfile.prototype.handleRequest = function (item, req, paths, callback) {
	this.getRequestHandler(item, req, paths, callback)();
};


/*!
 * Export class
 */

module.exports = gcsfile;
