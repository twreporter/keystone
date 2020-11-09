/*!
 * Module dependencies.
 */
var fs = require('fs');
var gcsHelper = require('../../../lib/gcsHelper');
var keystone = require('../../../');
var moment = require('moment');
var super_ = require('../Type');
var util = require('util');
var utils = require('keystone-utils');
var sizeOf = require('probe-image-size');

// lodash
var forEach = require('lodash/forEach');
var indexOf = require('lodash/indexOf')
var set = require('lodash/set')

const _ = {
  forEach,
  indexOf,
  set,
}

/**
 *  FieldType Constructor
 * @extends Field
 * @api public
 */

function gcsimage (list, path, options) {
  this._underscoreMethods = ['format', 'uploadFile'];
  this._fixedSize = 'full';

  // TODO: implement filtering, usage disabled for now
  options.nofilter = true;

  gcsimage.super_.call(this, list, path, options);

  // validate gcs config (has to happen after super_.call)
  if (!keystone.get('gcs config')) {
    throw new Error('Invalid Configuration\n\n' + 'gcsimage fields (' + list.key + '.' + path + ') require the "gcs config" option to be set.\n\n' + 'See http://keystonejs.com/docs/configuration/#services-gcsimage for more information.\n');
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
  get: function () {
    return this.options.gcsConfig || keystone.get('gcs config');
  },
});

/**
 * Registers the field on the List's Mongoose Schema.
 *
 * @api public
 */

gcsimage.prototype.addToSchema = function () {

  var _this = this;
  var schema = this.list.schema;

  var paths = this.paths = {
    // fields
    filename: this._path.append('.filename'),
    filetype: this._path.append('.filetype'),
    gcsBucket: this._path.append('.gcsBucket'),
    gcsDir: this._path.append('.gcsDir'),
    height: this._path.append('.height'),
    iptc: this._path.append('.iptc'),
    resizedTargets: this._path.append('.resizedTargets'),
    size: this._path.append('.size'),
    width: this._path.append('.width'),

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
    height: Number,
    iptc: Object,
    resizedTargets: Object,
    size: Number,
    width: Number,
  });

  schema.add(schemaPaths);

  var exists = function (item) {
    return (item.get(paths.filename) ? true : false);
  };

  // The .exists virtual indicates whether a file is stored
  schema.virtual(paths.exists).get(function () {
    return schemaMethods.exists.apply(this);
  });

  var reset = function (item) {
    item.set(_this.path, {
      filename: '',
      filetype: '',
      gcsBucket: '',
      gcsDir: '',
      height: 0,
      iptc: {},
      resizedTargets: {},
      size: 0,
      width: 0,
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
        var gcsConfig = _this.gcsConfig;
        var bucket = gcsHelper.initBucket(gcsConfig, _this.get(paths.bucket));
        var filename = _this.get(paths.filename);
        if (filename && typeof filename === 'string') {
          var filenameWithoutExt = filename.split('.')[0];
          bucket.deleteFiles({
            prefix: _this.get(paths.path) + filenameWithoutExt,
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

  _.forEach(schemaMethods, function (fn, key) {
    _this.underscoreMethod(key, fn);
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

gcsimage.prototype.format = function (item) {
  if (this.hasFormatter()) {
    return this.options.format(item, item[this.path]);
  }
  return item.get(this.paths.filename);
};


/**
 * Detects the field have formatter function
 *
 * @api public
 */

gcsimage.prototype.hasFormatter = function () {
  return typeof this.options.format === 'function';
};


/**
 * Detects whether the field has been modified
 *
 * @api public
 */

gcsimage.prototype.isModified = function (item) {
  return item.isModified(this.paths.filename);
};


/**
 * Validates that a value for this field has been provided in a data object
 *
 * @api public
 */

gcsimage.prototype.inputIsValid = function (data) { // eslint-disable-line no-unused-vars
  // TODO - how should file field input be validated?
  return true;
};


/**
 * Updates the value for this field in the item from a data object
 *
 * @api public
 */

gcsimage.prototype.updateItem = function (item, data, callback) { // eslint-disable-line no-unused-vars
  // TODO - direct updating of data (not via upload)
  process.nextTick(callback);
};

/**
 * Uploads the file for this field
 *
 * @api public
 */

gcsimage.prototype.uploadFile = function (item, file, update, callback) {
  var _this = this;
  var ONE_YEAR = 60 * 60 * 24 * 365;
  var publicRead = _this.options.publicRead ? _this.options.publicRead : false;
  var prefix = _this.options.datePrefix ? moment().format(_this.options.datePrefix) + '-' : '';
  var filename = prefix + file.name;
  var split = filename.split('.');
  var filenameWithoutExt = split[0];
  var ext = split[1] || '';
  var originalname = file.originalname;
  var filetype = file.mimetype || file.type;
  let gcsDir = this.options.destination ? this.options.destination : '';

  if (typeof gcsDir === 'string' && gcsDir !== '') {
    if (gcsDir === '/') {
      gcsDir = '';
    } else if (gcsDir.slice(-1) !== '/') {
      gcsDir += '/';
    }
  }

  if (typeof update === 'function') {
    callback = update;
    update = false;
  }

  if ((_this.options.allowedTypes && !_.indexOf(_this.options.allowedTypes, filetype)
    || filetype.match('image.*') === null)) {
    return callback(new Error('Unsupported File Type: ' + filetype));
  }

  var doUpload = function () {

    if (typeof _this.options.filename === 'function') {
      filename = _this.options.filename(item, filename, originalname);
    }

    var bucket = gcsHelper.initBucket(_this.gcsConfig, _this.options.bucket);
    return gcsHelper.uploadFileToBucket(bucket, fs.createReadStream(file.path), {
      destination: gcsDir + filename,
      filetype: filetype,
      publicRead: publicRead,
      cacheControl: 'public, max-age=' + ONE_YEAR,
    }).then(function () {
      const dimensions = sizeOf.sync(fs.readFileSync(file.path));

      var imageData = {
        filepath: file.path,
        filename: filename,
        filetype: filetype,
        gcsBucket: _this.options.bucket,
        gcsDir: gcsDir,
        height: dimensions.height,
        size: file.size,
        width: dimensions.width,
        resizedTargets: {},
        iptc: {},
      };

      if (_this.options.hooks && typeof _this.options.hooks.postUpload === 'function') {
        return _this.options.hooks.postUpload(imageData)
          .then((postUploadData) => {
            if (update) {
              item.set(_this.path, postUploadData);
            }
            return callback(null, postUploadData);
          })
      } else {
        if (update) {
          item.set(_this.path, imageData);
        }
        callback(null, imageData);
      }
    }).catch(function (err) {
      console.error(err);
      bucket.deleteFiles({
        prefix: gcsDir + filenameWithoutExt,
      }, function (deleteErr) {
        if (deleteErr) {
          return callback(deleteErr);
        }
        callback(err);
      });
    }).finally(function () {
      // delete local file
      console.log('DELETE LOCAL FILE:', file.path);
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        console.error('DELETE LOCAL FILE ERROR:', err);
      };
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

gcsimage.prototype.getRequestHandler = function (item, req, paths, callback) {

  var _this = this;

  if (utils.isFunction(paths)) {
    callback = paths;
    paths = _this.paths;
  } else if (!paths) {
    paths = _this.paths;
  }

  callback = callback || function () {};

  return function () {

    if (req.body) {
      var action = req.body[paths.action];

      if (/^(delete|reset)$/.test(action)) {
        _this.apply(item, action);
      }
    }

    if (req.files && req.files[paths.upload] && req.files[paths.upload].size) {
      var imageDelete;
      if (_this.options.autoCleanup && item.get(_this.paths.exists)) {
        // capture image delete promise
        imageDelete = _this.apply(item, 'delete');
      }
      if (typeof imageDelete === 'undefined') {
        _this.uploadFile(item, req.files[paths.upload], true, callback);
      } else {
        imageDelete.then(function (result) {
          _this.uploadFile(item, req.files[paths.upload], true, callback);
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

gcsimage.prototype.handleRequest = function (item, req, paths, callback) {
  this.getRequestHandler(item, req, paths, callback)();
};


/*!
 * Export class
 */

module.exports = gcsimage;
