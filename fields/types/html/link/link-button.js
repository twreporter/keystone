import objectAssign from 'object-assign';
import EntityStyleButton from '../base/style-button';
import LinkEditingBlock from './link-editing-block';
import React from 'react';

export class LinkButton extends EntityStyleButton {
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
            <div className="Button Button--default" style={{display: "inline-block"}}>
                {Block}
                {button}
            </div>
        );
    }
}

LinkButton.propTypes = objectAssign(EntityStyleButton.propTypes, {
    onToggle: React.PropTypes.func.isRequired,
    textValue: React.PropTypes.string,
    urlValue: React.PropTypes.string
});
LinkButton.defaultProps = objectAssign(EntityStyleButton.defaultProps, {
    textValue: '',
    urlValue: ''
});

export default LinkButton;
