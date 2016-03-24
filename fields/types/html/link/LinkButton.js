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
            <div>
                {Block}
                {button}
            </div>
        );
    }
}

LinkButton.propTypes = StyleButton.propTypes;
LinkButton.defaultProps = StyleButton.defaultProps;

export default LinkButton;
