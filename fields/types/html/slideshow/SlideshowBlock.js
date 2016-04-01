'use strict';

import { Entity } from 'draft-js';
import ImageSelector from '../../../../admin/client/components/ImageSelector';
import ImageBlock from '../image/ImageBlock';
import React from 'react';
import Slider from 'react-slick';

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

  _trimImage(image) {
      return {
          url: image.url,
          description: image.description
      };
  }

  _onValueChange(value) {
      let images = this._isEmptyArray(value) ? null : value;
      images = images ? images.map(this._trimImage) : images;

      const entityKey = this.props.block.getEntityAt(0);
      Entity.mergeData(entityKey, {images});

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

    const EditBlock = editMode ? (
        <ImageSelector
            apiPath="images"
            doSelectMany={true}
            isSelectionOpen={true}
            onChange={this.onValueChange}
            onFinish={this.handleFinish}
            selectedImages={images}
        />
    ) : null;

    const ImageNodes = images.map((image) => {
        return <div><figure><img src={image.url} width="100%"/><figcaption>{image.description}</figcaption></figure></div>;
    });

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1
    };
    return (
        <Slider {...settings}>
            {ImageNodes}
        </Slider>
    );
  }
}
