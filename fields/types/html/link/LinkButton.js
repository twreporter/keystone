import objectAssign from 'object-assign';
import StyleButton from '../base/StyleButton';
import LinkEditingBlock from './LinkEditingBlock';
import React from 'react';

export class LinkButton extends StyleButton {
    constructor(props) {
        super(props);
    }

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

        let button = super.render();

        return (
            <div style={{display: "inline-block"}}>
                {Block}
                {button}
            </div>
        );
    }
}

LinkButton.propTypes = objectAssign(StyleButton.propTypes, {
    onToggle: React.PropTypes.func.isRequired,
    textValue: React.PropTypes.string,
    urlValue: React.PropTypes.string
});
LinkButton.defaultProps = objectAssign(StyleButton.defaultProps, {
    textValue: '',
    urlValue: ''
});

export default LinkButton;
