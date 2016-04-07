'use strict';
import objectAssign from 'object-assign';
import ImageEditingBlock from './ImageEditingBlock';
import React from 'react';
import StyleButton from '../base/StyleButton';

export class ImageButton extends StyleButton {
    constructor(props) {
        super(props);
        this.onFinish = this._onFinish.bind(this);
    }

    _onFinish() {
        this.setState({
            shouldRenderEditingBlock: false
        });
    }

    render() {
        const { active, shouldRenderEditingBlock } = this.state;
        const { apiPath, doSelectMany, onToggle } = this.props;
        let className = 'RichEditor-styleButton Button Button--link';
        if (active) {
            className += ' RichEditor-activeButton';
        }

        let Block = shouldRenderEditingBlock ? (
            <ImageEditingBlock
                apiPath={apiPath}
                doSelectMany={doSelectMany}
                isSelectionOpen={true}
                onChange={onToggle}
                onFinish={this.onFinish}
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

ImageButton.propTypes = objectAssign(StyleButton.propTypes, {
    apiPath: React.PropTypes.string,
    doSelectMany: React.PropTypes.bool,
    onToggle: React.PropTypes.func.isRequired
});
ImageButton.defaultProps = objectAssign(StyleButton.defaultProps, {
    apiPath: 'images',
    doSelectMany: false
});

export default ImageButton;
