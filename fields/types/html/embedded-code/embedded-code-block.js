'use strict';

import { Entity } from 'draft-js';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import React from 'react';

export default class EmbeddedCodeBlock extends React.Component {
  constructor(props) {
    super(props);
    let value = this._getValue() || {};
    this.embeddedCode = value.embeddedCode;
  }

  componentDidMount() {
      let codeContainer = this.refs.codeContainer;
      $(codeContainer).append(this.embeddedCode);
  }

  componentWillUnmount() {
      this.embeddedCode = '';
  }

  _getValue() {
      const entityKey = this.props.block.getEntityAt(0);
      return entityKey ? Entity.get(entityKey).getData(): null;
  }

  render() {
      let { className } = this.props;
      if (!this.embeddedCode) {
          return null;
      }

      return (
          <div
              className={className}
              contentEditable={false}
              >
              <div ref="codeContainer" />
              {this.props.children}
          </div>
      );
  }
};
