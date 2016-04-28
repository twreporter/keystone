import ButtonIcon from '../base/button-icon';
import React, { Component } from 'react';
import { Entity } from 'draft-js';

const getDisplayName = (WrappedComponent) => (
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
);

// Export
export default function WrapComponent(EditingBlockComponent) {
    class Wrapper extends Component {
        constructor(props) {
            super(props);
            this.state = {
                isToggled: true
            };
            this.handleToggle = this._handleToggle.bind(this);
        }

        _handleToggle() {
            this.setState({
                isToggled: !this.state.isToggled
            });
        }

        render() {
            return (
                <div
                    className="Button Button--default"
                    style={{display: "inline-block"}}
                    onClick={this.handleToggle}
                    >
                    <EditingBlockComponent
                        {...this.props}
                        isModalOpen={!this.state.isToggled}
                        handleToggle={this.handleToggle}
                    />
                    <ButtonIcon
                        {...this.props}
                    />
                </div>
            );
        }
    }
    Wrapper.displayName = `ButtonWith${getDisplayName(EditingBlockComponent)}`;
    Wrapper.defaultProps = {
        readOnly: false
    };

    return Wrapper;
}
