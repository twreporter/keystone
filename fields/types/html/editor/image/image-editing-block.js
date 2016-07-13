'use strict';
import ImageSelector from '../../../../../admin/client/components/ImageSelector';
import React, { Component } from 'react';

export default class ImageEditingBlock extends Component {
	constructor (props) {
		super(props);
	}
	render () {
		const { apiPath, onToggle, toggleModal, selectionLimit, isModalOpen } = this.props;
		return (
			<ImageSelector
				apiPath={apiPath}
				isSelectionOpen={isModalOpen}
				onChange={onToggle}
				onFinish={toggleModal}
				selectionLimit={selectionLimit}
			/>
		);
	}
}

ImageEditingBlock.propTypes = {
	apiPath: React.PropTypes.string,
	isModalOpen: React.PropTypes.bool,
	onToggle: React.PropTypes.func,
	selectedImages: React.PropTypes.array,
	selectionLimit: React.PropTypes.number,
	toggleModal: React.PropTypes.func,
};

ImageEditingBlock.defaultProps = {
	apiPath: 'images',
	isModalOpen: false,
	selectedImages: [],
	selectionLimit: 1,
};
