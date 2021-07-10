import React from 'react';
import ReactDOM from 'react-dom';

import { FormField, FormInput, FormSelect } from 'elemental';

const modeOptions = [
  { label: '描述裡包含：', value: 'caption_contains', placeholder: '請輸入您想搜尋的字串' },
  { label: '關鍵字裡包含：', value: 'keywords_contains', placeholder: '請輸入關鍵字，例如：海龜' },
  { label: '製作程式裡包含：', value: 'byline_contains', placeholder: '請輸入拍攝者，例如：余志偉' },
  { label: '製作日期裡包含：', value: 'created_date_contains', placeholder: '請輸入製作日期，例如：20201204' },
];

function getDefaultValue() {
  return {
    mode: modeOptions[0].value,
    value: '',
  };
}

var GcsImageFilter = React.createClass({
  propTypes: {
    filter: React.PropTypes.shape({
      mode: React.PropTypes.oneOf(modeOptions.map(i => i.value)),
      value: React.PropTypes.string,
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
  updateFilter(value) {
    this.props.onChange({ ...this.props.filter, ...value });
  },
  selectMode(mode) {
    this.updateFilter({ mode });
    ReactDOM.findDOMNode(this.refs.focusTarget).focus();
  },
  updateValue(e) {
    this.updateFilter({ value: e.target.value });
  },
  render() {
    const { filter } = this.props;
    const mode = modeOptions.filter(option => option.value === filter.mode)[0];

    return (
      <div>
        <FormField>
        </FormField>
        <FormSelect options={modeOptions} onChange={this.selectMode} value={mode.value} />
        <FormField>
          <FormInput autofocus ref="focusTarget" value={this.props.filter.value} onChange={this.updateValue} placeholder={mode.placeholder} />
        </FormField>
      </div>
    );
  },
});

module.exports = GcsImageFilter;
