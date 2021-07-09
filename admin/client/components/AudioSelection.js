'use strict';
import { AudioGrid } from './AudioGrid';
import SelectionMixin from './mixins/SelectionMixin';
import React, { Component } from 'react';
import merge from 'lodash/merge';

const _ = {
  merge,
};

class AudioSelection extends SelectionMixin(Component) {
  constructor(props) {
    super(props);

    this.state = {
      items: props.audios,
      selectedItems: props.selectedAudios,
    };
  }

  componentWillReceiveProps(nextProps) {
    let props = {};
    _.merge(props, {
      items: nextProps.audios,
      selectedItems: nextProps.selectedAudios,
    });
    super.componentWillReceiveProps(props);
  }

  render() {
    return (
      <AudioGrid
        audios={this.state.items}
        onSelect={this.handleSelect}
        selectedAudios={this.state.selectedItems}
      />
    );
  }
};

AudioSelection.propTypes = {
  audios: React.PropTypes.array,
  selectedAudios: React.PropTypes.array,
  selectionLimit: React.PropTypes.number,
  updateSelection: React.PropTypes.func.isRequired,
};

AudioSelection.defaultProps = {
  audios: [],
  selectedAudios: [],
  selectionLimit: 1,
};

module.exports = AudioSelection;
