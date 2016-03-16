import { Editor, EditorState, ContentState, RichUtils } from 'draft-js';
import { FormInput } from 'elemental';
import Draft from 'draft-js';
import DraftHtmlConverter from './DraftHtmlConverter';
import DraftPasteProcessor from 'draft-js/lib/DraftPasteProcessor';
import Field from '../Field';
import React from 'react';
import ReactDOM from 'react-dom';
import tinymce from 'tinymce';

let { processHTML } = DraftPasteProcessor;

var lastId = 0;

function getId () {
	return 'keystone-html-' + lastId++;
}

// class HtmlField extends React.Component {
module.exports = Field.create({
	displayName: 'HtmlField',

	getInitialState () {
		// convert saved editor content into the editor state
		let editorState;
		try {
			// const formData = JSON.parse(this.props.value);
			const formData = this.props.value;
			if (formData.draft && formData.html && formData.html !== '') {
				// create an EditorState from the raw Draft data
				let contentState = Draft.ContentState.createFromBlockArray(Draft.convertFromRaw(formData.draft));
				editorState = Draft.EditorState.createWithContent(contentState);
			} else {
				// create empty draft object
				editorState = EditorState.createEmpty();
			}
		}
		catch (error) {
			// transform existing HTML content produced by TinyMCE
			if (this.props.value && typeof (this.props.value) === 'string') {
				// create an EditorState from HTML
				editorState = EditorState.createWithContent(ContentState.createFromBlockArray(processHTML(this.props.value)));
			} else {
				// create empty EditorState
				editorState = EditorState.createEmpty();
			}
		}

		return {
			editorState: editorState,
			id: getId(),
		};
	},

	componentWillReceiveProps (nextProps) {
		if (this.editor && this._currentValue !== nextProps.value) {
			this.editor.setContent(nextProps.value);
		}
	},

	onChange (editorState) {
		this.props.onChange({
			path: this.props.path,
			value: this.state.value,
		});
		const content = Draft.convertToRaw(editorState.getCurrentContent());
		const cHtml = DraftHtmlConverter(content);
		this.setState({ editorState });

		// set value if the content has been changed
		if (this.state.html !== cHtml) {
			this.setState({ value: {
				draft: content,
				html: cHtml,
			} });
			this.setState({ draftStr: JSON.stringify(this.state.value) });
			this._currentValue = this.state.draftStr;
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
		this.onChange(
			RichUtils.toggleBlockType(
				this.state.editorState,
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

	renderField () {
		const { editorState } = this.state;
		const useSpellCheck = true;

		// If the user changes block type before entering any text, we can
		// either style the placeholder or hide it. Let's just hide it now.
		let className = 'mce-edit-area RichInput';
		let contentState = editorState.getCurrentContent();

		if (!contentState.hasText()) {
			if (contentState.getBlockMap().first().getType() !== 'unstyled') {
				className += ' RichEditor-hidePlaceholder';
			}
		}

		return (
			<div className="RichEditor-root">
				<BlockStyleControls
					editorState={editorState}
					onToggle={this.toggleBlockType}
					/>
				<InlineStyleControls
					editorState={editorState}
					onToggle={this.toggleInlineStyle}
					/>
				<div className={className} onClick={this.focus}>
					<Editor
						blockStyleFn={getBlockStyle}
						customStyleMap={styleMap}
						editorState={editorState}
						handleKeyCommand={this.handleKeyCommand}
						onChange={this.onChange}
						placeholder="Enter HTML Here..."
						ref="editor"
						spellCheck={useSpellCheck}
						/>
					<FormInput type="hidden" name={this.props.path} value={this.state.draftStr} />
				</div>
			</div>
		);
	},

	renderValue () {
		return <FormInput multiline noedit value={this.props.value} />;
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

function getBlockStyle (block) {
	switch (block.getType()) {
		case 'blockquote': return 'RichEditor-blockquote';
		default: return null;
	}
}

class StyleButton extends React.Component {
	constructor () {
		super();
		this.onToggle = (e) => {
			e.preventDefault();
			this.props.onToggle(this.props.style);
		};
	}

	render () {
		let className = 'RichEditor-styleButton Button Button--link';
		if (this.props.active) {
			className += ' RichEditor-activeButton';
		}

		return (
			<span
				className={className}
				onMouseDown={this.onToggle}>
				{this.props.label}
			</span>
		);
	}
}

// block settings
const BLOCK_TYPES = [
	{ label: 'Blockquote', style: 'blockquote' },
	{ label: 'Code Block', style: 'code-block' },
	{ label: 'H1', style: 'header-one' },
	{ label: 'H2', style: 'header-two' },
	{ label: 'OL', style: 'ordered-list-item' },
	{ label: 'UL', style: 'unordered-list-item' },
];

const BlockStyleControls = (props) => {
	const { editorState } = props;
	const selection = editorState.getSelection();
	const blockType = editorState
	.getCurrentContent()
	.getBlockForKey(selection.getStartKey())
	.getType();

	return (
		<div className="RichEditor-controls">
			{BLOCK_TYPES.map((type) =>
				<StyleButton
					key={type.label}
					active={type.style === blockType}
					label={type.label}
					onToggle={props.onToggle}
					style={type.style}
					/>
			)}
		</div>
	);
};

// inline style settings
var INLINE_STYLES = [
	{ label: 'Bold', style: 'BOLD' },
	{ label: 'Italic', style: 'ITALIC' },
	{ label: 'Monospace', style: 'CODE' },
	{ label: 'Underline', style: 'UNDERLINE' },
];

const InlineStyleControls = (props) => {
	var currentStyle = props.editorState.getCurrentInlineStyle();
	return (
		<div className="RichEditor-controls">
			{INLINE_STYLES.map(type =>
				<StyleButton
					key={type.label}
					active={currentStyle.has(type.style)}
					label={type.label}
					onToggle={props.onToggle}
					style={type.style}
					/>
			)}
		</div>
	);
};
