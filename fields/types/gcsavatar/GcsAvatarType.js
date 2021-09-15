/*!
 * Module dependencies.
 */
const fs = require('fs');
const gcsHelper = require('../../../lib/gcsHelper');
const keystone = require('../../../');
const super_ = require('../Type');
const util = require('util');
const utils = require('keystone-utils');

// lodash
const defaults = require('lodash/defaults');
const forEach = require('lodash/forEach');
const get = require('lodash/get');
const indexOf = require('lodash/indexOf');
const set = require('lodash/set');

const _ = {
  defaults,
  forEach,
  get,
  indexOf,
  set,
};

/**
 *  FieldType Constructor
 * @extends Field
 * @api public
 */

function gcsavatar(list, path, options) {
  this._underscoreMethods = ['format', 'uploadFile'];
  this._fixedSize = 'full';

  options.nofilter = true;

  gcsavatar.super_.call(this, list, path, options);

  // validate gcs config (has to happen after super_.call)
  if (!keystone.get('gcs config')) {
    throw new Error('Invalid Configuration\n\n' + 'gcsavatar fields (' + list.key + '.' + path + ') require the "gcs config" option to be set.\n');
  }
}

/*!
 * Inherit from Field
 */

util.inherits(gcsavatar, super_);

/**
 * Exposes the custom or keystone gcs config settings
 */

Object.defineProperty(gcsavatar.prototype, 'gcsConfig', {
  get: function() {
    return this.options.gcsConfig || keystone.get('gcs config');
  },
});

/**
 * Registers the field on the List's Mongoose Schema.
 *
 * @api public
 */

gcsavatar.prototype.addToSchema = function() {

  const _this = this;
  const schema = this.list.schema;

  const paths = this.paths = {
    // fields
    filename: this._path.append('.filename'),
    filetype: this._path.append('.filetype'),
    gcsBucket: this._path.append('.gcsBucket'),
    gcsDir: this._path.append('.gcsDir'),

    // virtuals
    action: this._path.append('_action'),
    exists: this._path.append('.exists'),
    upload: this._path.append('_upload'),
  };

  const schemaPaths = this._path.addTo({}, {
    filename: String,
    filetype: String,
    gcsBucket: String,
    gcsDir: String,
  });

  schema.add(schemaPaths);

  const exists = function(item) {
    return (item.get(paths.filename) ? true : false);
  };

  // The .exists virtual indicates whether a file is stored
  schema.virtual(paths.exists).get(function() {
    return schemaMethods.exists.apply(this);
  });

  const reset = function(item) {
    item.set(_this.path, {
      filename: '',
      filetype: '',
      gcsBucket: '',
      gcsDir: '',
    });
  };

  const schemaMethods = {
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
      const _this = this;
      const promise = new Promise(function(resolve, reject) {
        const gcsConfig = keystone.get('gcs config');
        const bucket = gcsHelper.initBucket(gcsConfig, _this.get(paths.gcsBucket));
        const filename = _this.get(paths.filename);
        if (filename && typeof filename === 'string') {
          bucket.deleteFiles({
            prefix: _this.get(paths.gcsDir) + filename,
          }, function(err) {
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

  _.forEach(schemaMethods, function(fn, key) {
    _this.underscoreMethod(key, fn);
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

gcsavatar.prototype.format = function(item) {
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

gcsavatar.prototype.hasFormatter = function() {
  return typeof this.options.format === 'function';
};


/**
 * Detects whether the field has been modified
 *
 * @api public
 */

gcsavatar.prototype.isModified = function(item) {
  return item.isModified(this.paths.filename);
};


/**
 * Validates that a value for this field has been provided in a data object
 *
 * @api public
 */

gcsavatar.prototype.inputIsValid = function(data) {
  // TODO - how should file field input be validated?
  return true;
};


/**
 * Updates the value for this field in the item from a data object
 *
 * @api public
 */

gcsavatar.prototype.updateItem = function(item, data, callback) {
  // TODO - direct updating of data (not via upload)
  process.nextTick(callback);
};

/**
 * Uploads the file for this field
 *
 * @api public
 */

gcsavatar.prototype.uploadFile = function(item, file, update, callback) {
  const _this = this;
  const ONE_YEAR = 60 * 60 * 24 * 365;
  const publicRead = _this.options.publicRead ? _this.options.publicRead : false;

  // Assign filename with email, and non-alphanumeric characters truncated.
  // e.g. When an user uploads the avatar with email 'alice@twreporter.org',
  // the filename of the uploaded image would be 'alicetwreporterorg'.
  // The reason for doing this is that we don't need to deal with url
  // reset in the cookie for the keystone-plugin.
  const email = _.get(item, '_doc.email');
  // truncate the non-alphanumeric characters
  let filename = email.replace(/\W/g, '');
  const originalname = file.originalname;
  const filetype = file.mimetype || file.type;
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

  if (typeof _this.options.filename === 'function') {
    filename = _this.options.filename(item, filename, originalname);
  }
  const bucket = gcsHelper.initBucket(_this.gcsConfig, _this.options.bucket);
  return gcsHelper.uploadFileToBucket(bucket, fs.createReadStream(file.path), {
    destination: gcsDir + filename,
    filetype: filetype,
    publicRead: publicRead,
    cacheControl: 'public, max-age=' + ONE_YEAR,
  }).then(function() {
    const imageData = {
      filepath: file.path,
      filename: filename,
      filetype: filetype,
      gcsBucket: _this.options.bucket,
      gcsDir: gcsDir,
    };

    if (update) {
      item.set(_this.path, imageData);
    }
    callback(null, imageData);
    return imageData;
  }).catch(function(err) {
    console.error(err);
    bucket.deleteFiles({
      prefix: gcsDir + filename,
    }, function(deleteErr) {
      if (deleteErr) {
        return callback(deleteErr);
      }
      callback(err);
    });
  }).finally(function() {
    // delete local file
    console.log('DELETE LOCAL FILE:', file.path);
    try {
      fs.unlinkSync(file.path);
    } catch (err) {
      console.error('DELETE LOCAL FILE ERROR:', err);
    };
  });
};

gcsavatar.prototype.setAvatarURLToCookie = function(res, imageData, opts) {
  const cookieOptions = _.defaults({}, keystone.get('cookie signin options'), opts);
  const { gcsBucket, gcsDir, filename } = imageData;
  const imageURL = `https://storage.googleapis.com/${gcsBucket}/${gcsDir}${filename}`;
  res.cookie('keystone.avatar', imageURL, cookieOptions);
};

gcsavatar.prototype.clearAvatarFromCookie = function(res, opts) {
  const cookieOptions = _.defaults({}, keystone.get('cookie signin options'), opts);
  res.clearCookie('keystone.avatar', cookieOptions);
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

gcsavatar.prototype.getRequestHandler = function(item, req, res, paths, callback) {

  const _this = this;

  if (utils.isFunction(paths)) {
    callback = paths;
    paths = _this.paths;
  } else if (!paths) {
    paths = _this.paths;
  }

  callback = callback || function() {};

  return function() {

    if (req.body) {
      const action = req.body[paths.action];

      if (/^(delete|reset)$/.test(action)) {
        _this.apply(item, action);
      }
    }

    if (req.files && req.files[paths.upload] && req.files[paths.upload].size) {
      let imageDelete;
      if (_this.options.autoCleanup && item.get(_this.paths.exists)) {
        // capture image delete promise
        imageDelete = _this.apply(item, 'delete');
      }
      if (typeof imageDelete === 'undefined') {
        _this.uploadFile(item, req.files[paths.upload], true, callback)
          .then((imageData) => {
            _this.setAvatarURLToCookie(res, imageData);
          });
      } else {
        imageDelete.then((result) => {
          // clear 'keystone.avatar' key from cookie after the avatar has been deleted
          _this.clearAvatarFromCookie(res);
          return _this.uploadFile(item, req.files[paths.upload], true, callback);
        })
          .then((imageData) => {
            _this.setAvatarURLToCookie(res, imageData);
          })
          .catch((err) => callback(err));
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

gcsavatar.prototype.handleRequest = function(item, req, res, paths, callback) {
  this.getRequestHandler(item, req, res, paths, callback)();
};

/*!
 * Export class
 */

module.exports = gcsavatar;
