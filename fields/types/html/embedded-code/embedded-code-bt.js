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

        let Block = shouldRenderEditingBlock ? (
            <EmbeddedCodeEditingBlock
                {...this.props}
                isModalOpen={true}
                handleToggle={this.handleToggle}
            />
        ) : null;

        let button = super.render();

        return (
          <div
              className="Button Button--default"
              style={{display: "inline-block"}}
              onClick={this.handleToggle}
              >
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
