'use strict';

import { Entity } from 'draft-js';
import CONSTANT from '../CONSTANT';
import ImageBlock from '../image/ImageBlock';
import React from 'react';

export default class SlideshowBlock extends ImageBlock {
  constructor(props) {
    super(props);
    this.state = {
        editMode: false,
        images: []
    };
  }

  _finishEdit() {
      this.props.blockProps.onFinishEdit(this.props.block.getKey(), this.state.images);
  }

  _isEmptyArray(images) {
    return Array.isArray(images) && images.length > 0 ? false : true;
  }

  _onValueChange(value) {
      let images = this._isEmptyArray(value) ? null : value;
      const entityKey = this.props.block.getEntityAt(0);

      this.setState({
        editMode: false,
        images: images
      }, this._finishEdit);
  }

  _handleRemove(evt) {
      this.props.onRemove(this.props.block.getKey());
  }

  _getImagesFromEntity() {
      const value = this._getValue();
      return value ? value.images : null;
  }

  render() {
    let { editMode, images } = this.state;
    images = !this._isEmptyArray(images) ? images : this._getImagesFromEntity();
    if (!images) {
        return null;
    }

    const EditBlock = editMode ? this._renderImageSelector({
          apiPath: 'images',
          isSelectionOpen: true,
          onChange: this.onValueChange,
          onFinish: this.handleFinish,
          selectedImages: images,
          selectionLimit: CONSTANT.slideshowSelectionLimit
    }): null;

    return (
        <figure
            contentEditable={false}
            >
            <img src="https://storage.googleapis.com/twreporter-article.twreporter.org/slideshow.jpg" width="100%" onClick={this.handleClick} style={{cursor: "pointer"}}/>
            {EditBlock}
        </figure>
    );
  }
}
