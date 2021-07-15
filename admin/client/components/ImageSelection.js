'use strict';
import { ImageGrid } from './ImageGrid';
import SelectionMixin from './mixins/SelectionMixin';
import React from 'react';
import merge from 'lodash/merge';

const _ = {
  merge,
};

class ImageSelection extends SelectionMixin(React.Component) {
  constructor(props) {
    super(props);

    this.state = {
      items: props.images,
      selectedItems: props.selectedImages,
    };
  }

  componentWillReceiveProps(nextProps) {
    let props = {};
    _.merge(props, {
      items: nextProps.images,
      selectedItems: nextProps.selectedImages,
    });
    super.componentWillReceiveProps(props);
  }

  render() {
    return (
      <ImageGrid
        images={this.state.items}
        onSelect={this.handleSelect}
        selectedImages={this.state.selectedItems}
      />
    );
  }
};

ImageSelection.propTypes = {
  images: React.PropTypes.array,
  selectedImages: React.PropTypes.array,
  selectionLimit: React.PropTypes.number,
  updateSelection: React.PropTypes.func.isRequired,
};

ImageSelection.defaultProps = {
  images: [],
  selectedImages: [],
  selectionLimit: 1,
};

module.exports = ImageSelection;
