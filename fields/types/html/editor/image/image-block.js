'use strict';

import { AlignedImage } from 'react-article-components'
import _ from 'lodash';
import AtomicBlockRendererMixin from '../mixins/atomic-block-renderer-mixin';
import ImageSelector from '../../../../../admin/client/components/ImageSelector';
import React from 'react';

export default class ImageBlock extends AtomicBlockRendererMixin(React.Component) {
  constructor(props) {
    super(props);
  }

  _renderImageSelector(props) {
      return (
          <ImageSelector {...props}/>
      );
  }

  // override AtomicBlockRendererMixin._onValueChange
  _onValueChange(value) {
      this.value = _.get(value, 0)
  }

  render() {
      if (!this.state.data) {
          return null;
      }

      let imageObj = _.get(this.state.data, [ 'content', 0 ], {});
      let image = _.get(imageObj, 'tablet' );
      image.src = _.get(image, 'url');
      image.description = _.get(imageObj, 'description' )

      const EditBlock = this.state.editMode ? this._renderImageSelector({
          apiPath: 'images',
          isSelectionOpen: true,
          onChange: this.onValueChange,
          onFinish: this.handleFinish,
          selectedImages: [image],
          selectionLimit: 1
      }) : null;

      return (
          <div
              contentEditable={false}
              onClick={this.toggleEditMode}
              style={{ cursor: 'pointer' }}
              >
              <AlignedImage
                {...this.state.data}
                >
                {this.props.children}
              </AlignedImage>
              { EditBlock }
          </div>
      );
  }
}
