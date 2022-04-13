import React from 'react';
import update from 'react/lib/update';
import async from 'async';
import xhr from 'xhr';
import Select from 'react-select';

import Field from '../Field';
import { PickUp, SlugSelectionComponent } from './SlugSelectionComponent';

function compareValues(current, next) {
  let currentLength = current ? current.length : 0;
  let nextLength = next ? next.length : 0;
  if (currentLength !== nextLength) return false;
  for (let i = 0; i < currentLength; i++) {
    if (current[i] !== next[i]) return false;
  }
  return true;
}

function sortDate(dateStr1, dateStr2, isAscending) {
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
      selectedIds: [],
      pickUpStatus: PickUp.NONE
    };
  },

  componentDidMount() {
    this._itemsCache = {};
    this._articleOptions = [];
    this.loadOptions(this.props.value);
    this.loadArticleInfo(this.props.value);
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.value === this.props.value || nextProps.many && compareValues(this.props.value, nextProps.value)) return;
    this.loadArticleInfo(nextProps.value);
  },

  shouldCollapse() {
    return this.props.collapse && !this.props.value.length;
  },

  buildFilters() {
    var filters = {};
    _.each(this.props.filters, (value, key) => {
      if (_.isString(value) && value[0] == ':') { // eslint-disable-line eqeqeq
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

  loadArticleInfo(articleIds) {
    if (!articleIds) {
      this.setState({ loading: false, value: null, selectedIds: [] });
      return;
    };
    articleIds = Array.isArray(articleIds) ? articleIds : articleIds.split(',');
    let cachedValues = articleIds.map(id => this._itemsCache[id]).filter(i => i);
    if (cachedValues.length === articleIds.length) {
      this.setState({ loading: false, value: this.props.many ? cachedValues : cachedValues[0], selectedIds: cachedValues.map(article => article.id) });
      return;
    }
    this.setState({ loading: true, value: null, selectedIds: [] });
    async.map(articleIds, (articleId, done) => {
      xhr({
        url: Keystone.adminPath + '/api/' + this.props.refList.path + '/' + articleId,
        responseType: 'json',
      }, (err, resp, data) => {
        if (err || !data) return done(err);
        this.cacheItem(data);
        done(err, data);
      });
    }, (err, expanded) => {
      if (!this.isMounted()) return;
      this.setState({ loading: false, value: this.props.many ? expanded : expanded[0], selectedIds: expanded.map(article => article.id) });
    });
  },

  // TODO: seems not all articles, there should be an input for search
  loadOptions(articleIds) {
    articleIds = Array.isArray(articleIds) ? articleIds : articleIds.split(',');
    const filters = this.buildFilters();
    xhr({
      url: Keystone.adminPath + '/api/' + this.props.refList.path + '?basic&search=' + '' + '&' + filters,
      responseType: 'json',
    }, (err, resp, data) => {
      if (err) {
        console.error('Error loading items:', err);
        return;
      }
      data.results.forEach(article => this._articleOptions.push({ label: article.slug, value: article.id }));
      data.results.forEach(this.cacheItem);
      this.setState({ options: this._articleOptions.filter(articleOption => articleOption && !articleIds.includes(articleOption.value)) });
    });
  },

  updatePickUpStatus() {
    const { value } = this.state;
    if (!Array.isArray(value)) {
      return;
    }

    let numPickedUp = 0;
    value.forEach(article => {
      if (article && article.isPickedUpToRemove) {
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

  onPickUpSingle(articleId) {
    const { value } = this.state;
    const article = Array.isArray(value) ? value.find(article => article && article.id === articleId) : undefined;
    if (article) {
      article.isPickedUpToRemove = !article.isPickedUpToRemove ? true : false;
    }
    this.setState({ value }, this.updatePickUpStatus);
  },

  onPickUpAll() {
    const { value, pickUpStatus } = this.state;
    if (!Array.isArray(value)) {
      return;
    }
    const invertedStatus = pickUpStatus === PickUp.NONE ? PickUp.ALL : PickUp.NONE;
    value.forEach(article => { article.isPickedUpToRemove = invertedStatus === PickUp.ALL; });
    this.setState({
      value: value,
      pickUpStatus: invertedStatus
    });
  },

  onPickedUpRemove() {
    const { value, selectedIds, pickUpStatus } = this.state;
    if (!Array.isArray(value) || pickUpStatus === PickUp.NONE) {
      return;
    }

    const pickedUp = value.filter(article => article && article.isPickedUpToRemove);
    const notPickedUp = value.filter(article => article && !article.isPickedUpToRemove);
    // clean up 'isPickedUpToRemove' field in picked up articles
    if (pickedUp && pickedUp.length > 0) {
      pickedUp.forEach(article => {
        if (article) {
          article.isPickedUpToRemove = false;
        }
      });
      const pickedUpIds = pickedUp.map(article => article.id);
      const remainedIds = selectedIds.filter(articleId => !pickedUpIds.includes(articleId));
      this.setState({ selectedIds: remainedIds, options: this._articleOptions.filter(option => !pickedUpIds.includes(option.value)) });
    }
    this.setState({ value: notPickedUp }, this.updatePickUpStatus);
  },

  onSort(isAscending) {
    const { value } = this.state;
    if (!Array.isArray(value) || value.length <= 0) {
      return;
    }
    this.setState({
      value: value.sort(function(articleA, articleB) {
        return articleA && articleB && articleA.fields && articleB.fields ? sortDate(articleA.fields.publishedDate, articleB.fields.publishedDate, isAscending) : -1;
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
    if (selectedOption && selectedOption.value) {
      const { value, selectedIds } = this.state;
      const newSelectedIds = [...selectedIds, selectedOption.value];
      this.setState({
        value: [...value, this._itemsCache[selectedOption.value]],
        selectedIds: newSelectedIds,
        options: this._articleOptions.filter(option => !newSelectedIds.includes(option.value))
      });
      this.props.onChange({
        path: this.props.path,
        value: newSelectedIds.join(','),
      });
    }
  },

  // Use hidden <input> to send ids of selected articles when parent <form> fires submit event
  renderHiddenInputs() {
    const { selectedIds } = this.state;
    return Array.isArray(selectedIds) && selectedIds.length > 0 ? selectedIds.map((articleId, index) => <input type="hidden" key={`hidden-input-${index}`} name={this.props.path} value={articleId} />) : null;
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
        <SlugSelectionComponent
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
