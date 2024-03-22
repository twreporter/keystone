import React from 'react';
import xhr from 'xhr';
import Select from 'react-select';
import { Alert, Button, Modal } from 'elemental';

var CreateReviewModal = React.createClass({
  displayName: 'CreateReviewModal',
  propTypes: {
    err: React.PropTypes.object,
    isOpen: React.PropTypes.bool,
    list: React.PropTypes.object,
    onCancel: React.PropTypes.func,
    onReviewsAdd: React.PropTypes.func,
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
    item.href = Keystone.adminPath + '/posts/' + item.id;
    this._itemsCache[item.id] = item;
  },
  loadOptions(input, callback) {
    xhr({
      url: Keystone.adminPath + '/api/posts?search=' + input + '&select=slug%2CreviewWord',
      responseType: 'json',
    }, (err, resp, data) => {
      if (err || !data || !data.results) {
        console.error('Error loading items:', err);
        return callback(err, []);
      }
      const selectedIDs = Array.isArray(this.props.values) ? this.props.values.map(review => review.post_id) : [];
      callback(null, {
        options: data.results.filter(post => post && post.id && !selectedIDs.includes(post.id)),
        complete: data.results.length === data.count,
      });
    });
  },
  onValueChange(value) {
    this.setState({ value });
  },
  onReviewsAdd() {
    const selectedPosts = this.state.value;
    if (Array.isArray(selectedPosts) && selectedPosts.length > 0 && this.props.onReviewsAdd) {
      this.props.onReviewsAdd(selectedPosts.map(selectedPost => {
        return {
          id: selectedPost.id,
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
        <Modal.Header text="查詢並選擇要加入報導回顧的文章 slug" onClose={this.props.onCancel} showCloseButton />
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
          <Button type="success" onClick={this.onReviewsAdd} disabled={disableAdd}>Add</Button>
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

module.exports = CreateReviewModal;
