import React from 'react';
import Select from 'react-select';
import xhr from 'xhr';
import async from 'async';

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

const subcategoryMenuStyle = {
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

module.exports = Field.create({

  displayName: 'RelationshipField',

  getInitialState() {
    let value = [];
    if (Array.isArray(this.props.value)) {
      this.props.value.forEach(categorySet => {
        if (categorySet && categorySet.category) {
          value.push({ category: categorySet.category, subcategory: categorySet.subcategory });
        }
      });
    }
    return {
      categoryOptions: null,
      subcategoryOptionsMap: null,
      value: value.length === 0 ? [{ category: undefined, subcategory: undefined }] : value,
    };
  },

  componentDidMount() {
    const getSubcategoryOptions = (subcategoryIDs, callback) => {
      async.map(subcategoryIDs, (subcategoryID, callback) => {
        xhr({
          url: Keystone.adminPath + `/api/tags?basic&search=${subcategoryID}`,
          responseType: 'json',
        }, (err, resp, data) => {
          if (err || !data || !Array.isArray(data.results) || data.results.length <= 0) {
            console.error('Error loading items:', err);
            return callback(err);
          }
          callback(null, { value: data.results[0].id, label: data.results[0].name });
        });
      }, callback);
    };

    xhr({
      url: Keystone.adminPath + '/api/post-categories?basic',
      responseType: 'json',
    }, (err, resp, data) => {
      if (err || !data || !Array.isArray(data.results)) {
        console.error('Error loading items:', err);
        alert('Fetch category failed! Please reload this page and try again.');
        return;
      }
      let categoryOptions = [];
      let subcategoryOptionsMap = new Map([]);
      async.each(data.results, (category, callback) => {
        if (category && category.id && category.name && category.fields && Array.isArray(category.fields.subcategory) && category.fields.subcategory.length > 0) {
          categoryOptions.push({ value: category.id, label: category.name });
          const subcategoryIDs = category.fields.subcategory;
          getSubcategoryOptions(subcategoryIDs, (err, results) => {
            if (err) {
              console.error(err);
              alert('Fetch subcategory failed! Please reload this page and try again.');
            }
            subcategoryOptionsMap.set(category.id, err ? [] : results);
            callback(null);
          });
        } else {
          callback(null);
        }
      }, err => {
        if (err) {
          console.error(err);
          alert('Fetch category set failed! Please reload this page and try again.');
        } else {
          // eslint-disable-next-line react/no-did-mount-set-state
          this.setState({ categoryOptions: categoryOptions, subcategoryOptionsMap: subcategoryOptionsMap });
        }
      });
    });
  },

  onAddCategorySet() {
    this.setState({ value: [...this.state.value, { category: undefined, subcategory: undefined }] });
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

  onUpdateSubcategory(index, newSubcategory) {
    const { value } = this.state;
    if (newSubcategory && Array.isArray(value) && index >= 0 && index < value.length) {
      const newCategorySet = { category: value[index].category, subcategory: newSubcategory };
      this.onUpdateCategorySet(index, newCategorySet);
    }
  },

  renderCategorySetSelect() {
    const { value, categoryOptions, subcategoryOptionsMap } = this.state;
    if (Array.isArray(value)) {
      return value.map((categorySet, index) => {
        const subcategoryOptions = subcategoryOptionsMap && categorySet ? subcategoryOptionsMap.get(categorySet.category) : undefined;
        return categorySet ? (
          <div key={`categorySet-${index}`} style={categorySetStyle}>
            {index > 0
              ? <button type="button" className="ItemList__control ItemList__control--delete-no-focus" onClick={() => this.onRemoveCategorySet(index)}><span className={'octicon octicon-trashcan'} /></button>
              : <div className="ItemList__control ItemList__control--delete-no-focus" />
            }
            <div style={categoryMenuStyle}><Select placeholder="分類" disabled={!(Array.isArray(categoryOptions) && categoryOptions.length > 0)} clearable={false} options={categoryOptions} value={categorySet.category} onChange={(selected) => this.onUpdateCategorySet(index, { category: selected.value, subcategory: undefined })} /></div>
            <div style={subcategoryMenuStyle}><Select placeholder="子分類" disabled={!categorySet.category || !subcategoryOptions} clearable={false} options={subcategoryOptions} value={categorySet.subcategory} onChange={(selected) => this.onUpdateSubcategory(index, selected.value)} /></div>
          </div>
        ) : null;
      });
    }
    return null;
  },

  renderCategorySetSelector() {
    const { value, categoryOptions } = this.state;
    return (
      <div>
        {this.renderCategorySetSelect()}
        <div style={btnContainerStyle}><button type="button" disabled={!(Array.isArray(categoryOptions) && categoryOptions.length > 0)} style={btnStyle} onClick={this.onAddCategorySet}>新增分類</button></div>
        <input type="hidden" name={this.props.path} value={JSON.stringify(value.filter(categorySet => categorySet && categorySet.category))}/>
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
