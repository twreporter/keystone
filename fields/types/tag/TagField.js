import React from 'react';
import Field from '../Field';

const tagStyle = {
  color: '#808080',
  border: '1px solid #808080',
  padding: '8px 16px',
  width: 'fit-content',
  borderRadius: '50px',
  fontSize: '16px',
};
module.exports = Field.create({
  displayName: 'TagField',
  renderUI() {
    return (
      <div style={tagStyle}>{this.props.label}</div>
    );
  },
});
