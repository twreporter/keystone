import { BlockMapBuilder, Editor, EditorState, Modifier, Entity, RichUtils, convertFromHTML, convertFromRaw, convertToRaw } from 'draft-js';
import { BlockStyleButtons, EntityButtons, InlineStyleButtons } from './editor/editor-buttons';
import { Button, FormInput } from 'elemental';
import ENTITY from './editor/entities';
import AtomicBlockSwitcher from './editor/base/atomic-block-switcher';
import BlockModifier from './editor/modifiers/index';
import DraftConverter from './editor/draft-converter';
import Field from '../Field';
import React from 'react';
import blockStyleFn from './editor/base/block-style-fn';
import decorator from './editor/entity-decorator';

let lastId = 0;

function getId () {
	return 'keystone-html-' + lastId++;
}

function refreshEditorState (editorState) {
	return EditorState.forceSelection(editorState, editorState.getCurrentContent().getSelectionAfter());
}

// class HtmlField extends React.Component {
module.exports = Field.create({
	displayName: 'HtmlField',

	getInitialState () {

		// convert saved editor content into the editor state
		let editorState;
		try {
			const { draft, html } = this.props.value;
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


	_convertToApiData (editorState) {
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
			apiData,
		});

		// update value if the content has been changed
		if (valueStr !== this.state.valueStr) {
			this.setState({
				valueStr,
				editorState,
			});
		} else {
			this.setState({
				editorState,
			});
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
		this.onChange(_editorState);
	},

	_toggleAtomicBlock (entity, value) {
		const _editorState = BlockModifier.insertAtomicBlock(this.state.editorState, entity, value);
		this.onChange(_editorState);
	},

	_toggleAudio (entity, value) {
		const audio = Array.isArray(value) ? value[0] : null;
		if (!audio) {
			return;
		}
		this._toggleAtomicBlock(entity, audio);
	},

	_toggleInlineEntity (entity, value) {
		const entityKey = Entity.create(entity, 'IMMUTABLE', value);
		this._toggleTextWithEntity(entityKey, _.get(value, 'text'));
	},

	_toggleImage (entity, value) {
		const image = Array.isArray(value) ? value[0] : null;
		if (!image) {
			return;
		}
		this._toggleAtomicBlock(entity, image);
	},

	_toggleImageDiff (entity, value) {
		const images = Array.isArray(value) && value.length === 2 ? value : null;
		if (!images) {
			return;
		}
		this._toggleAtomicBlock(entity, images);
	},

	_toggleSlideshow (entity, value) {
		const images = Array.isArray(value) && value.length > 0 ? value : null;
		if (!images) {
			return;
		}
		this._toggleAtomicBlock(entity, images);
	},


	toggleEntity (entity, value) {
		switch (entity) {
			case ENTITY.audio.type:
				return this._toggleAudio(entity, value);
			case ENTITY.blockQuote.type:
			case ENTITY.infobox.type:
			case ENTITY.embeddedCode.type:
			case ENTITY.youtube.type:
				return this._toggleAtomicBlock(entity, value);
			case ENTITY.annotation.type:
			case ENTITY.link.type:
				return this._toggleInlineEntity(entity, value);
			case ENTITY.image.type:
				return this._toggleImage(entity, value);
			case ENTITY.slideshow.type:
				return this._toggleSlideshow(entity, value);
			case ENTITY.imageDiff.type:
				return this._toggleImageDiff(entity, value);
			default:
				return;
		}
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
					refreshEditorState: () => {
						this.onChange(refreshEditorState(this.state.editorState));
					},
					data: this._convertToApiData(this.state.editorState),
					// render desktop layout when editor is enlarged,
					// otherwise render mobile layout
					device: this.state.isEnlarged ? 'desktop' : 'mobile',
				},
			};
		}
		return null;
	},

	enlargeEditor () {
		// also set editorState to force editor to re-render
		this.setState({ isEnlarged: !this.state.isEnlarged, editorState: refreshEditorState(this.state.editorState) });
	},

	handlePastedText (text, html) {
		function insertFragment (editorState, fragment) {
			let newContent = Modifier.replaceWithFragment(editorState.getCurrentContent(), editorState.getSelection(), fragment);
			return EditorState.push(editorState, newContent, 'insert-fragment');
		}

		if (html) {
			// remove meta tag
			html = html.replace(/<meta (.+?)>/g, '');
			// replace p, h2 by div.
			// TODO need to find out how many block tags we need to replace
			// currently, just handle p, h1, h2, ..., h6 tag
			// NOTE: I don't know why header style can not be parsed into ContentBlock,
			// so I replace it by div temporarily
			html = html.replace(/<p|<h1|<h2|<h3|<h4|<h5|<h6/g, '<div').replace(/<\/p|<\/h1|<\/h2|<\/h3|<\/h4|<\/h5|<\/h6/g, '</div');

			let editorState = this.state.editorState;
			var htmlFragment = convertFromHTML(html);
			if (htmlFragment) {
				var htmlMap = BlockMapBuilder.createFromArray(htmlFragment);
				this.onChange(insertFragment(editorState, htmlMap));
				// prevent the default paste behavior.
				return true;
			}
		}
		// use default paste behavior
		return false;
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
								entities={Object.keys(ENTITY).map((entity) => {
									return entity.toUpperCase();
								})}
								editorState={editorState}
								onToggle={this.toggleEntity}
							/>
							<Button type={'hollow-primary DraftEditor-expandButton' + expandBtnClass} onClick={this.enlargeEditor}><i className={'fa ' + expandIcon} aria-hidden="true"></i></Button>
						</div>
					</div>
					<div className={className + expandBtnClass} onClick={this.focus}>
						<Editor
							blockRendererFn={this._blockRenderer}
							blockStyleFn={blockStyleFn}
							customStyleMap={styleMap}
							editorState={editorState}
							handleKeyCommand={this.handleKeyCommand}
							handlePastedText={this.handlePastedText}
							onChange={this.onChange}
							placeholder="Enter HTML Here..."
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
	{ label: 'Code Block', style: 'code-block', icon: 'fa-code', text: '' },
	{ label: 'H1', style: 'header-one', icon: 'fa-header', text: '1' },
	{ label: 'H2', style: 'header-two', icon: 'fa-header', text: '2' },
	{ label: 'H3', style: 'header-three', icon: 'fa-header', text: '3' },
	{ label: 'H4', style: 'header-four', icon: 'fa-header', text: '4' },
	{ label: 'H5', style: 'header-five', icon: 'fa-header', text: '5' },
	{ label: 'H6', style: 'header-six', icon: 'fa-header', text: '6' },
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

