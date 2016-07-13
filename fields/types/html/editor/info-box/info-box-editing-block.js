'use strict';
import { convertToRaw } from 'draft-js';
import DraftConverter from '../draft-converter';
import EntityEditingBlockMixin from '../mixins/entity-editing-block-mixin';
import React from 'react';

class InfoBoxEditingBlock extends EntityEditingBlockMixin(React.Component) {
	constructor (props) {
		super(props);
		this.state.editorState = this._initEditorState(props.draftRawObj);
	}

	// overwrite EntityEditingBlock._composeEditingFields
	_composeEditingFields (props) {
		return {
			title: {
				type: 'text',
				value: props.title,
			},
			body: {
				type: 'html',
				value: props.body,
			},
		};
	}


	// overwrite EntityEditingBlock._decomposeEditingFields
	_decomposeEditingFields (fields) {
		let { editorState } = this.state;
		const content = convertToRaw(editorState.getCurrentContent());
		const cHtml = DraftConverter.convertToHtml(content);
		return {
			title: fields.title.value,
			body: cHtml,
			draftRawObj: content,
		};
	}

	// overwrite EntityEditingBlock._handleEditingFieldChange
	_handleEditingFieldChange (field, e) {
		if (field === 'body') {
			return;
		}
		return super._handleEditingFieldChange(field, e);
	}
};

InfoBoxEditingBlock.displayName = 'InfoBoxEditingBlock';

InfoBoxEditingBlock.propTypes = {
	body: React.PropTypes.string,
	draftRawObj: React.PropTypes.object,
	isModalOpen: React.PropTypes.bool,
	onToggle: React.PropTypes.func.isRequired,
	title: React.PropTypes.string,
	toggleModal: React.PropTypes.func,
};

InfoBoxEditingBlock.defaultProps = {
	body: '',
	draftRawObj: null,
	isModalOpen: false,
	title: '',
};

export default InfoBoxEditingBlock;
