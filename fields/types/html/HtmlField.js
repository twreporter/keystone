import { convertFromRaw, convertToRaw, ContentState, Editor, EditorState, Modifier, Entity, RichUtils } from 'draft-js';
import { FormInput } from 'elemental';
import { shallowEqual } from 'react-pure-render';
import { insertImageBlock } from './modifiers/image/image-modifier';
import { insertImageDiffBlock } from './modifiers/image-diff/image-diff-modifier';
import { insertSlideshowBlock } from './modifiers/slideshow/slideshow-modifier';
import decorator from './entityDecorator'
import BlockModifier from './modifiers/index';
import CONSTANT from './CONSTANT';
import DraftConverter from './DraftConverter';
import DraftPasteProcessor from 'draft-js/lib/DraftPasteProcessor';
import Field from '../Field';
import ImageButton from './image/imageButton';
import LinkButton from './link/LinkButton';
import MediaBlock from './base/MediaBlock';
import React from 'react';
import ReactDOM from 'react-dom';

let { processHTML } = DraftPasteProcessor;
let lastId = 0;

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
			const {draft, html} = this.props.value;
			if (draft && html !== '') {
				// create an EditorState from the raw Draft data
				let contentState = ContentState.createFromBlockArray(convertFromRaw(draft));
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

    toggleLink (entity, value) {
        const {url, text} = value;
        const {editorState} = this.state;
        const entityKey = url !== '' ? Entity.create(entity, 'IMMUTABLE', {text: text || url, url: url}) : null;
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
            text || url,
            null,
            entityKey
        );
        const _editorState = EditorState.push(editorState, contentState, editorState.getLastChangeType());
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
            case CONSTANT.link:
                return this.toggleLink(entity, value);
            case CONSTANT.image:
                return this.toggleImage(entity, value);
            case CONSTANT.slideshow:
                return this.toggleSlideshow(entity, value);
            case CONSTANT.imageDiff:
                return this.toggleImageDiff(entity, value);
            default:
                return;
        }
    },

    _insertImage (image) {
        const _editorState = insertImageBlock(this.state.editorState, image);
        this.onChange(_editorState);
    },

    _insertSlideshow (images) {
        const _editorState = insertSlideshowBlock(this.state.editorState, images);
        this.onChange(_editorState);
    },

    _insertImageDiff (images) {
        const _editorState = insertImageDiffBlock(this.state.editorState, images);
        this.onChange(_editorState);
    },

    _blockRenderer (block) {
        if (block.getType() === 'media') {
            return {
                component: MediaBlock,
                props: {
                    onFinishEdit: (blockKey, valueChanged) => {
                        const _editorState = BlockModifier.handleFinishEdit(this.state.editorState, blockKey, valueChanged);
                        this.onChange(_editorState);
                    }
                }
            }
        }
        return null;
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
                <EntityControls
                    editorState={editorState}
                    onToggle={this.toggleEntity}
                />
				<div className={className} onClick={this.focus}>
					<Editor
                        blockRendererFn={this._blockRenderer}
						blockStyleFn={getBlockStyle}
						customStyleMap={styleMap}
						editorState={editorState}
						handleKeyCommand={this.handleKeyCommand}
						onChange={this.onChange}
						placeholder="Enter HTML Here..."
						ref="editor"
						spellCheck={useSpellCheck}
						/>
					<FormInput type="hidden" name={this.props.path} value={this.state.valueStr} />
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

// entities
const ENTITIES = Object.keys(CONSTANT);
const EntityControls = (props) => {
    const {editorState} = props;
    const selection = editorState.getSelection();
    const startKey = selection.getStartKey();
    const startOffset = selection.getStartOffset();
    const startBlock = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey());

    const endOffset = selection.getEndOffset();
    const entityKey = startBlock.getEntityAt(startOffset);
    let data;
    let entityInstance;
    let selectedText = '';

    if (!selection.isCollapsed()) {
        const blockText = startBlock.getText();
        selectedText = blockText.slice(startOffset, endOffset);
    }
    if (entityKey !== null) {
        entityInstance = Entity.get(entityKey);
        data = entityInstance.getData();
    }

    function onToggle (entity, changedValue) {
        props.onToggle(entity, changedValue);
    }

    function chooseButton (entity) {
        let active = entityInstance ? entityInstance.getType() === entity : false;
        switch (entity) {
            case CONSTANT.link:
                return (
                    <LinkButton
                        active={active}
                        key={entity}
                        label={entity}
                        onToggle={onToggle.bind(null, entity)}
                        urlValue={data ? data.url : ''}
                        textValue={data ? data.text : selectedText}
                    />
                );
            case CONSTANT.image:
                return (
                    <ImageButton
                        active={active}
                        apiPath="images"
                        key={entity}
                        label={entity}
                        onToggle={onToggle.bind(null, entity)}
                    />
                );
            case CONSTANT.slideshow:
                return (
                    <ImageButton
                        active={active}
                        apiPath="images"
                        key={entity}
                        label={entity}
                        onToggle={onToggle.bind(null, entity)}
                        selectionLimit={CONSTANT.slideshowSelectionLimit}
                    />
                );
            case CONSTANT.imageDiff:
                return (
                    <ImageButton
                        active={active}
                        apiPath="images"
                        key={entity}
                        label={entity}
                        onToggle={onToggle.bind(null, entity)}
                        selectionLimit={2}
                    />
                );
            default:
                return;
        }
    }

    return (
        <div className="RichEditor-controls">
			{ENTITIES.map(chooseButton)}
        </div>
    );
};

