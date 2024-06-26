var _ = require('underscore');
var FieldType = require('../Type');
var keystone = require('../../../');
var util = require('util');
var utils = require('keystone-utils');

/**
 * Relationship FieldType Constructor
 * @extends Field
 * @api public
 */
function relationship(list, path, options) {
  this.many = (options.many) ? true : false;
  this.filters = options.filters;
  this.createInline = (options.createInline) ? true : false;
  this.selectWithSort = (options.selectWithSort) ? true : false;
  this._defaultSize = 'full';
  this._nativeType = keystone.mongoose.Schema.Types.ObjectId;
  this._underscoreMethods = ['format'];
  this._properties = ['isValid', 'many', 'filters', 'createInline', 'selectWithSort'];
  relationship.super_.call(this, list, path, options);
}
util.inherits(relationship, FieldType);

/**
 * Get client-side properties to pass to react field.
 */
relationship.prototype.getProperties = function() {
  var refList = this.refList;
  return {
    refList: {
      singular: refList.singular,
      plural: refList.plural,
      path: refList.path,
      key: refList.key,
    },
  };
};

/**
 * Gets id and name for the related item(s) from populated values
 */

function expandRelatedItemData(item) {
  if (!item || !item.id) return undefined;
  return {
    id: item.id,
    name: this.refList.getDocumentName(item),
  };
}

function truthy(value) {
  return value;
}

relationship.prototype.getExpandedData = function(item) {
  var value = item.get(this.path);
  if (this.many) {
    if (!value || !Array.isArray(value)) return [];
    return value.map(expandRelatedItemData.bind(this)).filter(truthy);
  } else {
    return expandRelatedItemData.call(this, value);
  }
};

/**
 * Registers the field on the List's Mongoose Schema.
 */
relationship.prototype.addToSchema = function() {
  var field = this;
  var schema = this.list.schema;
  var def = {
    type: this._nativeType,
    ref: this.options.ref,
    index: (this.options.index ? true : false),
    required: (this.options.required ? true : false),
    unique: (this.options.unique ? true : false),
  };
  this.paths = {
    refList: this.options.refListPath || this._path.append('RefList'),
  };
  schema.path(this.path, this.many ? [def] : def);
  schema.virtual(this.paths.refList).get(function() {
    return keystone.list(field.options.ref);
  });
  if (this.many) {
    this.underscoreMethod('contains', function(find) {
      var value = this.populated(field.path) || this.get(field.path);
      if (typeof find === 'object') {
        find = find.id;
      }
      var result = _.some(value, function(value) {
        return (value + '' === find);
      });
      return result;
    });
  }
  this.bindUnderscoreMethods();
};

/**
 * Add filters to a query
 */
relationship.prototype.addFilterToQuery = function(filter, query) {
  query = query || {};
  if (!Array.isArray(filter.value)) {
    if (typeof filter.value === 'string' && filter.value) {
      filter.value = [filter.value];
    } else {
      filter.value = [];
    }
  }
  if (filter.value.length) {
    query[this.path] = (filter.inverted) ? { $nin: filter.value } : { $in: filter.value };
  } else {
    if (this.many) {
      query[this.path] = (filter.inverted) ? { $not: { $size: 0 } } : { $size: 0 };
    } else {
      query[this.path] = (filter.inverted) ? { $ne: null } : null;
    }
  }
  return query;
};

/**
 * Formats the field value
 */
relationship.prototype.format = function(item) {
  var value = item.get(this.path);
  // force the formatted value to be a string - unexpected things happen with ObjectIds.
  return this.many ? value.join(', ') : (value || '') + '';
};

/**
 * Validates that a value for this field has been provided in a data object
 */
relationship.prototype.inputIsValid = function(data, required, item) {
  if (!required) return true;
  if (!(this.path in data) && item && ((this.many && item.get(this.path).length) || item.get(this.path))) return true;
  if (typeof data[this.path] === 'string') {
    return (data[this.path].trim()) ? true : false;
  } else {
    return (data[this.path]) ? true : false;
  }
};

/**
 * Updates the value for this field in the item from a data object.
 * Only updates the value if it has changed.
 * Treats an empty string as a null value.
 */
relationship.prototype.updateItem = function(item, data, callback) {
  if (!(this.path in data)) {
    return process.nextTick(callback);
  }
  if (item.populated(this.path)) {
    throw new Error('fieldTypes.relationship.updateItem() Error - You cannot update populated relationships.');
  }
  if (this.many) {
    var arr = item.get(this.path);
    var _old = arr.map(function(i) { return String(i); });
    var _new = data[this.path];
    if (!utils.isArray(_new)) {
      _new = String(_new || '').split(',');
    }
    _new = _.compact(_new);
    // Only update if the lists aren't the same
    if (!_.isEqual(_old, _new)) {
      item.set(this.path, _new);
    }
  } else {
    if (data[this.path]) {
      if (data[this.path] !== item.get(this.path)) {
        item.set(this.path, data[this.path]);
      }
    } else if (item.get(this.path)) {
      item.set(this.path, null);
    }
  }
  process.nextTick(callback);
};

/**
 * Returns true if the relationship configuration is valid
 */
Object.defineProperty(relationship.prototype, 'isValid', {
  get: function() {
    return keystone.list(this.options.ref) ? true : false;
  },
});

/**
 * Returns the Related List
 */
Object.defineProperty(relationship.prototype, 'refList', {
  get: function() {
    return keystone.list(this.options.ref);
  },
});

/**
 * Whether the field has any filters defined
 */
Object.defineProperty(relationship.prototype, 'hasFilters', {
  get: function() {
    return (this.filters && _.keys(this.filters).length);
  },
});

/**
 * Adds relationship filters to a query
 */
// TODO: Deprecate this? Not sure it's used anywhere - JW
relationship.prototype.addFilters = function(query, item) {
  _.each(this.filters, function(filters, path) {
    if (!utils.isObject(filters)) {
      filters = { equals: filters };
    }
    query.where(path);
    _.each(filters, function(value, method) {
      if (typeof value === 'string' && value.substr(0, 1) === ':') {
        if (!item) {
          return;
        }
        value = item.get(value.substr(1));
      }
      query[method](value);
    });
  });
};

/* Export Field Type */
module.exports = relationship;
