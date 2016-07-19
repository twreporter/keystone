'use strict';
import EntityEditingBlockMixin from '../mixins/entity-editing-block-mixin';
import React from 'react';

class YoutubeEditingBlock extends EntityEditingBlockMixin(React.Component) {
	constructor (props) {
		super(props);
		this.state.editingFields = {
			youtubeId: props.youtubeId,
			description: props.description,
		};
	}

	// overwrite
	_composeEditingFields (props) {
		return {
			youtubeId: {
				type: 'text',
				value: props.youtubeId,
			},
			description: {
				type: 'textarea',
				value: props.description,
			},
		};
	}

	// overwrite
	_decomposeEditingFields (fields) {
		return {
			youtubeId: fields.youtubeId.value,
			description: fields.description.value,
		};
	}
}

YoutubeEditingBlock.displayName = 'YoutubeEditingBlock';

YoutubeEditingBlock.propTypes = {
	description: React.PropTypes.string,
	isModalOpen: React.PropTypes.bool,
	onToggle: React.PropTypes.func.isRequired,
	toggleModal: React.PropTypes.func,
	youtubeId: React.PropTypes.string,
};

YoutubeEditingBlock.defaultProps = {
	description: '',
	isModalOpen: false,
	youtubeId: '',
};

export default YoutubeEditingBlock;
