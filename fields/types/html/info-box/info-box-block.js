'use strict';

import { Entity } from 'draft-js';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import React from 'react';

export default class InfoBoxBlock extends React.Component {
  constructor(props) {
    super(props);
    let value = this._getValue() || {};
    this.title = value.title || '';
    this.body = value.body || '';
  }

  componentWillUnmount() {
      this.title = '';
      this.body = '';
  }

  _getValue() {
      const entityKey = this.props.block.getEntityAt(0);
      return entityKey ? Entity.get(entityKey).getData(): null;
  }

  render() {
      let { className } = this.props;
      if (!this.body && !this.title) {
          return null;
      }

      return (
          <div
              className={className}
              contentEditable={false}
              style={{border: '1px solid'}}
              >
              <div>
                  <span>{this.title}</span>
              </div>
              <div>
                  <span>{this.body}</span>
              </div>
              {this.props.children}
          </div>
      );
  }
};
