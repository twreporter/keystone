'use strict';

import { Entity } from 'draft-js';
import _ from 'lodash';
import classNames from 'classnames';
import AtomicBlockRendererMixin from '../mixins/atomic-block-renderer-mixin';
import ENTITY from '../entities';
import ImageSelector from '../../../../../admin/client/components/ImageSelector';
import React from 'react';

export default class SlideshowBlock extends AtomicBlockRendererMixin(React.Component) {
  constructor(props) {
    super(props);
  }

  _renderImageSelector(props) {
      return (
          <ImageSelector {...props}/>
      );
  }

  render() {
      if (!this.state.data) {
          return null;
      }

      let images = _.get(this.state.data, 'content', []);

      const EditBlock = this.state.editMode ? this._renderImageSelector({
          apiPath: 'images',
          isSelectionOpen: true,
          onChange: this.onValueChange,
          onFinish: this.toggleEditMode,
          selectedImages: images,
          selectionLimit: ENTITY.slideshow.slideshowSelectionLimit
      }): null;

      return (
          <div
              contentEditable={false}
              className={classNames(this.props.className, 'imageWrapper')}
          >
              <img src="https://storage.googleapis.com/twreporter-article.twreporter.org/slideshow.jpg" width="100%" onClick={this.toggleEditMode} style={{cursor: "pointer"}}/>
              {EditBlock}
              {this.props.children}
          </div>
      );
  }
}
