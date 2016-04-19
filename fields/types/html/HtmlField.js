import { convertFromRaw, convertToRaw, ContentState, Editor, EditorState, Modifier, Entity, RichUtils } from 'draft-js';
import { FormInput, Button, ButtonGroup } from 'elemental';
import { shallowEqual } from 'react-pure-render';
import { insertImageBlock, insertImagesBlock } from './modifiers/insert-atomic-block';
import decorator from './entityDecorator'
import blockStyleFn from './base/block-style-fn';
import quoteTypes from './quote/quote-types';
import AtomicBlock from './base/atomic-block';
import BlockModifier from './modifiers/index';
import CONSTANT from './CONSTANT';
import DraftConverter from './DraftConverter';
import DraftPasteProcessor from 'draft-js/lib/DraftPasteProcessor';
import Field from '../Field';
import ImageButton from './image/image-button';
import LinkButton from './link/link-button';
import React from 'react';
import ReactDOM from 'react-dom';

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
        const _editorState = insertImageBlock(this.state.editorState, CONSTANT.image, image);
        this.onChange(_editorState);
    },

    _insertSlideshow (images) {
        const _editorState = insertImagesBlock(this.state.editorState, CONSTANT.slideshow, images);
        this.onChange(_editorState);
    },

    _insertImageDiff (images) {
        const _editorState = insertImagesBlock(this.state.editorState, CONSTANT.imageDiff, images);
        this.onChange(_editorState);
    },

    _blockRenderer (block) {
        if (block.getType() === 'atomic') {
            const entityKey = block.getEntityAt(0);
            const data =  entityKey ? Entity.get(entityKey).getData(): null;
            return {
                component: AtomicBlock,
                props: {
                    onFinishEdit: (blockKey, valueChanged) => {
                        const _editorState = BlockModifier.handleAtomicEdit(this.state.editorState, blockKey, valueChanged);
                        this.onChange(_editorState);
                    },
                    refreshEditorState: () => {
                        this.onChange(refreshEditorState(this.state.editorState));
                    },
                    alignment: data && data.alignment
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
		let className = 'RichEditor-editor';
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
						blockStyleFn={blockStyleFn}
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

class StyleButton extends React.Component {
	constructor () {
		super();
		this.onToggle = (e) => {
			e.preventDefault();
			this.props.onToggle(this.props.style);
		};
	}

	render () {
		let className = '';
		if (this.props.active) {
			className += ' RichEditor-activeButton';
		}

		return (
			<Button
				type="default"
				className={className + ' tooltip-box'}
				onMouseDown={this.onToggle}
				data-tooltip={this.props.label}>
				<i className={ 'fa ' + this.props.icon }></i>
				<span>{this.props.text}</span>
			</Button>
		);
	}
}

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

const BlockStyleControls = (props) => {
	const { editorState } = props;
	const selection = editorState.getSelection();
	const blockType = editorState
	.getCurrentContent()
	.getBlockForKey(selection.getStartKey())
	.getType();

	return (
		<ButtonGroup className="RichEditor-controls">
			{BLOCK_TYPES.map((type) =>
				<StyleButton
					key={type.label}
					active={type.style === blockType}
					label={type.label}
					onToggle={props.onToggle}
					style={type.style}
					icon={type.icon}
					text={type.text}
					/>
			)}
		</ButtonGroup>
	);
};

// inline style settings
var INLINE_STYLES = [
	{ label: 'Bold', style: 'BOLD', icon: 'fa-bold', text: '' },
	{ label: 'Italic', style: 'ITALIC', icon: 'fa-italic', text: '' },
	{ label: 'Underline', style: 'UNDERLINE', icon: 'fa-underline', text: '' },
	{ label: 'Monospace', style: 'CODE', icon: 'fa-terminal', text: '' },
];

const InlineStyleControls = (props) => {
	var currentStyle = props.editorState.getCurrentInlineStyle();
	return (
		<div className="ButtonGroup">
			{INLINE_STYLES.map(type =>
				<StyleButton
					key={type.label}
					active={currentStyle.has(type.style)}
					label={type.label}
					onToggle={props.onToggle}
					style={type.style}
					icon={type.icon}
					text={type.text}
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
												icon='fa-link'
												text=''
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
												icon='fa-photo'
												text=' Image'
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
												icon='fa-slideshare'
												text=' Slideshow'
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
												icon='fa-object-ungroup'
												text=' Diff'
                    />
                );
            default:
                return;
        }
    }

    return (
        <ButtonGroup>
					{ENTITIES.map(chooseButton)}
        </ButtonGroup>
    );
};
