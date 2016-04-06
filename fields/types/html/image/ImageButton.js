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
        const { apiPath, selectionLimit, onToggle } = this.props;
        let className = 'RichEditor-styleButton Button Button--link';
        if (active) {
            className += ' RichEditor-activeButton';
        }

        let Block = shouldRenderEditingBlock ? (
            <ImageEditingBlock
                apiPath={apiPath}
                isSelectionOpen={true}
                onChange={onToggle}
                onFinish={this.onFinish}
                selectionLimit={selectionLimit}
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
    onToggle: React.PropTypes.func.isRequired,
    selectionLimit: React.PropTypes.number
});
ImageButton.defaultProps = objectAssign(StyleButton.defaultProps, {
    apiPath: 'images',
    selectionLimit: 1
});

export default ImageButton;
