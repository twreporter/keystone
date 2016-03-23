import { Button, FormField, FormInput, InputGroup, Modal } from 'elemental';
import LinkEditingBlock from './LinkEditingBlock';
import React from 'react';
import ReactDOM from 'react-dom';

const LinkButton = React.createClass({
    displayName: 'LinkButton',

    _textValue: '',

    _urlValue: '',

    propTypes: {
        active: React.PropTypes.bool,
        label: React.PropTypes.string,
        onToggle: React.PropTypes.func.isRequired,
        textValue: React.PropTypes.string,
        urlValue: React.PropTypes.string
    },

    getDefaultProps () {
        return {
            active: false,
            label: 'Link'
        }
    },

    getInitialState () {
        return {
            active: this.props.active,
            shouldRenderEditingBlock: false
        };
    },

    componentWillReceiveProps (nextProps) {
        this.setState({
            active: nextProps.active,
            shouldRenderEditingBlock: false
        });
    },

    renderEditingBlock (e) {
        this.setState({
            shouldRenderEditingBlock: true
        });
    },

    render() {
        const { active, shouldRenderEditingBlock } = this.state;
        let className = 'RichEditor-styleButton Button Button--link';
        if (active) {
            className += ' RichEditor-activeButton';
        }

        let Block = shouldRenderEditingBlock ? (
            <LinkEditingBlock
                {...this.props}
                isModalOpen={true}
            />
        ) : null;

        return (
            <div>
                {Block}
                <span className={className} onClick={this.renderEditingBlock}>
                    {this.props.label}
                </span>
            </div>
        );
    }
});

export default LinkButton;
