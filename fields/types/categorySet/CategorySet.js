import React from 'react';
import Select from 'react-select';
import xhr from 'xhr';

import Field from '../Field';

const categorySetStyle = {
  display: 'flex',
  flexDirection: 'row',
  marginBottom: '20px',
};

const categoryMenuStyle = {
  flexGrow: 1,
  marginRight: '16px',
};

const subCategoryMenuStyle = {
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

const categoryMap = new Map([
  ['國際兩岸', ['香港', '中國', '美國', '日韓', '東南亞', '歐洲', '其他']],
  ['人權司法', ['性別', '勞動', '移工與移民', '居住正義', '轉型正義', '精神疾病', '司法改革', '數位人權']],
  ['政治社會', ['選舉', '政黨與地方政治', '政策', '交通', '食安', '資訊戰', '社會觀察']],
  ['醫療健康', ['疫情', '醫療政策', '生物科技', '病人自主權利', '心理', '長照', '公共衛生']],
  ['環境永續', ['能源', '海洋', '山林', '動物', '環境污染', '自然災害']],
  ['經濟產業', ['經濟', '能源', '農業', '科技']],
  ['文化生活', ['體育', '電影', '文學', '音樂', '戲劇', '藝術']],
  ['教育校園', ['教育政策', '高等教育', '青少年', '育兒', '少子化']],
]);

const categoryOptions = Array.from(categoryMap.keys()).map(category => { return { value: category, label: category }; });

module.exports = Field.create({

  displayName: 'RelationshipField',

  // TODO: how to get initial value?
  getInitialState() {
    return {
      value: [{ category: '國際兩岸', subCategory: '香港' }],
    };
  },

  componentDidMount() {
    this._itemsCache = {};
    // TODO: load category options
    // this.loadOptions();
  },

  // TODO:
  // get category options from http://localhost:3000/keystone/api/post-categories?basic&search=&
  loadOptions() {
    // use filter for old/new compatible
    const filters = '';
    xhr({
      url: Keystone.adminPath + '/api/' + this.props.refList.path + '?basic&search=' + '&' + filters,
      responseType: 'json',
    }, (err, resp, data) => {
      if (err || !data || !data.results) {
        console.error('Error loading items:', err);
        return;
      }
      data.results.forEach(this.cacheItem);
    });
  },

  onAddCategorySet() {
    this.setState({ value: [...this.state.value, { category: '', subCategory: '' }] });
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

  onUpdateSubCategory(index, newSubCategory) {
    const { value } = this.state;
    if (newSubCategory && Array.isArray(value) && index >= 0 && index < value.length) {
      const newCategorySet = { category: value[index].category, subCategory: newSubCategory };
      this.onUpdateCategorySet(index, newCategorySet);
    }
  },

  renderCategorySetSelect() {
    const { value } = this.state;
    if (Array.isArray(value)) {
      return value.map((categorySet, index) => {
        let subCategoryOptions = categoryMap.get(categorySet.category);
        if (Array.isArray(subCategoryOptions)) {
          subCategoryOptions = subCategoryOptions.map(subcategory => { return { value: subcategory, label: subcategory }; });
        }
        return (
          <div key={`categorySet-${index}`} style={categorySetStyle}>
            {index > 0
              ? <button type="button" className="ItemList__control ItemList__control--delete-no-focus" onClick={() => this.onRemoveCategorySet(index)}><span className={'octicon octicon-trashcan'} /></button>
              : <div className="ItemList__control ItemList__control--delete-no-focus" />
            }
            <div style={categoryMenuStyle}><Select placeholder="分類" clearable={false} options={categoryOptions} value={categorySet.category} onChange={(selected) => this.onUpdateCategorySet(index, { category: selected.value, subCategory: '' })} /></div>
            <div style={subCategoryMenuStyle}><Select placeholder="子分類" disabled={!categorySet.category || !subCategoryOptions} clearable={false} options={subCategoryOptions} value={categorySet.subCategory} onChange={(selected) => this.onUpdateSubCategory(index, selected.value)} /></div>
          </div>
        );
      });
    }
    return null;
  },

  // TODO: check save values
  renderHiddenInputs() {
    const { value } = this.state;
    if (Array.isArray(value)) {
      let categorySetStr = '[';
      value.forEach((categorySet, index) => {
        if (categorySet && categorySet.category) {
          categorySetStr += `{${categorySet.category}, ${categorySet.subCategory}}${index < value.length - 1 ? ',' : ''}`;
        }
      });
      categorySetStr += ']';
      return <input type="hidden" name={'categorySet'} value={categorySetStr} />;
    }
    return null;
  },

  renderCategorySetSelector() {
    return (
      <div>
        {this.renderCategorySetSelect()}
        <div style={btnContainerStyle}><button type="button" style={btnStyle} onClick={this.onAddCategorySet}>新增分類</button></div>
        {this.renderHiddenInputs()}
      </div>
    );
  },

  renderValue() {
    return this.renderCategorySetSelector();
  },

  renderField() {
    return this.renderCategorySetSelector();
  },
});
