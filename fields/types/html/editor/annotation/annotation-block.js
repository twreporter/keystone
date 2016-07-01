'use strict';

import AtomicBlockRendererMixin from '../mixins/atomic-block-renderer-mixin';
import AnnotationEditingBlock from './annotation-editing-block';
import React from 'react';

export default class AnnotationBlock extends AtomicBlockRendererMixin(React.Component) {
  constructor(props) {
    super(props);
    this.handleEditingBlockChange  = this._handleEditingBlockChange.bind(this);
  }

  _handleEditingBlockChange(value) {
      // call AtomicBlockRendererMixin.onValueChange
      this.onValueChange(value);
      // call AtomicBlockRendererMixin.handleFinish
      this.handleFinish();
  }

  render() {
      if (!this.state.data) {
          return null;
      }

      let blockContent = _.get(this.state.data, [ 'content', 0 ], {});
      let text = blockContent.text;
      let annotation = blockContent.annotation;
      const EditBlock = (
          <AnnotationEditingBlock
              annotation={annotation}
              label='annotation'
              isModalOpen={this.state.editMode}
              text={text}
              onToggle={this.handleEditingBlockChange}
              toggleModal={this.toggleEditMode}
          />
      );

      return (
          <div
              contentEditable={false}
              onClick={this.toggleEditMode}
              style={{ cursor: 'pointer' }}
          >
              <div>
                  要被註解的字串：{text}
              </div>
              <div>
                  註解：{annotation}
              </div>
              {EditBlock}
          </div>
      );
  }
};
