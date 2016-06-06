'use strict';

import { Entity } from 'draft-js';
import { AudioItem } from '../../../../admin/client/components/AudioGrid';
import React from 'react';

export default class AudioBlock extends React.Component {
  constructor(props) {
    super(props);
    this.audio = this._getValue() || {};
  }

  componentWillUnmount() {
      delete this.audio;
  }

  _getValue() {
      const entityKey = this.props.block.getEntityAt(0);
      return entityKey ? Entity.get(entityKey).getData(): null;
  }

  render() {
      let { className } = this.props;
      if (!this.audio) {
          return null;
      }

      return (
          <AudioItem
              audio={_.get(this.audio, 'url')}
              coverPhoto={_.get(this.audio, 'coverPhoto')}
              description={_.get(this.audio, 'description')}
              id={this.audio.id}
              title={_.get(this.audio, 'title')}
          />
      );
  }
};
