import React from 'react';
import xhr from 'xhr';
import Select from 'react-select';
import { Alert, Button, Modal } from 'elemental';
import Fields from '../fields';

var CreateLatestModal = React.createClass({
  displayName: 'CreateLatestModal',
  propTypes: {
    err: React.PropTypes.object,
    isOpen: React.PropTypes.bool,
    list: React.PropTypes.object,
    onCancel: React.PropTypes.func,
    onLatestsAdd: React.PropTypes.func,
    values: React.PropTypes.object,
  },
  getDefaultProps() {
    return {
      err: null,
      values: {},
      isOpen: false,
    };
  },
  getInitialState() {
    var values = Object.assign({}, this.props.values);

    Object.keys(this.props.list.fields).forEach(key => {
      var field = this.props.list.fields[key];

      if (!values[field.path]) {
        values[field.path] = field.defaultValue;
      }
    });
    return {
      value: '',
      values: values,
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
    // latest's option: non-latest + non-subcategory
    // non-latest: !(latest_order > 0)
    // non-subcategory: !(category.length > 0)
    const filters = 'filters=' + encodeURIComponent('{"latest_order":{"mode":"lte&null","value":0}}') + '&select=category';
    xhr({
      url: Keystone.adminPath + '/api/tags?search=' + input + '&' + filters,
      responseType: 'json',
    }, (err, resp, data) => {
      if (err || !data || !data.results) {
        console.error('Error loading items:', err);
        return callback(err, []);
      }
      const filteredResults = data.results.filter(tag => !(tag && tag.fields && Array.isArray(tag.fields.category) && tag.fields.category.length > 0));
      filteredResults.forEach(this.cacheItem);
      callback(null, {
        options: filteredResults,
        complete: data.results.length === data.count,
      });
    });
  },
  handleChange(event) {
    var values = Object.assign({}, this.state.values);
    values[event.path] = event.value;
    this.setState({ values: values });
  },
  getFieldProps(field) {
    var props = Object.assign({}, field);
    props.value = this.state.values[field.path];
    props.values = this.state.values;
    props.onChange = this.handleChange;
    props.mode = 'create';
    props.key = field.path;
    return props;
  },
  onValueChange(value) {
    this.setState({ value });
  },
  onLatestsAdd() {
    const selectedTags = this.state.value;
    const tagsArray = Array.isArray(selectedTags) ? selectedTags : selectedTags.split(',');
    if (tagsArray && tagsArray.length > 0 && this.props.onLatestsAdd) {
      this.props.onLatestsAdd(tagsArray);
    }
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
    if (!this.props.isOpen) return;

    var list = this.props.list;
    var nameField = this.props.list.nameField;
    var focusRef;

    if (list.nameIsInitial) {
      var nameFieldProps = this.getFieldProps(nameField);
      nameFieldProps.ref = focusRef = 'focusTarget';
      if (nameField.type === 'text') {
        nameFieldProps.className = 'item-name-field';
        nameFieldProps.placeholder = nameField.label;
        nameFieldProps.label = false;
      }
    }

    Object.keys(list.initialFields).forEach(key => {
      var field = list.fields[list.initialFields[key]];
      if (typeof Fields[field.type] !== 'function') {
        return;
      }
      var fieldProps = this.getFieldProps(field);
      if (!focusRef) {
        fieldProps.ref = focusRef = 'focusTarget';
      }
    });

    return (
      <div>
        <Modal.Header text="Add new tags" onClose={this.props.onCancel} showCloseButton />
        <Modal.Body>
          <Select.Async
            multi
            simpleValue
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
          <Button type="success" onClick={this.onLatestsAdd} disabled={!this.state.value}>Add</Button>
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
