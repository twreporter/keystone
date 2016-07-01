import { convertFromRaw, convertToRaw, ContentState, EditorState, Modifier, Entity, RichUtils } from 'draft-js';
import { insertAudioBlock, insertEmbeddedCodeBlock, insertImageBlock, insertImagesBlock, insertInfoBoxBlock } from './editor/modifiers/insert-atomic-block';
import { shallowEqual } from 'react-pure-render';
import { BlockStyleButtons, EntityButtons, InlineStyleButtons } from './editor/editor-buttons';
import { Button, FormInput } from 'elemental';
import ENTITY from './editor/entities';
import decorator from './editor/entity-decorator'
import quoteTypes from './editor/quote/quote-types';
import AtomicBlockSwitcher from './editor/base/atomic-block-switcher';
import BlockModifier from './editor/modifiers/index';
import DraftConverter from './editor/draft-converter';
import DraftEditor from './editor/draft-editor';
import DraftPasteProcessor from 'draft-js/lib/DraftPasteProcessor';
import Field from '../Field';
import React from 'react';

let { processHTML } = DraftPasteProcessor;
let lastId = 0;

function getId () {
	return 'keystone-html-' + lastId++;
}

function refreshEditorState(editorState) {
    return EditorState.forceSelection(editorState, editorState.getCurrentContent().getSelectionAfter());
}

// class HtmlField extends React.Component {
module.exports = Field.create({
	displayName: 'HtmlField',

	getInitialState () {

		// convert saved editor content into the editor state
		let editorState;
		let isEnlarged = false;
		try {
			const {draft, html} = this.props.value;
			if (draft && html !== '') {
				// create an EditorState from the raw Draft data
				let contentState = convertFromRaw(draft);
				editorState = EditorState.createWithContent(contentState, decorator);
			} else {
				// create empty draft object
				editorState = EditorState.createEmpty(decorator);
			}
		}
		catch (error) {
			// create empty EditorState
			editorState = EditorState.createEmpty(decorator);
		}

		return {
            editorState: editorState,
            id: getId(),
            valueStr: JSON.stringify(this.props.value),
		};
	},

    shouldComponentUpdate (nextProps, nextState) {
        return !shallowEqual(this.state, nextState);
    },

    _convertToApiData(editorState) {
        const content = convertToRaw(editorState.getCurrentContent());
        const apiData = DraftConverter.convertToApiData(content);
        return apiData.toJS();
    },

    onChange (editorState) {
        const content = convertToRaw(editorState.getCurrentContent());
        const cHtml = DraftConverter.convertToHtml(content);
        const apiData = DraftConverter.convertToApiData(content);

        const valueStr = JSON.stringify({
            draft: content,
            html: cHtml,
            apiData
        });

        // update value if the content has been changed
        if (valueStr !== this.state.valueStr) {
            this.setState({
                valueStr,
                editorState
            });
        } else {
            this.setState({
                editorState
            })
        }
    },

	focus () {
		this.refs.editor.focus();
	},

	handleKeyCommand (command) {
		const { editorState } = this.state;
		const newState = RichUtils.handleKeyCommand(editorState, command);
		if (newState) {
			this.onChange(newState);
			return true;
		}
		return false;
	},

	toggleBlockType (blockType) {
        let editorState = this.state.editorState;
		this.onChange(
			RichUtils.toggleBlockType(
			    editorState,
				blockType
			)
		);
	},

	toggleInlineStyle (inlineStyle) {
		this.onChange(
			RichUtils.toggleInlineStyle(
				this.state.editorState,
				inlineStyle
			)
		);
	},

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
    },

    toggleAnnotation(entity, value) {
        const {text, annotation} = value;
        const entityKey = annotation !== '' ? Entity.create(entity, 'IMMUTABLE', {text: text || annotation, annotation: annotation}) : null;
        this._toggleTextWithEntity(entityKey, text || annotation);
    },

    toggleInfoBox(entity, value) {
        const {body, title} = value;
        const _editorState = insertInfoBoxBlock(this.state.editorState, ENTITY.infobox.type, title, body);
        this.onChange(_editorState);
    },

    toggleLink (entity, value) {
        const {url, text} = value;
        const entityKey = url !== '' ? Entity.create(entity, 'IMMUTABLE', {text: text || url, url: url}) : null;
        this._toggleTextWithEntity(entityKey, text || url);
    },

    toggleEmbeddedCode(entity, value) {
        if (value) {
            const _editorState = insertEmbeddedCodeBlock(this.state.editorState, ENTITY.embeddedCode.type, value.caption, value.embeddedCode);
            this.onChange(_editorState);
        }
    },

    toggleAudio(entity, value) {
        const audio = Array.isArray(value) ? value[0] : null;
        if (!audio) {
            return;
        }
        const _editorState = insertAudioBlock(this.state.editorState, ENTITY.audio.type, audio);
        this.onChange(_editorState);
    },

    toggleImage (entity, value) {
        const image = Array.isArray(value) ? value[0] : null;
        if (!image) {
            return;
        }
        this._insertImage(image);
    },

    toggleSlideshow (entity, value) {
        const images = Array.isArray(value) && value.length > 0 ? value : null;
        if (!images) {
            return;
        }
        this._insertSlideshow(images);
    },

    toggleImageDiff(entity, value) {
        const images = Array.isArray(value) && value.length === 2 ? value : null;
        if (!images) {
            return;
        }
        this._insertImageDiff(images);
    },

    toggleEntity (entity, value) {
        switch (entity) {
            case ENTITY.audio.type:
                return this.toggleAudio(entity, value);
            case ENTITY.annotation.type:
                return this.toggleAnnotation(entity, value);
            case ENTITY.infobox.type:
                return this.toggleInfoBox(entity, value);
            case ENTITY.embeddedCode.type:
                return this.toggleEmbeddedCode(entity, value);
            case ENTITY.link.type:
                return this.toggleLink(entity, value);
            case ENTITY.image.type:
                return this.toggleImage(entity, value);
            case ENTITY.slideshow.type:
                return this.toggleSlideshow(entity, value);
            case ENTITY.imageDiff.type:
                return this.toggleImageDiff(entity, value);
            default:
                return;
        }
    },

    _insertImage (image) {
        const _editorState = insertImageBlock(this.state.editorState, ENTITY.image.type, image);
        this.onChange(_editorState);
    },

    _insertSlideshow (images) {
        const _editorState = insertImagesBlock(this.state.editorState, ENTITY.slideshow.type, images);
        this.onChange(_editorState);
    },

    _insertImageDiff (images) {
        const _editorState = insertImagesBlock(this.state.editorState, ENTITY.imageDiff.type, images);
        this.onChange(_editorState);
    },

    _blockRenderer (block) {
        if (block.getType() === 'atomic') {
            return {
                component: AtomicBlockSwitcher,
                props: {
                    onFinishEdit: (blockKey, valueChanged) => {
                        const _editorState = BlockModifier.handleAtomicEdit(this.state.editorState, blockKey, valueChanged);

                        // workaround here.
                        // use refreshEditorState to make the Editor rerender
                        this.onChange(refreshEditorState(_editorState));
                    },
                    data: this._convertToApiData(this.state.editorState)
                }
            }
        }
        return null;
    },

	enlargeEditor () {
		this.setState({ isEnlarged: !this.state.isEnlarged });
	},

	renderField () {
		const { editorState } = this.state;
		const useSpellCheck = true;

		// If the user changes block type before entering any text, we can
		// either style the placeholder or hide it. Let's just hide it now.
		let outerClassName = '';
		let className = 'RichEditor-editor';
		let expandIcon = 'fa-expand';
		let expandBtnClass = '';
		let contentState = editorState.getCurrentContent();

		if (!contentState.hasText()) {
			if (contentState.getBlockMap().first().getType() !== 'unstyled') {
				className += ' RichEditor-hidePlaceholder';
			}
		}

		if (this.state.isEnlarged) {
			outerClassName = 'DraftEditor-fullscreen';
			expandIcon = 'fa-compress';
			expandBtnClass = ' expanded';
		}

		return (
			<div className={outerClassName}>
				<div className="RichEditor-root">
					<div className={'DraftEditor-controls' + expandBtnClass}>
						<div className={'DraftEditor-controlsInner' + expandBtnClass}>
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
                                entities={Object.keys(ENTITY)}
                                editorState={editorState}
                                onToggle={this.toggleEntity}
                            />
                            <Button type={'hollow-primary DraftEditor-expandButton' + expandBtnClass} onClick={this.enlargeEditor}><i className={'fa ' + expandIcon} aria-hidden="true"></i></Button>
                        </div>
                    </div>
                    <div className={className + expandBtnClass} onClick={this.focus}>
                        <DraftEditor
                            blockRendererFn={this._blockRenderer}
                            customStyleMap={styleMap}
                            editorState={editorState}
                            handleKeyCommand={this.handleKeyCommand}
                            onChange={this.onChange}
                            ref="editor"
                            spellCheck={useSpellCheck}
                        />
                        <FormInput type="hidden" name={this.props.path} value={this.state.valueStr} />
                    </div>
                </div>
			</div>
		);
	},

	renderValue () {
		return <FormInput multiline noedit value={JSON.stringify(this.props.value)} />;
	},
});

// Custom overrides for "code" style.
const styleMap = {
	CODE: {
		backgroundColor: 'rgba(0, 0, 0, 0.05)',
		fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
		fontSize: 16,
		padding: 2,
	},
};


// block settings
const BLOCK_TYPES = [
  { label: quoteTypes.blockquote.label, style: 'blockquote', icon: 'fa-quote-right', text: ' Block' },
  { label: quoteTypes.introquote.label, style: 'introquote', icon: 'fa-quote-right', text: ' Intro' },
  { label: quoteTypes.pumpingquote.label, style: 'pumpingquote', icon: 'fa-quote-right', text: ' Pumping' },
  { label: quoteTypes.forwardquote.label, style: 'forwardquote', icon: 'fa-quote-right', text: ' Forward' },
	{ label: 'Code Block', style: 'code-block', icon: 'fa-code', text: '' },
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
	{ label: 'Monospace', style: 'CODE', icon: 'fa-terminal', text: '' },
];

