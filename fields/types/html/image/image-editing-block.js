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
