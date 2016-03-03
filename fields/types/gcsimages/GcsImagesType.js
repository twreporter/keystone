/*!
 * Module dependencies.
 */

var _ = require('underscore');
var async = require('async');
var fs = require('fs-extra');
var gcsHelper = require('../../../lib/gcsHelper');
var grappling = require('grappling-hook');
var keystone = require('../../../');
var moment = require('moment');
var path = require('path');
var super_ = require('../Type');
var util = require('util');
var utils = require('keystone-utils');

/**
 * gcsimages FieldType Constructor
 * @extends Field
 * @api public
 */

function gcsimages(list, path, options) {
    grappling.mixin(this).allowHooks('upload');
    this._underscoreMethods = ['format', 'uploadFiles'];
    this._fixedSize = 'full';

    // TODO: implement filtering, usage disabled for now
    options.nofilter = true;

    // TODO: implement initial form, usage disabled for now
    if (options.initial) {
        throw new Error('Invalid Configuration\n\n' + 'gcsimages fields (' + list.key + '.' + path + ') do not currently support being used as initial fields.\n');
    }

    if (options.overwrite !== false) {
        options.overwrite = true;
    }

    gcsimages.super_.call(this, list, path, options);

    // Allow hook into before and after
    if (options.pre && options.pre.upload) {
        this.pre('upload', options.pre.upload);
    }

    if (options.post && options.post.upload) {
        this.post('upload', options.post.upload);
    }

}

/*!
 * Inherit from Field
 */

util.inherits(gcsimages, super_);

/**
 * Exposes the custom or keystone gcs config settings
 */

Object.defineProperty(gcsimages.prototype, 'gcsConfig', {
    get: function() {
        return this.options.gcsConfig || keystone.get('gcs config');
    },
});

/**
 * Registers the field on the List's Mongoose Schema.
 *
 * @api public
 */

gcsimages.prototype.addToSchema = function() {

    var field = this;
    var schema = this.list.schema;
    var mongoose = keystone.mongoose;

    var paths = this.paths = {
        // fields
        bucket: this._path.append('.bucket'),
        filename: this._path.append('.filename'),
        filetype: this._path.append('.filetype'),
        originalname: this._path.append('.originalname'),
        path: this._path.append('.path'),
        size: this._path.append('.size'),
        url: this._path.append('.url'),

        // virtuals
        action: this._path.append('_action'),
        exists: this._path.append('.exists'),
        order: this._path.append('_order'),
        upload: this._path.append('_upload'),
    };

    var schemaPaths = new mongoose.Schema({
        bucket: String,
        filename: String,
        filetype: String,
        originalname: String,
        path: String,
        size: Number,
        url: String
    });

    // The .href virtual returns the public path of the file
    schemaPaths.virtual('href').get(function() {
        return field.href(this);
    });

    schema.add(this._path.addTo({}, [schemaPaths]));

    this.removeImage = function(item, filepath, method, callback) {
        var images = item.get(field.path);
        var img;
        var index;
        for (var i = 0; i < images.length; i++) {
            if (images[i].path + images[i].filename === filepath) {
                index = i;
                img = images[i];
                break;
            }
        }

        if (!img) return callback();
        if (method === 'delete') {
            var gcsConfig = this.gcsConfig;
            var bucket = img.bucket;
            var path = img.path;
            var filename = img.filename;
            gcsHelper.initBucket(gcsConfig, bucket).deleteFiles({
                prefix: path + filename
            }, function(err) {
                if (err) {
                    console.log('delete files err:', err);
                    return callback(err)
                }
                images.splice(index, 1);
                item.save(function(err) {
                    if (err) {
                        return callback(err);
                    }
                    callback();
                });
            });
        } else {
            images.splice(index, 1);
            item.save(function(err) {
                if (err) {
                    return callback(err);
                }
                callback();
            });
        }
    };

    this.underscoreMethod('remove', function(id, callback) {
        field.removeImage(this, id, 'remove', callback);
    });

    this.underscoreMethod('delete', function(id, callback) {
        field.removeImage(this, id, 'delete', callback);
    });

    this.bindUnderscoreMethods();
};


/**
 * Formats the field value
 *
 * @api public
 */

gcsimages.prototype.format = function(item, i) {
    var files = item.get(this.path);
    if (typeof i === 'undefined') {
        return utils.plural(files.length, '* File');
    }
    var file = files[i];
    if (!file) return '';
    if (this.hasFormatter()) {
        file.href = this.href(file);
        return this.options.format.call(this, item, file);
    }
    return file.filename;
};


/**
 * Detects whether the field has a formatter function
 *
 * @api public
 */

gcsimages.prototype.hasFormatter = function() {
    return typeof this.options.format === 'function';
};


/**
 * Return the public href for a single stored file
 *
 * @api public
 */

gcsimages.prototype.href = function(file) {
    if (!file.filename) return '';
    return gcsHelper.getPublicUrl(this.options.bucket, file.filename);
};


/**
 * Detects whether the field has been modified
 *
 * @api public
 */

gcsimages.prototype.isModified = function(item) {
    return item.isModified(this.paths.path);
};


/**
 * Validates that a value for this field has been provided in a data object
 *
 * @api public
 */

gcsimages.prototype.inputIsValid = function(data) { // eslint-disable-line no-unused-vars
    // TODO - how should file field input be validated?
    return true;
};


/**
 * Updates the value for this field in the item from a data object
 *
 * @api public
 */

gcsimages.prototype.updateItem = function(item, data, callback) { // eslint-disable-line no-unused-vars
    // TODO - direct updating of data (not via upload)
    process.nextTick(callback);
};


/**
 * Uploads the file for this field
 *
 * @api public
 */

gcsimages.prototype.uploadFiles = function(item, files, update, callback) {

    if (typeof update === 'function') {
        callback = update;
        update = false;
    }

    var field = this;
    var path = field.options.destination ? field.options.destination : '';
    var isPublicRead = field.options.publicRead ? field.options.publicRead : false;
    var bucket = gcsHelper.initBucket(field.gcsConfig, field.options.bucket);

    async.map(files, function(file, processedFile) {

        var prefix = field.options.datePrefix ? moment().format(field.options.datePrefix) + '-' : '';
        var originalname = file.originalname;
        var filename = prefix + file.name;
        var filetype = file.mimetype || file.type;

        if (field.options.allowedTypes && !_.contains(field.options.allowedTypes, filetype)) {
            return processedFile(new Error('Unsupported File Type: ' + filetype));
        }

        var doUpload = function(doneUpload) {

            if (typeof field.options.filename === 'function') {
                filename = field.options.filename(item, file);
            }

            gcsHelper.uploadFileToBucket(bucket, file.path, {
                destination: path + filename,
            }).then(function(uploadedFile) {
                return gcsHelper.makeFilePublicPrivateRead(uploadedFile, isPublicRead);
            }).then(function(response) {
                var fileData = {
                    bucket: field.options.bucket,
                    filename: filename,
                    filetype: filetype,
                    originalname: originalname,
                    path: path,
                    size: file.size,
                    url: gcsHelper.getPublicUrl(field.options.bucket, path + filename),
                };

                if (update) {
                    item.get(field.path).push(fileData);
                }
                return doneUpload(null, fileData);
            }).catch(function(err) {
                return doneUpload(err);
            });
        };

        field.callHook('pre:upload', item, file, function(err) {
            if (err) return processedFile(err);
            doUpload(function(err, fileData) {
                if (err) return processedFile(err);
                field.callHook('post:upload', item, file, fileData, function(err) {
                    return processedFile(err, fileData);
                });
            });
        });

    }, callback);

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

gcsimages.prototype.getRequestHandler = function(item, req, paths, callback) {

    var field = this;

    if (utils.isFunction(paths)) {
        callback = paths;
        paths = field.paths;
    } else if (!paths) {
        paths = field.paths;
    }

    callback = callback || function() {};

    return function() {

        // Order
        if (req.body[paths.order]) {
            var images = item.get(field.path);
            var newOrder = req.body[paths.order].split(',');
            images.sort(function(a, b) {
                return (newOrder.indexOf(a.filename.toString()) > newOrder.indexOf(b.filename.toString())) ? 1 : -1;
            });
        }

        // Deletes
        if (req.body && req.body[paths.action]) {
            var actions = req.body[paths.action].split('|');

            actions.forEach(function(action) {
                action = action.split(':');
                var method = action[0];
                var filepaths = action[1];

                if (!method.match(/^(delete|remove)$/) || !filepaths) return;

                filepaths.split(',').forEach(function(filepath) {
                    field.removeImage(item, filepath, method, function(err) {
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
                    upFiles = _.filter(upFiles, function(f) {
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

gcsimages.prototype.handleRequest = function(item, req, paths, callback) {
    this.getRequestHandler(item, req, paths, callback)();
};


/*!
 * Export class
 */

module.exports = gcsimages;
