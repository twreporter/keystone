'use strict';
import { convertToRaw } from 'draft-js';
import DraftConverter from '../draft-converter';
import EntityEditingBlockMixin from '../mixins/entity-editing-block-mixin';
import React from 'react';

class AnnotationEditingBlock extends EntityEditingBlockMixin(React.Component) {
	constructor (props) {
		super(props);
		this.state.editorState = this._initEditorState(props.draftRawObj);
	}

	// overwrite
	_composeEditingFields (props) {
		return {
			text: {
				type: 'text',
				value: props.text,
			},
			annotation: {
				type: 'html',
				value: props.annotation,
			},
		};
	}

	// overwrite
	_decomposeEditingFields (fields) {
		let { editorState } = this.state;
		const content = convertToRaw(editorState.getCurrentContent());
		const cHtml = DraftConverter.convertToHtml(content);
		return {
			text: fields.text.value,
			annotation: cHtml,
			draftRawObj: content,
		};
	}

	// overwrite EntityEditingBlock._handleEditingFieldChange
	_handleEditingFieldChange (field, e) {
		if (field === 'annotation') {
			return;
		}
		return super._handleEditingFieldChange(field, e);
	}
};

AnnotationEditingBlock.displayName = 'AnnotationEditingBlock';

AnnotationEditingBlock.propTypes = {
	annotation: React.PropTypes.string,
	draftRawObj: React.PropTypes.object,
	isModalOpen: React.PropTypes.bool,
	onToggle: React.PropTypes.func.isRequired,
	text: React.PropTypes.string,
	toggleModal: React.PropTypes.func,
};

AnnotationEditingBlock.defaultProps = {
	annotation: '',
	draftRawObj: null,
	isModalOpen: false,
	text: '',
};

export default AnnotationEditingBlock;
