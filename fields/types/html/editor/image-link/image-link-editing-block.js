'use strict';
import EntityEditingBlockMixin from '../mixins/entity-editing-block-mixin';
import React from 'react';

class ImageLinkEditingBlock extends EntityEditingBlockMixin(React.Component) {
	constructor (props) {
		super(props);
		this.state.editingFields = {
			url: props.url,
			description: props.description,
		};
	}

	// overwrite EntityEditingBlock._composeEditingFields
	_composeEditingFields (props) {
		return {
			url: {
				type: 'text',
				value: props.url,
			},
			description: {
				type: 'text',
				value: props.description,
			},
		};
	}


	// overwrite EntityEditingBlock._decomposeEditingFields
	_decomposeEditingFields (fields) {
		return {
			url: fields.url.value,
			description: fields.description.value,
		};
	}
};

ImageLinkEditingBlock.displayName = 'ImageLinkEditingBlock';

ImageLinkEditingBlock.propTypes = {
	description: React.PropTypes.string,
	isModalOpen: React.PropTypes.bool,
	onToggle: React.PropTypes.func.isRequired,
	toggleModal: React.PropTypes.func,
	url: React.PropTypes.string,
};

ImageLinkEditingBlock.defaultProps = {
	description: '',
	isModalOpen: false,
	url: '',
};

export default ImageLinkEditingBlock;
