'use strict';
import { Audio } from 'react-article-components';
import AtomicBlockRendererMixin from '../mixins/atomic-block-renderer-mixin';
import React from 'react';

export default class AudioBlock extends AtomicBlockRendererMixin(React.Component) {
  constructor(props) {
    super(props);
  }

  render() {
      if (!this.state.data) {
          return null;
      }

      return (
          <div
              contentEditable={false}
              >
          <Audio
            {...this.state.data}
          />
  </div>
      );
  }
};
