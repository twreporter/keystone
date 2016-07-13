'use strict';
import AudioSelector from '../../../../../admin/client/components/AudioSelector';
import React, { Component } from 'react';

class AudioEditingBlock extends Component {
	constructor (props) {
		super(props);
	}

	render () {
		const { apiPath, onToggle, toggleModal, selectionLimit, isModalOpen } = this.props;
		return (
			<AudioSelector
				apiPath={apiPath}
				isSelectionOpen={isModalOpen}
				onChange={onToggle}
				onFinish={toggleModal}
				selectionLimit={selectionLimit}
			/>
		);
	}

}

AudioEditingBlock.propTypes = {
	apiPath: React.PropTypes.string,
	isModalOpen: React.PropTypes.bool,
	onToggle: React.PropTypes.func,
	selectedAudios: React.PropTypes.array,
	selectionLimit: React.PropTypes.number,
	toggleModal: React.PropTypes.func,
};

AudioEditingBlock.defaultProps = {
	apiPath: 'audios',
	isModalOpen: false,
	selectedAudios: [],
	selectionLimit: 1,
};

export default AudioEditingBlock;
