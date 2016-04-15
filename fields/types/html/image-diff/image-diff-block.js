'use strict';

import { Entity } from 'draft-js';
import classNames from 'classnames';
import ImagesDiff from '../../../../admin/client/components/ImagesDiff';
import React from 'react';
import SlideshowBlock from '../slideshow/slideshow-block';

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
      <div className={classNames(this.props.className, 'imageWrapper')}
          style={{position:"relative"}}>
        <ImagesDiff
            after={images[1].url}
            before={images[0].url}
        />
        {EditBlock}
        {this.props.children}
      </div>
    );
  }
}
