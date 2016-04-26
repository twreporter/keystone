'use strict';
import { shallowEqual } from 'react-pure-render';
import React from 'react';

class EntityStyleButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            active: props.active,
            shouldRenderEditingBlock: false
        };
        this.handleToggle = this._handleToggle.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.props.label !== nextProps.label || !shallowEqual(this.state, nextState);
    }

    componentWillReceiveProps (nextProps) {
        this.setState({
            active: nextProps.active,
            shouldRenderEditingBlock: false
        });
    }

    _handleToggle() {
        this.setState({
            shouldRenderEditingBlock: !this.state.shouldRenderEditingBlock
        });
    }

    render() {
      const { active, shouldRenderEditingBlock } = this.state;
      // let className = 'RichEditor-styleButton Button Button--link';
      let className = '';
      if (active) {
        className += ' RichEditor-activeButton';
      }

      return (
        <span
          type="default"
          className={className}
          onClick={this.handleToggle}
          data-tooltip={this.props.label}>
  				<i className={ 'fa ' + this.props.icon }></i>
  				<span>{this.props.text}</span>
        </span>
      );
    }
}

EntityStyleButton.propTypes = {
    active: React.PropTypes.bool,
    label: React.PropTypes.string
};

EntityStyleButton.defaultProps = {
    active: false,
    label: 'base'
};

export default EntityStyleButton;
