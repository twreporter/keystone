import React from 'react';
import { SegmentedControl } from 'elemental';

const TOGGLE_OPTIONS = [
  { label: 'Is Checked', value: true },
  { label: 'Is NOT Checked', value: false },
];

function getDefaultValue() {
  return {
    value: true,
  };
}

var BooleanFilter = React.createClass({
  propTypes: {
    filter: React.PropTypes.shape({
      value: React.PropTypes.bool,
    }),
  },
  statics: {
    getDefaultValue: getDefaultValue,
  },
  getDefaultProps() {
    return {
      filter: getDefaultValue(),
    };
  },
  updateValue(value) {
    this.props.onChange({ value });
  },
  render() {
    return <SegmentedControl equalWidthSegments options={TOGGLE_OPTIONS} value={this.props.filter.value} onChange={this.updateValue} />;
  },
});

module.exports = BooleanFilter;
