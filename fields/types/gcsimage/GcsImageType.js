/*!
 * Module dependencies.
 */

var _ = require('underscore');
var grappling = require('grappling-hook');
var gcsHelper = require('../../../lib/gcsHelper');
var keystone = require('../../../');
var moment = require('moment');
var super_ = require('../Type');
var util = require('util');
var utils = require('keystone-utils');
var ExifImage = require('exif').ExifImage;

function extractExif(image) {
    return new Promise(function(resolve, reject) {
        try {
            new ExifImage({
                image: image
            }, function(error, exifData) {
                if (error) {
                    console.log('Error while extracting exif of image: ' + error.message);
                    resolve({});
                } else {
                    if ( typeof exifData === 'object') {
                        return resolve(exifData);
                    }
                    resolve({});
                }
            });
        } catch (error) {
            console.log('Error while extracting exif of image: ' + error.message);
            resolve({});
        }
    });
}

/**
 *  FieldType Constructor
 * @extends Field
 * @api public
 */

function gcsimage(list, path, options) {
    grappling.mixin(this)
        .allowHooks('pre:upload');
    this._underscoreMethods = ['format', 'uploadFile'];
    this._fixedSize = 'full';

    // TODO: implement filtering, usage disabled for now
    options.nofilter = true;

    gcsimage.super_.call(this, list, path, options);

    // validate gcs config (has to happen after super_.call)
    if (!keystone.get('gcs config')) {
        throw new Error('Invalid Configuration\n\n' + 'gcsimage fields (' + list.key + '.' + path + ') require the "gcs config" option to be set.\n\n' + 'See http://keystonejs.com/docs/configuration/#services-gcsimage for more information.\n');
    }

    // Could be more pre- hooks, just upload for now
    if (options.pre && options.pre.upload) {
        this.pre('upload', options.pre.upload);
    }

}

/*!
 * Inherit from Field
 */

util.inherits(gcsimage, super_);

/**
 * Exposes the custom or keystone gcs config settings
 */

Object.defineProperty(gcsimage.prototype, 'gcsConfig', {
    get: function() {
        return this.options.gcsConfig || keystone.get('gcs config');
    },
});

/**
 * Registers the field on the List's Mongoose Schema.
 *
 * @api public
 */

gcsimage.prototype.addToSchema = function() {

    var field = this;
    var schema = this.list.schema;

    var paths = this.paths = {
        // fields
        artist: this._path.append('.artist'),
        bucket: this._path.append('.bucket'),
        description: this._path.append('.description'),
        filename: this._path.append('.filename'),
        filetype: this._path.append('.filetype'),
        height: this._path.append('.height'),
        originalname: this._path.append('.originalname'),
        path: this._path.append('.path'),
        size: this._path.append('.size'),
        url: this._path.append('.url'),
        width: this._path.append('.width'),

        // virtuals
        action: this._path.append('_action'),
        exists: this._path.append('.exists'),
        upload: this._path.append('_upload'),
    };

    var schemaPaths = this._path.addTo({}, {
        artist: String,
        bucket: String,
        description: String,
        filename: String,
        filetype: String,
        height: Number,
        originalname: String,
        path: String,
        size: Number,
        url: String,
        width: Number
    });

    schema.add(schemaPaths);

    var exists = function(item) {
        return (item.get(paths.url) ? true : false);
    };

    // The .exists virtual indicates whether a file is stored
    schema.virtual(paths.exists).get(function() {
        return schemaMethods.exists.apply(this);
    });

    var reset = function(item) {
        item.set(field.path, {
            artist: '',
            bucket: '',
            description: '',
            filename: '',
            filetype: '',
            height: 0,
            originalname: '',
            path: '',
            size: 0,
            url: '',
            width: 0
        });
    };

    var schemaMethods = {
        exists: function() {
            return exists(this);
        },
        /**
         * Resets the value of the field
         *
         * @api public
         */
        reset: function() {
            reset(this);
        },
        /**
         * Deletes the file from gcs and resets the field
         *
         * @api public
         */
        delete: function() {
            var _this = this;
            var promise = new Promise(function(resolve, reject) {
                var gcsConfig = field.gcsConfig;
                var bucket = gcsHelper.initBucket(gcsConfig, _this.get(paths.bucket));
                bucket.deleteFiles({
                    prefix: _this.get(paths.path) + _this.get(paths.filename)
                }, function(err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            });
            reset(this);
            return promise;
        }
    };

    _.each(schemaMethods, function(fn, key) {
        field.underscoreMethod(key, fn);
    });

    // expose a method on the field to call schema methods
    this.apply = function(item, method) {
        return schemaMethods[method].apply(item, Array.prototype.slice.call(arguments, 2));
    };

    this.bindUnderscoreMethods();
};


/**
 * Formats the field value
 *
 * @api public
 */

gcsimage.prototype.format = function(item) {
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

gcsimage.prototype.hasFormatter = function() {
    return typeof this.options.format === 'function';
};


/**
 * Detects whether the field has been modified
 *
 * @api public
 */

gcsimage.prototype.isModified = function(item) {
    return item.isModified(this.paths.url);
};


/**
 * Validates that a value for this field has been provided in a data object
 *
 * @api public
 */

gcsimage.prototype.inputIsValid = function(data) { // eslint-disable-line no-unused-vars
    // TODO - how should file field input be validated?
    return true;
};


/**
 * Updates the value for this field in the item from a data object
 *
 * @api public
 */

gcsimage.prototype.updateItem = function(item, data, callback) { // eslint-disable-line no-unused-vars
    // TODO - direct updating of data (not via upload)
    process.nextTick(callback);
};

/**
 * Uploads the file for this field
 *
 * @api public
 */

gcsimage.prototype.uploadFile = function(item, file, update, callback) {

    var field = this;
    var path = field.options.destination ? field.options.destination : '';
    var isPublicRead = field.options.publicRead ? field.options.publicRead : false;
    var prefix = field.options.datePrefix ? moment().format(field.options.datePrefix) + '-' : '';
    var filename = prefix + file.name;
    var originalname = file.originalname;
    var filetype = file.mimetype || file.type;

    if (typeof update === 'function') {
        callback = update;
        update = false;
    }

    if ((field.options.allowedTypes && !_.contains(field.options.allowedTypes, filetype) ||
        filetype.match('image.*') === null)) {
        return callback(new Error('Unsupported File Type: ' + filetype));
    }

    var doUpload = function() {

        if (typeof field.options.filename === 'function') {
            filename = field.options.filename(item, filename, originalname);
        }

        var bucket = gcsHelper.initBucket(field.gcsConfig, field.options.bucket);
        gcsHelper.uploadFileToBucket(bucket, file.path, {
            destination: path + filename,
        }).then(function(uploadedFile) {
            return gcsHelper.makeFilePublicPrivateRead(uploadedFile, isPublicRead);
        }).then(function(response) {
            extractExif(file.path).then(function(exifData) {
                exifData.image = exifData.image || {};
                exifData.exif = exifData.exif || {};
                var fileData = {
                    artist: exifData.image.Artist || '',
                    bucket: field.options.bucket,
                    description: exifData.image.ImageDescription || '',
                    filename: filename,
                    filetype: filetype,
                    height: exifData.exif.ExifImageHeight || exifData.image.ImageHeight || 0,
                    originalname: originalname,
                    path: path,
                    size: file.size,
                    url: gcsHelper.getPublicUrl(field.options.bucket, path + filename),
                    width: exifData.exif.ExifImageWidth || exifData.image.ImageWidth || 0
                };
                if (update) {
                    item.set(field.path, fileData);
                }
                return callback(null, fileData);
            });
        }).catch(function(err) {
            return callback(err);
        });
    };

    this.callHook('pre:upload', item, file, function(err) {
        if (err) return callback(err);
        doUpload();
    });

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

gcsimage.prototype.getRequestHandler = function(item, req, paths, callback) {

    var field = this;

    if (utils.isFunction(paths)) {
        callback = paths;
        paths = field.paths;
    } else if (!paths) {
        paths = field.paths;
    }

    callback = callback || function() {};

    return function() {

        if (req.body) {
            var action = req.body[paths.action];

            if (/^(delete|reset)$/.test(action)) {
                field.apply(item, action);
            }
        }

        if (req.files && req.files[paths.upload] && req.files[paths.upload].size) {
            var imageDelete;
            if (field.options.autoCleanup && item.get(field.paths.exists)) {
                // capture image delete promise
                imageDelete = field.apply(item, 'delete');
            }
            if (typeof imageDelete === 'undefined') {
                field.uploadFile(item, req.files[paths.upload], true, callback);
            } else {
                imageDelete.then(function(result) {
                    field.uploadFile(item, req.files[paths.upload], true, callback);
                }, function(err) {
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

gcsimage.prototype.handleRequest = function(item, req, paths, callback) {
    this.getRequestHandler(item, req, paths, callback)();
};


/*!
 * Export class
 */

module.exports = gcsimage;
