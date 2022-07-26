import React from 'react';
import Select from 'react-select';

import Field from '../Field';

const categorySetStyle = {
  display: 'flex',
  flexDirection: 'row',
  marginBottom: '20px',
};

const majorMenuStyle = {
  flexGrow: 1,
  marginRight: '16px',
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

/*
香港 中國 美國 日韓 東南亞、歐洲、其他

性別 勞動 移工與移民 居住正義 轉型正義 精神疾病 司法改革 數位人權

選舉 政黨與地方政治 政策 交通 食安 資訊戰 社會觀察

疫情 醫療政策 生物科技 病人自主權利 心理 長照 公共衛生

能源 海洋 山林 動物 環境污染 自然災害

經濟 能源 農業 科技

體育 電影 文學 音樂 戲劇 藝術

教育政策 高等教育 青少年 育兒 少子化
*/

module.exports = Field.create({

  displayName: 'RelationshipField',

  getInitialState() {
    return {
      value: [{ major: '國際兩岸', sub: '香港' }],
    };
  },

  onAddCategorySet() {
    this.setState({ value: [...this.state.value, { major: '', sub: '' }] });
  },

  onRemoveCategorySet(index) {
    const { value } = this.state;
    if (Array.isArray(value) && index >= 0 && index < value.length) {
      const newCategorySet = value.filter((categorySet, i) => i !== index);
      this.setState({ value: newCategorySet });
    }
  },

  onUpdateCategorySet(index, categorySet) {
    const { value } = this.state;
    if (categorySet && Array.isArray(value) && index >= 0 && index < value.length) {
      const frontCategorySets = value.slice(0, index);
      const backCategorySets = value.slice(index + 1);
      const newValue = [...frontCategorySets, categorySet, ...backCategorySets];
      this.setState({ value: newValue });
    }
  },

  onUpdateSubCategory(index, newSub) {
    const { value } = this.state;
    if (newSub && Array.isArray(value) && index >= 0 && index < value.length) {
      const newCategorySet = { major: value[index].major, sub: newSub };
      this.onUpdateCategorySet(index, newCategorySet);
    }
  },

  renderCategorySelect() {
    const { value } = this.state;
    if (Array.isArray(value)) {
      return value.map((categorySet, index) => {
        return (
          <div key={`categorySet-${index}`} style={categorySetStyle}>
            {index > 0
              ? <button type="button" className="ItemList__control ItemList__control--delete-no-focus" onClick={() => this.onRemoveCategorySet(index)}><span className={'octicon octicon-trashcan'} /></button>
              : <div className="ItemList__control ItemList__control--delete-no-focus" />
            }
            <div style={majorMenuStyle}><Select placeholder="分類" clearable={false} options={majorCategoryOptions} value={categorySet.major} onChange={(selected) => this.onUpdateCategorySet(index, { major: selected.value, sub: '' })} /></div>
            <div style={menuStyle}><Select placeholder="子分類" disabled={!categorySet.major} clearable={false} options={subCategoryOptions} value={categorySet.sub} onChange={(selected) => this.onUpdateSubCategory(index, selected.value)} /></div>
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
