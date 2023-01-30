import React from 'react';
import xhr from 'xhr';
import Select from 'react-select';
import { Alert, Button, Modal } from 'elemental';

var CreateLatestModal = React.createClass({
  displayName: 'CreateLatestModal',
  propTypes: {
    err: React.PropTypes.object,
    isOpen: React.PropTypes.bool,
    list: React.PropTypes.object,
    onCancel: React.PropTypes.func,
    onLatestsAdd: React.PropTypes.func,
    values: React.PropTypes.array,
  },
  getDefaultProps() {
    return {
      err: null,
      values: [],
      isOpen: false,
    };
  },
  getInitialState() {
    return {
      value: null,
      err: this.props.err,
    };
  },
  componentDidMount() {
    this._itemsCache = {};
    if (this.refs.focusTarget) {
      this.refs.focusTarget.focus();
    }
  },
  componentDidUpdate(prevProps) {
    if (this.props.isOpen !== prevProps.isOpen) {
      // focus the focusTarget after the "open modal" CSS animation has started
      setTimeout(() => this.refs.focusTarget && this.refs.focusTarget.focus(), 0);
    }
  },
  cacheItem(item) {
    item.href = Keystone.adminPath + '/tags/' + item.id;
    this._itemsCache[item.id] = item;
  },
  loadOptions(input, callback) {
    // latest's option: non-subcategory + non-latest
    // non-subcategory: !(category.length > 0)
    // non-latest: this.props.values
    xhr({
      url: Keystone.adminPath + '/api/tags?search=' + input + '&select=category',
      responseType: 'json',
    }, (err, resp, data) => {
      if (err || !data || !data.results) {
        console.error('Error loading items:', err);
        return callback(err, []);
      }
      const nonSubcategoryTags = data.results.filter(tag => !(tag && tag.fields && Array.isArray(tag.fields.category) && tag.fields.category.length > 0));
      nonSubcategoryTags.forEach(this.cacheItem);
      const selectedIDs = Array.isArray(this.props.values) ? this.props.values.map(tag => tag.id) : [];
      callback(null, {
        options: nonSubcategoryTags.filter(tag => tag && tag.id && !selectedIDs.includes(tag.id)),
        complete: data.results.length === data.count,
      });
    });
  },
  onValueChange(value) {
    this.setState({ value });
  },
  onLatestsAdd() {
    const selectedTags = this.state.value;
    if (Array.isArray(selectedTags) && selectedTags.length > 0 && this.props.onLatestsAdd) {
      this.props.onLatestsAdd(selectedTags.map(selectedTag => {
        return {
          id: selectedTag.id,
          name: selectedTag.name
        };
      }));
    }
    this.setState({ value: null });
  },
  renderAlerts() {
    if (!this.state.err || !this.state.err.errors) return;

    let errors = this.state.err.errors;
    var alertContent;
    var errorCount = Object.keys(errors).length;
    var messages = Object.keys(errors).map((path) => {
      return errorCount > 1 ? <li key={path}>{errors[path].message}</li> : <div key={path}>{errors[path].message}</div>;
    });

    if (errorCount > 1) {
      alertContent = (
        <div>
          <h4>There were {errorCount} errors creating the new {this.props.list.singular}:</h4>
          <ul>{messages}</ul>
        </div>
      );
    } else {
      alertContent = messages;
    }

    return <Alert type="danger">{alertContent}</Alert>;
  },
  renderSelect() {
    const { value } = this.state;
    const disableAdd = !value || (Array.isArray(value) && value.length <= 0);
    if (!this.props.isOpen) return;
    return (
      <div>
        <Modal.Header text="Add new tags" onClose={this.props.onCancel} showCloseButton />
        <Modal.Body>
          <Select.Async
            multi
            placeholder="Select..."
            labelKey="name"
            valueKey="id"
            value={this.state.value}
            loadOptions={this.loadOptions}
            onChange={this.onValueChange}
          />
          {this.renderAlerts()}
        </Modal.Body>
        <Modal.Footer>
          <Button type="success" onClick={this.onLatestsAdd} disabled={disableAdd}>Add</Button>
          <Button type="link-cancel" onClick={this.props.onCancel}>Cancel</Button>
        </Modal.Footer>
      </div>
    );
  },
  render() {
    return (
      <Modal isOpen={this.props.isOpen} onCancel={this.props.onCancel} backdropClosesModal>
        {this.renderSelect()}
      </Modal>
    );
  },
});

module.exports = CreateLatestModal;
