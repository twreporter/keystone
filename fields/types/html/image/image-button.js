'use strict';
import objectAssign from 'object-assign';
import ImageEditingBlock from './image-editing-block';
import React from 'react';
import EntityStyleButton from '../base/style-button';

export class ImageButton extends EntityStyleButton {
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
            <div
                className="Button Button--default"
                style={{display: "inline-block"}}
                onClick={this.renderEditingBlock}
                >
                {Block}
                {button}
            </div>
        );
    }
}

ImageButton.propTypes = objectAssign(EntityStyleButton.propTypes, {
    apiPath: React.PropTypes.string,
    onToggle: React.PropTypes.func.isRequired,
    selectionLimit: React.PropTypes.number
});
ImageButton.defaultProps = objectAssign(EntityStyleButton.defaultProps, {
    apiPath: 'images',
    selectionLimit: 1
});

export default ImageButton;
