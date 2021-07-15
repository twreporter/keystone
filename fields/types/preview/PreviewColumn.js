import React from 'react';
import ItemsTableCell from '../../../admin/client/components/ItemsTableCell';
import ItemsTableValue from '../../../admin/client/components/ItemsTableValue';

var PreviewColumn = React.createClass({
  displayName: 'PreviewColumn',
  propTypes: {
    col: React.PropTypes.object,
    data: React.PropTypes.object,
  },
  renderValue() {
    const previewOrigin = Keystone.previewOrigin || 'https://keystone-preview.twreporter.org';
    return (
      <ItemsTableValue truncate={false} field={this.props.col.type}>
        <a style={{ textDecoration: 'underline' }} href={`${previewOrigin}/a/${this.props.data.slug}`} target="_blank" >{this.props.col.label}</a>
      </ItemsTableValue>
    );
  },
  render() {
    return (
      <ItemsTableCell>
        {this.renderValue()}
      </ItemsTableCell>
    );
  },
});

module.exports = PreviewColumn;
