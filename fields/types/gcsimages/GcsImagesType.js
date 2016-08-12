/*!
 * Module dependencies.
 */

var _ = require('lodash');
var async = require('async');
var fs = require('fs-extra');
var gcsHelper = require('../../../lib/gcsHelper');
var keystone = require('../../../');
var moment = require('moment');
var sizeOf = require('image-size');
var super_ = require('../Type');
var util = require('util');
var utils = require('keystone-utils');

var PARALLEL_LIMIT = 1;

/**
 * gcsimages FieldType Constructor
 * @extends Field
 * @api public
 */

function gcsimages (list, path, options) {
	this._underscoreMethods = ['uploadFiles'];
	this._fixedSize = 'full';

	// TODO: implement filtering, usage disabled for now
	options.nofilter = true;

	if (options.overwrite !== false) {
		options.overwrite = true;
	}

	gcsimages.super_.call(this, list, path, options);
}

/*!
 * Inherit from Field
 */

util.inherits(gcsimages, super_);

/**
 * Exposes the custom or keystone gcs config settings
 */

Object.defineProperty(gcsimages.prototype, 'gcsConfig', {
	get: function () {
		return this.options.gcsConfig || keystone.get('gcs config');
	},
});

/**
 * Registers the field on the List's Mongoose Schema.
 *
 * @api public
 */

gcsimages.prototype.addToSchema = function () {

	var field = this;
	var schema = this.list.schema;
	var mongoose = keystone.mongoose;

	this.paths = {
		// fields
		filename: this._path.append('.filename'),
		filetype: this._path.append('.filetype'),
		gcsBucket: this._path.append('.gcsBucket'),
		gcsDir: this._path.append('.gcsDir'),
		height: this._path.append('.height'),
		iptc: this._path.append('.iptc'),
		resizedTargets: this._path.append('.resizedTargets'),
		size: this._path.append('.size'),
		url: this._path.append('.url'),
		width: this._path.append('.width'),

		// virtuals
		action: this._path.append('_action'),
		order: this._path.append('_order'),
		upload: this._path.append('_upload'),
	};

	var schemaPaths = new mongoose.Schema({
		filename: String,
		filetype: String,
		gcsBucket: String,
		gcsDir: String,
		height: Number,
		iptc: Object,
		resizedTargets: Object,
		size: Number,
		url: String,
		width: Number,
	});


	schema.add(this._path.addTo({}, [schemaPaths]));

	this.removeImage = function (item, filename, method, callback) {
		var images = item.get(field.path);
		var img;
		var index;
		for (var i = 0; i < images.length; i++) {
			if (images[i].filename === filename) {
				index = i;
				img = images[i];
				break;
			}
		}

		if (!img) return callback();
		if (method === 'delete' || method === 'remove') {
			var gcsConfig = this.gcsConfig;
			var bucket = gcsHelper.initBucket(gcsConfig, img.gcsBucket);
			var path = img.gcsDir;
			filename = img.filename;
			var filenameWithoutExt = filename.split('.')[0];
			bucket.deleteFiles({
				prefix: path + filenameWithoutExt,
			}, function (err) {
				if (err) {
					console.log('delete files err:', err);
					return callback(err);
				}
				images.splice(index, 1);
				item.save(function (err) {
					if (err) {
						return callback(err);
					}
					callback();
				});
			});
		}
	};

	this.underscoreMethod('remove', function (id, callback) {
		field.removeImage(this, id, 'remove', callback);
	});

	this.underscoreMethod('delete', function (id, callback) {
		field.removeImage(this, id, 'delete', callback);
	});

	this.bindUnderscoreMethods();
};


/**
 * Detects whether the field has been modified
 *
 * @api public
 */

gcsimages.prototype.isModified = function (item) {
	return item.isModified(this.paths.path);
};


/**
 * Validates that a value for this field has been provided in a data object
 *
 * @api public
 */

gcsimages.prototype.inputIsValid = function (data) { // eslint-disable-line no-unused-vars
	// TODO - how should file field input be validated?
	return true;
};


/**
 * Updates the value for this field in the item from a data object
 *
 * @api public
 */

gcsimages.prototype.updateItem = function (item, data, callback) { // eslint-disable-line no-unused-vars
	// TODO - direct updating of data (not via upload)
	process.nextTick(callback);
};

gcsimages.prototype.uploadFile = function (file) {
	var gcsDir = this.options.destination ? this.options.destination : '';
	var isPublicRead = this.options.publicRead ? this.options.publicRead : false;
	var bucket = gcsHelper.initBucket(this.gcsConfig, this.options.bucket);
	var prefix = this.options.datePrefix ? moment().format(this.options.datePrefix) + '-' : '';
	var filename = prefix + file.name;
	var filetype = file.mimetype || file.type;

	if (this.options.allowedTypes && !_.indexOf(this.options.allowedTypes, filetype)) {
		return Promise.reject(new Error('Unsupported File Type: ' + filetype));
	}

	var _this = this;
	// upload image
	return gcsHelper.uploadFileToBucket(bucket, fs.createReadStream(file.path), {
		destination: gcsDir + filename,
		filetype: filetype,
		isPublicRead: isPublicRead,
	}).then(function (response) {
		return new Promise(function (resolve, reject) {
			// resizing image and upload resized images
			if (typeof _this.options.resize === 'function') {
				var split = filename.split('.');
				var filenameWithoutExt = split[0];
				var ext = split[1] || '';
				var resizeFunc = _this.options.resize;
				var targets = {};

				// socket hang up troubleshooting https://googlecloudplatform.github.io/gcloud-node/#/docs/v0.29.0/guides/troubleshooting
				async.eachLimit(_this.options.resizeOpts, PARALLEL_LIMIT, function (resizeOpt, asyncCallback) {
					targets[resizeOpt.target] = {
						url: gcsHelper.getPublicUrl(_this.options.bucket, gcsDir + filenameWithoutExt + '-' + resizeOpt.target + '.' + ext),
						width: resizeOpt.width,
						height: resizeOpt.height,
					};
					gcsHelper.uploadFileToBucket(bucket, resizeFunc(file.path, resizeOpt.width, resizeOpt.height, resizeOpt.options), {
						destination: gcsDir + filenameWithoutExt + '-' + resizeOpt.target + '.' + ext,
						filetype: filetype,
						isPublicRead: isPublicRead,
					}).then(function (result) {
						asyncCallback();
					}, function (err) {
						asyncCallback(err);
					});
				}, function (error) {
					if (error) {
						reject(error);
					}
					resolve(targets);
				});
			} else {
				resolve(targets);
			}
		});
	}).then(function (targets) {
		return new Promise(function (resolve, reject) {
			var dimensions = sizeOf(file.path);
			if (targets) {
				// calculate width and height of resized images
				try {
					_.forEach(targets, function (target) {
						if (typeof target.width === 'number' && typeof target.height !== 'number') {
							if (target.width < dimensions.width) {
								target.height = Math.round((target.width / dimensions.width) * dimensions.height);
							} else {
								target.height = dimensions.height;
								target.width = dimensions.width;
							}
						} else if (typeof target.height === 'number' && typeof target.width !== 'number') {
							if (target.height < dimensions.height) {
								target.width = Math.round((target.height / dimensions.height) * dimensions.width);
							} else {
								target.width = dimensions.width;
								target.height = dimensions.height;
							}
						}
					});
				} catch (e) {
					console.warn('Calculating width and height of resized image occurs error ', e);
				}
			}
			var fileData = {
				filename: filename,
				filetype: filetype,
				gcsBucket: _this.options.bucket,
				gcsDir: gcsDir,
				height: dimensions.height || 0,
				iptc: {},
				resizedTargets: targets || {},
				size: file.size,
				url: gcsHelper.getPublicUrl(_this.options.bucket, gcsDir + filename),
				width: dimensions.width || 0,
			};
			if (typeof _this.options.extractIPTC === 'function') {
				_this.options.extractIPTC(file.path)
					.then(function (meta) {
						fileData.iptc = meta;
						resolve(fileData);
					}).catch(function (err) {
						reject(err);
					});
			} else {
				resolve(fileData);
			}
		});
	});
};

/**
 * Uploads the file for this field
 *
 @api public
 */

// Extract the common function with gcsimage
gcsimages.prototype.uploadFiles = function (item, files, update, callback) {

	if (typeof update === 'function') {
		callback = update;
		update = false;
	}

	var _this = this;
	var dataToStore = [];

	// socket hang up troubleshooting https://googlecloudplatform.github.io/gcloud-node/#/docs/v0.29.0/guides/troubleshooting
	async.eachLimit(files, PARALLEL_LIMIT, function (file, asyncCallback) {
		_this.uploadFile(file)
			.then(function (fileData) {
				dataToStore.push(fileData);
				if (update) {
					item.get(_this.path).push(fileData);
				}
				asyncCallback();
			}).catch(function (err) {
				console.log('err', err);
				asyncCallback(err);
			});
	}, function (err) {
		// delete local files
		_.forEach(files, function (file) {
			console.log('DELETE LOCAL FILE:', file.path);
			fs.unlink(file.path, function (err) {
				if (err) {
					console.error('DELETE LOCAL FILE ERROR:', err);
				}
			});
		});

		if (err) {
			console.log('err:', err);
			return callback(err);
		}
		return callback(null, dataToStore);
	});
};


/**
 * Returns a callback that handles a standard form submission for the field
 *
 * Expected form parts are
 * - `field.paths.action` in `req.body` (`clear` or `delete`)
 * - `field.paths.upload` in `req.files` (uploads the file to gcsimages)
 *
 * @api public
 */

gcsimages.prototype.getRequestHandler = function (item, req, paths, callback) {

	var field = this;

	if (utils.isFunction(paths)) {
		callback = paths;
		paths = field.paths;
	} else if (!paths) {
		paths = field.paths;
	}

	callback = callback || function () {};

	return function () {

		// Order
		if (req.body[paths.order]) {
			var images = item.get(field.path);
			var newOrder = req.body[paths.order].split(',');
			images.sort(function (a, b) {
				return (newOrder.indexOf(a.filename.toString()) > newOrder.indexOf(b.filename.toString())) ? 1 : -1;
			});
		}

		// Deletes
		if (req.body && req.body[paths.action]) {
			var actions = req.body[paths.action].split('|');

			actions.forEach(function (action) {
				action = action.split(':');
				var method = action[0];
				var filename = action[1];

				if (!method.match(/^(delete|remove)$/) || !filename) return;

				filename.split(',').forEach(function (filename) {
					field.removeImage(item, filename, method, function (err) {
						if (err) {
							console.log('remove image fails:', err);
						}
					});
				});
			});
		}

		// Upload new files
		if (req.files) {
			var upFiles = req.files[paths.upload];
			if (upFiles) {
				if (!Array.isArray(upFiles)) {
					upFiles = [upFiles];
				}
				if (upFiles.length > 0) {
					upFiles = _.filter(upFiles, function (f) {
						return typeof f.name !== 'undefined' && f.name.length > 0;
					});
					if (upFiles.length > 0) {
						return field.uploadFiles(item, upFiles, true, callback);
					}
				}
			}
		}

		return callback();
	};

};


/**
 * Immediately handles a standard form submission for the field (see `getRequestHandler()`)
 *
 * @api public
 */

gcsimages.prototype.handleRequest = function (item, req, paths, callback) {
	this.getRequestHandler(item, req, paths, callback)();
};


/*!
 * Export class
 */

module.exports = gcsimages;
