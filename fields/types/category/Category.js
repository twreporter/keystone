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

module.exports = Field.create({

  displayName: 'RelationshipField',

  getInitialState() {
    return {
      value: null,
    };
  },

  onAddCategorySet() {
    console.log('onAddCategorySet');
  },

  renderCategorySelect() {
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

    return (
      <div>
        <div style={categorySetStyle}>
          <div style={menuStyle}><Select placeholder="分類" options={majorCategoryOptions} value={null} /></div>
          <div style={menuStyle}><Select placeholder="子分類" options={subCategoryOptions} value={null} /></div>
        </div>
        <div style={categorySetStyle}>
          <div style={menuStyle}><Select placeholder="分類" options={majorCategoryOptions} value={null} /></div>
          <div style={menuStyle}><Select placeholder="子分類" options={subCategoryOptions} value={null} /></div>
        </div>
        <div style={btnContainerStyle}><button onClick={this.onAddCategorySet}>新增分類</button></div>
      </div>
    );
  },

  renderValue() {
    return this.renderCategorySelect();
  },

  renderField() {
    return this.renderCategorySelect();
  },
});
