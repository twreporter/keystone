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
        let className = 'RichEditor-styleButton Button Button--link';
        if (active) {
            className += ' RichEditor-activeButton';
        }

        let Block = shouldRenderEditingBlock ? (
            <ImageEditingBlock
                apiPath={this.props.apiPath}
                doSelectMany={true}
                isSelectionOpen={true}
                onChange={this.props.onToggle}
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
    onToggle: React.PropTypes.func.isRequired
});
ImageButton.defaultProps = objectAssign(StyleButton.defaultProps, {
    apiPath: 'images'
});

export default ImageButton;
