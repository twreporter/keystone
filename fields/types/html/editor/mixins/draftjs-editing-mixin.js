'use strict';
import { EditorState, Entity, Modifier, RichUtils } from 'draft-js';
import { BlockStyleButtons, EntityButtons, InlineStyleButtons } from '../editor-buttons';
import decorator from '../entity-decorator';
import quoteTypes from '../quote/quote-types';
import DraftEditor from '../draft-editor';
import ENTITY from '../entities';
import React from 'react';

let DraftjsEditingMixin = (superclass) => class extends superclass {

    constructor(props) {
        super(props);
        this.state = {
            editorState: EditorState.createEmpty(decorator)
        };
        this.focus = this._focus.bind(this);
        this.onChange = this._onChange.bind(this);
        this.toggleBlockTyle = this._toggleBlockStyle.bind(this);
        this.toggleInlineStyle = this._toggleInlineStyle.bind(this);
        this.toggleEntity = this._toggleEntity.bind(this);
    }

    // need to be overwrited
    _onChange(editorState) {
        console.log('_onChange function should be overwrited');
    }

	_handleKeyCommand(command) {
		const { editorState } = this.state;
		const newState = RichUtils.handleKeyCommand(editorState, command);
		if (newState) {
			this.onChange(newState);
			return true;
		}
		return false;
	}

    _renderDraftjsEditingField(editorState) {
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
                        onChange={this.onChange}
                        ref="editor"
                        spellCheck={true}
                    />
                </div>
            </div>
        );
    }

    _toggleTextWithEntity(entityKey, text) {
        const {editorState} = this.state;
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
        this.onChange(_editorState);
    }

    _toggleLink(entity, value) {
        const {url, text} = value;
        const entityKey = url !== '' ? Entity.create(entity, 'IMMUTABLE', {text: text || url, url: url}) : null;
        this._toggleTextWithEntity(entityKey, text || url);
    }

    _toggleEntity(entity, value) {
        switch (entity) {
            case ENTITY.link.type:
                return this._toggleLink(entity, value);
            default:
                return;
        }
    }

    _toggleBlockStyle(blockStyle) {
        this.onChange(
            RichUtils.toggleBlockType(
                this.state.editorState,
                blockType
            )
        );
    }

    _toggleInlineStyle(inlineStyle) {
        this.onChange(
            RichUtils.toggleInlineStyle(
                this.state.editorState,
                inlineStyle
            )
        );
    }

    _focus() {
        this.refs.editor.focus();
    }
}

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
	{ label: 'Underline', style: 'UNDERLINE', icon: 'fa-underline', text: '' }
];

export default DraftjsEditingMixin;
