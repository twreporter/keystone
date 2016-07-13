'use strict';
import { Button, FormField, FormInput, Modal } from 'elemental';
import { convertFromRaw, EditorState, Entity, Modifier, RichUtils } from 'draft-js';
import { BlockStyleButtons, EntityButtons, InlineStyleButtons } from '../editor-buttons';
import decorator from '../entity-decorator';
import quoteTypes from '../quote/quote-types';
import DraftEditor from '../draft-editor';
import ENTITY from '../entities';
import React, { Component } from 'react';

let EntityEditingBlock = (superclass) => class extends Component {
	constructor (props) {
		super(props);
		this.toggleModal = this._toggleModal.bind(this);
		this.handleSave = this._handleSave.bind(this);
		this.composeEditingFields = this._composeEditingFields.bind(this);
		this.focus = this._focus.bind(this);
		this.handleEditorStateChange = this._handleEditorStateChange.bind(this);
		this.toggleBlockType = this._toggleBlockStyle.bind(this);
		this.toggleInlineStyle = this._toggleInlineStyle.bind(this);
		this.toggleEntity = this._toggleEntity.bind(this);
		this._editingFields = this.composeEditingFields(props);
		this.state = {
			editingFields: this._editingFields,
			editorState: EditorState.createEmpty(decorator),
		};
	}

	componentWillReceiveProps (nextProps) {
		this._editingFields = this.composeEditingFields(nextProps);
		this.setState({
			editingFields: this._editingFields,
		});
	}

	componentWillUnmount () {
		this._editingFields = null;
	}

	_initEditorState (draftRawObj) {
		let editorState;
		if (draftRawObj) {
			let contentState = convertFromRaw(draftRawObj);
			editorState = EditorState.createWithContent(contentState, decorator);
		} else {
			editorState = EditorState.createEmpty(decorator);
		}
		return editorState;
	}

	// need to be overwrited
	_handleEditorStateChange (editorState) {
		this.setState({
			editorState: editorState,
		});
	}


	// this function should be overwritten by children
	_composeEditingFields (props) {
		console.warn('_composeEditingFields should be extended');
		return {};
	}

	// this function should be overwritten by children
	_decomposeEditingFields (fields) {
		console.warn('_decomposeEditingFields should be extended');
		return {};
	}

	_focus () {
		this.refs.editor.focus();
	}


	_handleEditingFieldChange (field, e) {
		this._editingFields[field].value = e.target.value;
	}

	_handleKeyCommand (command) {
		const { editorState } = this.state;
		const newState = RichUtils.handleKeyCommand(editorState, command);
		if (newState) {
			this.handleEditorStateChange(newState);
			return true;
		}
		return false;
	}

	_handleSave () {
		this.setState({
			editingFields: this._editingFields,
		}, () => {
			this.props.toggleModal();
			this.props.onToggle(this._decomposeEditingFields(this._editingFields));
		});
	}

	_renderDraftjsEditingField (editorState) {
		return (
			<div className="RichEditor-root">
				<div className={'DraftEditor-controls'}>
					<div className={'DraftEditor-controlsInner'}>
						<BlockStyleButtons
							buttons={BLOCK_TYPES}
							editorState={editorState}
							onToggle={this.toggleBlockType}
						/>
						<InlineStyleButtons
							buttons={INLINE_STYLES}
							editorState={editorState}
							onToggle={this.toggleInlineStyle} />
						<EntityButtons
							entities={['link']}
							editorState={editorState}
							onToggle={this.toggleEntity}
						/>
					</div>
				</div>
				<div className={'RichEditor-editor'} onClick={this.focus}>
					<DraftEditor
						editorState={editorState}
						handleKeyCommand={this._handleKeyCommand}
						onChange={this.handleEditorStateChange}
						ref="editor"
						spellCheck
					/>
				</div>
			</div>
		);
	}

	_renderEditingField (field, type, value) {
		if (type === 'html') {
			return this._renderDraftjsEditingField(this.state.editorState);
		}
		let onChange = this._handleEditingFieldChange.bind(this, field);
		return (
			<FormField label={field} htmlFor={'form-input-' + field} key={field}>
				<FormInput type={type} multiline={type === 'textarea' ? true : false} placeholder={'Enter ' + field} name={'form-input-' + field} onChange={onChange} defaultValue={value}/>
			</FormField>
		);
	}

	_renderEditingFields (fields) {
		let Fields = Object.keys(fields).map((field) => {
			const type = fields[field].type;
			const value = fields[field].value;
			return this._renderEditingField(field, type, value);
		});
		return Fields;
	}

	_toggleBlockStyle (blockType) {
		this.handleEditorStateChange(
			RichUtils.toggleBlockType(
				this.state.editorState,
				blockType
			)
		);
	}

	_toggleEntity (entity, value) {
		switch (entity) {
			case ENTITY.link.type:
				return this._toggleLink(entity, value);
			default:
				return;
		}
	}

	_toggleInlineStyle (inlineStyle) {
		this.handleEditorStateChange(
			RichUtils.toggleInlineStyle(
				this.state.editorState,
				inlineStyle
			)
		);
	}

	_toggleLink (entity, value) {
		const { url, text } = value;
		const entityKey = url !== '' ? Entity.create(entity, 'IMMUTABLE', { text: text || url, url: url }) : null;
		this._toggleTextWithEntity(entityKey, text || url);
	}

	_toggleModal () {
		this.props.toggleModal();
	}

	_toggleTextWithEntity (entityKey, text) {
		const { editorState } = this.state;
		const selection = editorState.getSelection();
		let contentState = editorState.getCurrentContent();

		if (selection.isCollapsed()) {
			contentState = Modifier.removeRange(
				editorState.getCurrentContent(),
				selection,
				'backward'
			);
		}
		contentState = Modifier.replaceText(
			contentState,
			selection,
			text,
			null,
			entityKey
		);
		const _editorState = EditorState.push(editorState, contentState, editorState.getLastChangeType());
		this.handleEditorStateChange(_editorState);
	}


	render () {
		return (
			<Modal isOpen={this.props.isModalOpen} onCancel={this.toggleModal} backdropClosesModal>
				<Modal.Header text={'Insert ' + this.props.label} showCloseButton onClose={this.toggleModal} />
				<Modal.Body>
					{this._renderEditingFields(this.state.editingFields)}
				</Modal.Body>
				<Modal.Footer>
					<Button type="primary" onClick={this.handleSave}>Save</Button>
					<Button type="link-cancel" onClick={this.toggleModal}>Cancel</Button>
				</Modal.Footer>
			</Modal>
		);
	}
};

// block settings
const BLOCK_TYPES = [
	{ label: quoteTypes.blockquote.label, style: 'blockquote', icon: 'fa-quote-right', text: ' Block' },
	{ label: 'H1', style: 'header-one', icon: 'fa-header', text: '1' },
	{ label: 'H2', style: 'header-two', icon: 'fa-header', text: '2' },
	{ label: 'OL', style: 'ordered-list-item', icon: 'fa-list-ol', text: '' },
	{ label: 'UL', style: 'unordered-list-item', icon: 'fa-list-ul', text: '' },
];

// inline style settings
var INLINE_STYLES = [
	{ label: 'Bold', style: 'BOLD', icon: 'fa-bold', text: '' },
	{ label: 'Italic', style: 'ITALIC', icon: 'fa-italic', text: '' },
	{ label: 'Underline', style: 'UNDERLINE', icon: 'fa-underline', text: '' },
];


export default EntityEditingBlock;
