import React from 'react';
import update from 'react/lib/update';
import async from 'async';
import xhr from 'xhr';
import Select from 'react-select';
import each from 'lodash/each';
import isEqual from 'lodash/isEqual';
import isString from 'lodash/isString';
import partition from 'lodash/partition';

import Field from '../Field';
import { PickUp, SlugSortComponent } from './SlugSortComponent';

const _ = {
  each,
  isEqual,
  isString,
  partition
};

function getDateDiff(dateStr1, dateStr2, isAscending) {
  const date1 = new Date(dateStr1);
  const date2 = new Date(dateStr2);
  const dateDiff = date1 && date2 ? date1 - date2 : 0;
  return (isAscending ? 1 : -1) * dateDiff;
}

module.exports = Field.create({

  displayName: 'RelationshipField',

  getInitialState() {
    return {
      value: null,
      options: [],
      selectedOption: null,
      pickUpStatus: PickUp.NONE
    };
  },

  componentDidMount() {
    this._itemsCache = {};
    this._options = [];
    this.loadOptions(this.props.value);
    this.loadPostInfo(this.props.value);
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.value === this.props.value || _.isEqual(this.props.value, nextProps.value)) return;
    this.loadPostInfo(nextProps.value);
  },

  shouldCollapse() {
    return this.props.collapse && !this.props.value.length;
  },

  buildFilters() {
    var filters = {};
    _.each(this.props.filters, (value, key) => {
      if (_.isString(value) && value[0] === ':') {
        var fieldName = value.slice(1);
        var val = this.props.values[fieldName];
        if (val) {
          filters[key] = val;
          return;
        }
        // check if filtering by id and item was already saved
        if (fieldName === ':_id' && Keystone.item) {
          filters[key] = Keystone.item.id;
          return;
        }
      } else {
        filters[key] = value;
      }
    }, this);

    var parts = [];
    _.each(filters, function(val, key) {
      parts.push('filters[' + key + '][value]=' + encodeURIComponent(val));
    });
    return parts.join('&');
  },

  cacheItem(item) {
    item.href = Keystone.adminPath + '/' + this.props.refList.path + '/' + item.id;
    this._itemsCache[item.id] = item;
  },

  loadPostInfo(postIds) {
    if (!postIds) {
      this.setState({ loading: false, value: null });
      return;
    };
    postIds = Array.isArray(postIds) ? postIds : postIds.split(',');
    let cachedValues = postIds.map(id => this._itemsCache[id]).filter(i => i);
    if (cachedValues.length === postIds.length) {
      this.setState({ loading: false, value: cachedValues });
      return;
    }
    this.setState({ loading: true, value: null });
    async.map(postIds, (postId, done) => {
      xhr({
        url: Keystone.adminPath + '/api/' + this.props.refList.path + '/' + postId,
        responseType: 'json',
      }, (err, resp, data) => {
        if (err || !data) return done(err);
        this.cacheItem(data);
        done(err, data);
      });
    }, (err, expanded) => {
      if (!this.isMounted()) return;
      this.setState({ loading: false, value: expanded });
    });
  },

  loadOptions(postIds) {
    const filters = this.buildFilters();
    xhr({
      url: Keystone.adminPath + '/api/' + this.props.refList.path + '?basic&' + filters,
      responseType: 'json',
    }, (err, resp, data) => {
      if (err) {
        console.error('Error loading items:', err);
        return;
      }
      data.results.forEach(post => {
        if (post) {
          this._options.push({ label: post.slug, value: post.id });
          this.cacheItem(post);
        }
      });
      postIds = Array.isArray(postIds) ? postIds : postIds.split(',');
      this.setState({ options: this._options.filter(postOption => postOption && !postIds.includes(postOption.value)) });
    });
  },

  updatePickUpStatus() {
    const { value } = this.state;
    if (!Array.isArray(value)) {
      return;
    }

    let numPickedUp = 0;
    value.forEach(post => {
      if (post && post.isPickedUpToRemove) {
        numPickedUp++;
      }
    });

    let pickUpStatus = PickUp.INDETERMINATE;
    if (numPickedUp === 0) {
      pickUpStatus = PickUp.NONE;
    } else if (numPickedUp === value.length) {
      pickUpStatus = PickUp.ALL;
    }

    this.setState({ pickUpStatus: pickUpStatus });
  },

  onPickUpSingle(postId) {
    const { value } = this.state;
    if (!Array.isArray(value)) {
      return;
    }
    const post = value.find(post => post && post.id === postId);
    if (post) {
      post.isPickedUpToRemove = !post.isPickedUpToRemove ? true : false;
    }
    this.setState({ value }, this.updatePickUpStatus);
  },

  onPickUpAll() {
    const { value, pickUpStatus } = this.state;
    if (!Array.isArray(value)) {
      return;
    }
    const invertedStatus = pickUpStatus === PickUp.NONE ? PickUp.ALL : PickUp.NONE;
    value.forEach(post => { post.isPickedUpToRemove = invertedStatus === PickUp.ALL; });
    this.setState({
      value: value,
      pickUpStatus: invertedStatus
    });
  },

  onPickedUpRemove() {
    const { value, pickUpStatus } = this.state;
    if (!Array.isArray(value) || pickUpStatus === PickUp.NONE) {
      return;
    }

    const [pickedUp, remained] = _.partition(value, post => post && post.isPickedUpToRemove);
    // clean up 'isPickedUpToRemove' field in picked up posts & update options
    if (pickedUp && pickedUp.length > 0) {
      pickedUp.forEach(post => {
        if (post) {
          post.isPickedUpToRemove = false;
        }
      });
      const remainedIds = remained.map(post => post.id);
      this.setState({ options: this._options.filter(option => !remainedIds.includes(option.value)) });
    }

    // clean up <Select>'s value if there is no post selected
    if (remained.length === 0) {
      this.setState({ selectedOption: null });
    }

    this.setState({ value: remained }, this.updatePickUpStatus);
  },

  onSort(isAscending) {
    const { value } = this.state;
    if (!Array.isArray(value) || value.length <= 0) {
      return;
    }
    this.setState({
      value: value.sort(function(postA, postB) {
        if (!postA || !postB || !postA.fields || !postB.fields) {
          return -1;
        }
        return getDateDiff(postA.fields.publishedDate, postB.fields.publishedDate, isAscending);
      })
    });
  },

  onSlugDrag(dragIndex, hoverIndex) {
    const { value } = this.state;
    if (!Array.isArray(value) || value.length <= 0 || dragIndex < 0 || dragIndex >= value.length || hoverIndex < 0 || hoverIndex >= value.length) {
      return;
    }
    const dragSlug = value[dragIndex];
    this.setState(
      update(this.state, {
        value: {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragSlug]
          ]
        }
      })
    );
  },

  onOptionChange(selectedOption) {
    this.setState({ selectedOption: selectedOption });
    if (selectedOption && selectedOption.value && this._itemsCache[selectedOption.value]) {
      const { value } = this.state;
      const newSelectedPosts = [...value, this._itemsCache[selectedOption.value]];
      const newSelectedIds = newSelectedPosts.map(post => post.id);
      this.setState({
        value: newSelectedPosts,
        options: this._options.filter(option => !newSelectedIds.includes(option.value))
      });
      this.props.onChange({
        path: this.props.path,
        value: newSelectedIds.join(','),
      });
    }
  },

  // Use hidden <input> to send ids of selected posts when parent <form> fires submit event
  renderHiddenInputs() {
    const { value } = this.state;
    if (!Array.isArray(value) || value.length <= 0) {
      return <input type="hidden" name={this.props.path} value={''} />;
    }
    return value.map((post, index) => {
      return post && post.id ? <input type="hidden" key={`hidden-input-${index}`} name={this.props.path} value={post.id} /> : null;
    });
  },

  renderSelect(noedit) {
    return (
      <div>
        <Select
          disabled={noedit}
          options={this.state.options}
          onChange={this.onOptionChange}
          value={this.state.selectedOption}
        />
        <SlugSortComponent
          slugs={this.state.value}
          pickUpStatus={this.state.pickUpStatus}
          onPickUpSingle={this.onPickUpSingle}
          onPickUpAll={this.onPickUpAll}
          onPickedUpRemove={this.onPickedUpRemove}
          onSort={this.onSort}
          onSlugDrag={this.onSlugDrag}
        />
        {this.renderHiddenInputs()}
      </div>
    );
  },

  renderValue() {
    return this.renderSelect(true);
  },

  renderField() {
    return this.renderSelect();
  },

});
