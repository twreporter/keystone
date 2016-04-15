'use strict';
import objectAssign from 'object-assign';
import EmbeddedCodeEditingBlock from './embedded-code-editing-block';
import React from 'react';
import StyleButton from '../base/style-button';

class EmbbedCodeBt extends StyleButton {
    constructor(props) {
        super(props);
    }

    render() {
        const { active, shouldRenderEditingBlock } = this.state;
        let className = 'RichEditor-styleButton Button Button-embedded-code';
        if (active) {
            className += ' RichEditor-activeButton';
        }

        let Block = shouldRenderEditingBlock ? (
            <EmbeddedCodeEditingBlock
                {...this.props}
                isModalOpen={true}
            />
        ) : null;

        let button = super.render();

        return (
            <div style={{display: "inline-block"}}>
                {Block}
                {button}
            </div>
        );
    }
}

EmbbedCodeBt.propTypes = objectAssign(StyleButton.propTypes, {
    onToggle: React.PropTypes.func.isRequired,
    embeddedCode: React.PropTypes.string
});
EmbbedCodeBt.defaultProps = objectAssign(StyleButton.defaultProps, {
    embeddedCode: ''
});

export default EmbbedCodeBt;
