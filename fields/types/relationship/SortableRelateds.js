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
      selectedOptions: [],
      pickUpToRemove: PickUp.NONE
    };
  },

  componentDidMount() {
    this._itemsCache = {};
    this._articleOptions = [];
    this.loadOptions(this.props.value);
    this.loadSlugInfo(this.props.value);
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.value === this.props.value || nextProps.many && compareValues(this.props.value, nextProps.value)) return;
    this.loadSlugInfo(nextProps.value);
  },

  shouldCollapse() {
    if (this.props.many) { // TODO: remove this.props.many
      // many:true relationships have an Array for a value
      return this.props.collapse && !this.props.value.length;
    }
    return this.props.collapse && !this.props.value;
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

  loadSlugInfo(slugIds) {
    if (!slugIds) {
      this.setState({ loading: false, value: null, selectedOptions: [] });
      return;
    };
    slugIds = Array.isArray(slugIds) ? slugIds : slugIds.split(',');
    let cachedValues = slugIds.map(id => this._itemsCache[id]).filter(i => i);
    if (cachedValues.length === slugIds.length) {
      this.setState({ loading: false, value: this.props.many ? cachedValues : cachedValues[0], selectedOptions: cachedValues.map(article => article.id) });
      return;
    }
    this.setState({ loading: true, value: null, selectedOptions: [] });
    async.map(slugIds, (slugId, done) => {
      xhr({
        // TODO: make data simpler: id, slug text, publishedDate, isSelected
        url: Keystone.adminPath + '/api/' + this.props.refList.path + '/' + slugId,
        responseType: 'json',
      }, (err, resp, data) => {
        if (err || !data) return done(err);
        this.cacheItem(data);
        done(err, data);
      });
    }, (err, expanded) => {
      if (!this.isMounted()) return;
      this.setState({ loading: false, value: this.props.many ? expanded : expanded[0], selectedOptions: expanded.map(article => article.id) });
    });
  },

  // TODO: seems not all articles, there should be an input for search
  loadOptions(slugIds) {
    slugIds = Array.isArray(slugIds) ? slugIds : slugIds.split(',');
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
      this.setState({ options: this._articleOptions.filter(articleOption => articleOption && !slugIds.includes(articleOption.value)) });
    });
  },

  updatePickUpStatus() {
    const { value } = this.state;
    if (!Array.isArray(value)) {
      return;
    }

    let numPickedUp = 0;
    value.forEach((slug) => {
      if (slug && slug.isSlugSelected) {
        numPickedUp++;
      }
    });

    let pickUpStatus = PickUp.INDETERMINATE;
    if (numPickedUp === 0) {
      pickUpStatus = PickUp.NONE;
    } else if (numPickedUp === value.length) {
      pickUpStatus = PickUp.ALL;
    }

    this.setState({ pickUpToRemove: pickUpStatus });
  },

  onPickUpSingle(slugId) {
    const { value } = this.state;
    const slug = Array.isArray(value) ? value.find(slug => slug && slug.id === slugId) : undefined;
    if (slug) {
      slug.isSlugSelected = !slug.isSlugSelected ? true : false; // TODO: rename
    }
    this.setState({ value }, this.updatePickUpStatus);
  },

  onPickUpAll() {
    const { value, pickUpToRemove } = this.state;
    if (!Array.isArray(value)) {
      return;
    }
    const invertedStatus = pickUpToRemove === PickUp.NONE ? PickUp.ALL : PickUp.NONE;
    value.forEach(slug => { slug.isSlugSelected = invertedStatus === PickUp.ALL; });
    this.setState({
      value: value,
      pickUpToRemove: invertedStatus
    });
  },

  onPickedUpRemove() {
    const { value, selectedOptions, pickUpToRemove } = this.state;
    if (!Array.isArray(value) || pickUpToRemove === PickUp.NONE) {
      return;
    }
    const left = value.filter((slug) => slug && !slug.isSlugSelected);
    const selected = value.filter((slug) => slug && slug.isSlugSelected);
    // clean up isSlugSelected in selected slugs
    if (selected && selected.length > 0) {
      selected.forEach(slug => {
        if (slug) {
          slug.isSlugSelected = false;
        }
      });
      const selectedIds = selected.map(slug => slug.id);
      const selectedSlugIds = selectedOptions.filter(slugId => !selectedIds.includes(slugId));
      this.setState({ selectedOptions: selectedSlugIds, options: this._articleOptions.filter(option => !selectedSlugIds.includes(option.value)) });
    }
    this.setState({ value: left }, this.updatePickUpStatus);
  },

  onSort(isAscending) {
    const { value } = this.state;
    if (!Array.isArray(value) || value.length <= 0) {
      return;
    }
    this.setState({
      value: value.sort(function(slugA, slugB) {
        return slugA && slugB && slugA.fields && slugB.fields ? sortDate(slugA.fields.publishedDate, slugB.fields.publishedDate, isAscending) : -1;
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

  onSlugChange(selectedOption) {
    this.setState({ selectedOption: selectedOption });
    if (selectedOption && selectedOption.value) {
      const { value, selectedOptions } = this.state;
      const newSelectedSlugs = [...selectedOptions, selectedOption.value];
      this.setState({
        value: [...value, this._itemsCache[selectedOption.value]],
        selectedOptions: newSelectedSlugs,
        options: this._articleOptions.filter(option => !newSelectedSlugs.includes(option.value))
      });
      this.props.onChange({
        path: this.props.path,
        value: newSelectedSlugs.join(','),
      });
    }
  },

  // Use hidden <input> to send ids of selected articles when parent <form> fires submit event
  renderHiddenInputs() {
    const { selectedOptions } = this.state;
    return selectedOptions.length > 0 ? selectedOptions.map((slugId, index) => <input type="hidden" key={`hidden-input-${index}`} name={this.props.path} value={slugId} />) : null;
  },

  renderSelect(noedit) {
    return (
      <div>
        <Select
          disabled={noedit}
          options={this.state.options}
          onChange={this.onSlugChange}
          value={this.state.selectedOption}
        />
        <SlugSelectionComponent
          slugs={this.state.value}
          pickUpStatus={this.state.pickUpToRemove}
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
