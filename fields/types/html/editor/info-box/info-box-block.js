'use strict';

import { AlignedInfoBox } from 'react-article-components'
import AtomicBlockRendererMixin from '../mixins/atomic-block-renderer-mixin';
import React from 'react';

export default class InfoBoxBlock extends AtomicBlockRendererMixin(React.Component) {
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
              <AlignedInfoBox
                  {...this.state.data}
                  >
                  {this.props.children}
              </AlignedInfoBox>
          </div>
      );
  }
};
