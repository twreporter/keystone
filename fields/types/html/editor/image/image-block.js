'use strict';

import { Entity } from 'draft-js';
import ImageSelector from '../../../../../admin/client/components/ImageSelector';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import React from 'react';

export default class ImageBlock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        editMode: false,
        image: null
    };
    this.onValueChange = this._onValueChange.bind(this);
    this.handleClick = this._handleClick.bind(this);
    this.handleFinish = this._handleFinish.bind(this);
    this.handleRemove = this._handleRemove.bind(this);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);

    this._remove = () => {
      this.props.blockProps.onRemove(this.props.block.getKey());
    };
  }

  _finishEdit() {
      this.props.blockProps.onFinishEdit(this.props.block.getKey(), this.state.image);
  }

  _handleClick(e) {
      e.stopPropagation();
      if (this.state.editMode) {
          return;
      }

      this.setState({
          editMode: true,
      });
  }

  _handleFinish() {
      this.setState({
          editMode: false
      });
  }

  _onValueChange(value) {
      const image = Array.isArray(value) && value[0] ? value[0] : null;
      const entityKey = this.props.block.getEntityAt(0);
      this.setState({
          editMode: false,
          image: image
      }, this._finishEdit);
  }

  _getValue() {
      const entityKey = this.props.block.getEntityAt(0);
      return entityKey ? Entity.get(entityKey).getData(): null;
  }

  _handleRemove(evt) {
      this.props.onRemove(this.props.block.getKey());
  }

  _renderImageSelector(props) {
      return (
          <ImageSelector {...props}/>
      );
  }

  render() {
      let { editMode, image } = this.state;
      let { className } = this.props;
      image = image || this._getValue();
      if (!image) {
          return null;
      }

      image.src = _.get(image, ['resizedTargets', 'desktop', 'url'], image.url)

      const EditBlock = editMode ? this._renderImageSelector({
          apiPath: 'images',
          isSelectionOpen: true,
          onChange: this.onValueChange,
          onFinish: this.handleFinish,
          selectedImages: [image],
          selectionLimit: 1
      }) : null;

      className = `imageWrapper ${className}`;

      return (
          <div
              className={className}
              contentEditable={false}
              >
              <img src={image.src} width="100%" onClick={this.handleClick} style={{cursor: "pointer"}}/>
              <figcaption>{image.description}</figcaption>
              {EditBlock}
              {this.props.children}
          </div>
      );
  }
}
