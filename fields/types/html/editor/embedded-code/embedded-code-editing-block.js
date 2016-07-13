'use strict';
import EntityEditingBlockMixin from '../mixins/entity-editing-block-mixin';
import React from 'react';

class EmbeddedCodeEditingBlock extends EntityEditingBlockMixin(React.Component) {
	constructor (props) {
		super(props);
		this.state.editingFields = {
			caption: props.caption,
			embeddedCode: props.embeddedCode,
		};
	}

	// overwrite
	_composeEditingFields (props) {
		return {
			caption: {
				type: 'text',
				value: props.caption,
			},
			embeddedCode: {
				type: 'textarea',
				value: props.embeddedCode,
			},
		};
	}

	// overwrite
	_decomposeEditingFields (fields) {
		return {
			caption: fields.caption.value,
			embeddedCode: fields.embeddedCode.value,
		};
	}
}

EmbeddedCodeEditingBlock.displayName = 'EmbeddedCodeEditingBlock';

EmbeddedCodeEditingBlock.propTypes = {
	caption: React.PropTypes.string,
	embeddedCode: React.PropTypes.string,
	isModalOpen: React.PropTypes.bool,
	onToggle: React.PropTypes.func.isRequired,
	toggleModal: React.PropTypes.func,
};

EmbeddedCodeEditingBlock.defaultProps = {
	caption: '',
	embeddedCode: '',
	isModalOpen: false,
};

export default EmbeddedCodeEditingBlock;
