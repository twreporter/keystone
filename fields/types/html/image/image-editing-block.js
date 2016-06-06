'use strict';
import ImageSelector from '../../../../admin/client/components/ImageSelector';
import React, { Component } from 'react';

export default class ImageEditingBlock extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        const { apiPath, onToggle, handleToggle, selectionLimit, isModalOpen } = this.props;
        return (
            <ImageSelector
                apiPath={apiPath}
                isSelectionOpen={isModalOpen}
                onChange={onToggle}
                onFinish={handleToggle}
                selectionLimit={selectionLimit}
            />
        );
    }
}

ImageEditingBlock.propTypes = {
    apiPath: React.PropTypes.string,
    isModalOpen: React.PropTypes.bool,
    onToggle: React.PropTypes.func,
    handleToggle: React.PropTypes.func,
    selectedImages: React.PropTypes.array,
    selectionLimit: React.PropTypes.number
};

ImageEditingBlock.defaultProps = {
    apiPath: 'images',
    isModalOpen: false,
    selectedImages: [],
    selectionLimit: 1
};
