'use strict';

import { Entity } from 'draft-js';
import SlideshowBlock from '../slideshow/SlideshowBlock';
import ImagesDiff from '../../../../admin/client/components/ImagesDiff';
import React from 'react';

export default class ImageDiffBlock extends SlideshowBlock{
  constructor(props) {
    super(props);
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
          selectionLimit: 2
    }): null;

    return (
      <div style={{position:"relative"}}>
        <ImagesDiff
            after={images[1].url}
            before={images[0].url}
        />
        {EditBlock}
      </div>
    );
  }
}
