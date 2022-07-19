import React from 'react';
import Select from 'react-select';

import Field from '../Field';

const categorySetStyle = {
  display: 'flex',
  flexDirection: 'row',
};

const menuStyle = {
  flexGrow: 1
};

const btnContainerStyle = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end'
};

const btnStyle = {
  border: 'none',
  backgroundColor: 'transparent'
};

const majorCategoryOptions = [
  { value: '國際兩岸', label: '國際兩岸' },
  { value: '人權司法', label: '人權司法' },
  { value: '政治社會', label: '政治社會' },
  { value: '醫療健康', label: '醫療健康' },
  { value: '環境永續', label: '環境永續' },
  { value: '經濟產業', label: '經濟產業' },
  { value: '文化生活', label: '文化生活' },
  { value: '教育校園', label: '教育校園' },
];

const subCategoryOptions = [
  { value: '香港', label: '香港' },
  { value: '中國', label: '中國' },
  { value: '美國', label: '美國' },
  { value: '日韓', label: '日韓' },
  { value: '東南亞', label: '東南亞' },
  { value: '歐洲', label: '歐洲' },
  { value: '其他', label: '其他' },
];

module.exports = Field.create({

  displayName: 'RelationshipField',

  getInitialState() {
    return {
      value: [{ major: '國際兩岸', sub: '香港' }],
    };
  },

  onAddCategorySet() {
    this.setState({ value: [...this.state.value, { major: null, sub: null }] });
  },

  onRemoveCategorySet(index) {
    const { value } = this.state;
    if (Array.isArray(value) && index >= 0 && index < value.length) {
      const newCategorySet = value.filter((categorySet, i) => i !== index);
      this.setState({ value: newCategorySet });
    }
  },

  renderCategorySelect() {
    const { value } = this.state;
    if (Array.isArray(value)) {
      return value.map((categorySet, index) => {
        return (
          <div key={`categorySet-${index}`} style={categorySetStyle}>
            {index > 0 ? <button type="button" className="ItemList__control ItemList__control--delete-no-focus" onClick={() => this.onRemoveCategorySet(index)}><span className={'octicon octicon-trashcan'} /></button> : null}
            <div style={menuStyle}><Select placeholder="分類" options={majorCategoryOptions} value={categorySet.major} /></div>
            <div style={menuStyle}><Select placeholder="子分類" options={subCategoryOptions} value={categorySet.sub} /></div>
          </div>
        );
      });
    }
    return null;
  },

  renderHiddenInputs() {
    // TODO: render hidden input for post
    const { value } = this.state;
    if (Array.isArray(value)) {
      return value.map((categorySet, index) => {
        return <input type="hidden" key={`hidden-input-${index}`} name={this.props.path} value={categorySet.major} />;
      });
    }
    return null;
  },

  renderCategorySelector() {
    return (
      <div>
        {this.renderCategorySelect()}
        <div style={btnContainerStyle}><button type="button" style={btnStyle} onClick={this.onAddCategorySet}>新增分類</button></div>
        {this.renderHiddenInputs()}
      </div>
    );
  },

  renderValue() {
    return this.renderCategorySelector();
  },

  renderField() {
    return this.renderCategorySelector();
  },
});
