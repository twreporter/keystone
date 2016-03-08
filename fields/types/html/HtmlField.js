import _ from 'underscore';
import Field from '../Field';
import React from 'react';
import ReactDOM from 'react-dom';
import Draft from 'draft-js';
import { Editor, EditorState, RichUtils } from 'draft-js';
import tinymce from 'tinymce';
import { FormInput } from 'elemental';

import DraftHtmlConverter from './DraftHtmlConverter';

/**
 * TODO:
 * - Remove dependency on underscore
 */

var lastId = 0;

function getId () {
	return 'keystone-html-' + lastId++;
}

class RichEditor extends React.Component {
	constructor (props) {
		super(props);
		this.state = {
			editorState: EditorState.createEmpty(),
		};

		this.focus = () => {
			this.refs.editor.focus();
		};

		this.onChange = (editorState) => {
			console.log('getCurrentContent', Draft.convertToRaw(editorState.getCurrentContent()));
			console.log('HTML', DraftHtmlConverter(Draft.convertToRaw(editorState.getCurrentContent())));
			this.setState({ editorState });
		};

		this.handleKeyCommand = (command) => this._handleKeyCommand(command);
		this.toggleBlockType = (type) => this._toggleBlockType(type);
		this.toggleInlineStyle = (style) => this._toggleInlineStyle(style);
	}

	_handleKeyCommand (command) {
		const { editorState } = this.state;
		const newState = RichUtils.handleKeyCommand(editorState, command);
		if (newState) {
			this.onChange(newState);
			return true;
		}
		return false;
	}

	_toggleBlockType (blockType) {
		this.onChange(
			RichUtils.toggleBlockType(
				this.state.editorState,
				blockType
			)
		);
	}

	_toggleInlineStyle (inlineStyle) {
		this.onChange(
			RichUtils.toggleInlineStyle(
				this.state.editorState,
				inlineStyle
			)
		);
	}

	render () {
		const { editorState } = this.state;
		const useSpellCheck = true;

		// If the user changes block type before entering any text, we can
		// either style the placeholder or hide it. Let's just hide it now.
		let className = 'mce-edit-area RichInput';
		var contentState = editorState.getCurrentContent();

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
						placeholder="Tell a story..."
						ref="editor"
						spellCheck={useSpellCheck}
						/>
				</div>
			</div>
		);
	}
}

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

const BLOCK_TYPES = [
	{ label: 'H1', style: 'header-one' },
	{ label: 'H2', style: 'header-two' },
	{ label: 'Blockquote', style: 'blockquote' },
	{ label: 'UL', style: 'unordered-list-item' },
	{ label: 'OL', style: 'ordered-list-item' },
	{ label: 'Code Block', style: 'code-block' },
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

var INLINE_STYLES = [
	{ label: 'Bold', style: 'BOLD' },
	{ label: 'Italic', style: 'ITALIC' },
	{ label: 'Underline', style: 'UNDERLINE' },
	{ label: 'Monospace', style: 'CODE' },
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


module.exports = Field.create({

	displayName: 'HtmlField',

	getInitialState () {
		return {
			id: getId(),
			isFocused: false,
		};
	},

	initWysiwyg () {
		if (!this.props.wysiwyg) return;

		var self = this;
		var opts = this.getOptions();

		opts.setup = function (editor) {
			self.editor = editor;
			editor.on('change', self.valueChanged);
			editor.on('focus', self.focusChanged.bind(self, true));
			editor.on('blur', self.focusChanged.bind(self, false));
		};

		this._currentValue = this.props.value;
		tinymce.init(opts);
	},

	componentDidUpdate (prevProps, prevState) {
		if (prevState.isCollapsed && !this.state.isCollapsed) {
			this.initWysiwyg();
		}

		if (_.isEqual(this.props.dependsOn, this.props.currentDependencies)
			&& !_.isEqual(this.props.currentDependencies, prevProps.currentDependencies)) {
			var instance = tinymce.get(prevState.id);
			if (instance) {
				tinymce.EditorManager.execCommand('mceRemoveEditor', true, prevState.id);
				this.initWysiwyg();
			} else {
				this.initWysiwyg();
			}
		}
	},

	componentDidMount () {
		this.initWysiwyg();
	},

	componentWillReceiveProps (nextProps) {
		if (this.editor && this._currentValue !== nextProps.value) {
			this.editor.setContent(nextProps.value);
		}
	},

	focusChanged (focused) {
		this.setState({
			isFocused: focused,
		});
	},

	valueChanged () {
		var content;
		if (this.editor) {
			content = this.editor.getContent();
		} else if (this.refs.editor) {
			content = this.refs.editor.getDOMNode().value;
		} else {
			return;
		}

		console.log('TinyMCE content', content);

		this._currentValue = content;
		this.props.onChange({
			path: this.props.path,
			value: content,
		});
	},

	getOptions () {
		var plugins = ['code', 'link'];
		var options = Object.assign(
				{},
				Keystone.wysiwyg.options,
				this.props.wysiwyg
			);
		var toolbar = options.overrideToolbar ? '' : 'bold italic | alignleft aligncenter alignright | bullist numlist | outdent indent | removeformat | link ';
		var i;

		if (options.enableImages) {
			plugins.push('image');
			toolbar += ' | image';
		}

		if (options.enableCloudinaryUploads || options.enableS3Uploads) {
			plugins.push('uploadimage');
			toolbar += options.enableImages ? ' uploadimage' : ' | uploadimage';
		}

		if (options.additionalButtons) {
			var additionalButtons = options.additionalButtons.split(',');
			for (i = 0; i < additionalButtons.length; i++) {
				toolbar += (' | ' + additionalButtons[i]);
			}
		}
		if (options.additionalPlugins) {
			var additionalPlugins = options.additionalPlugins.split(',');
			for (i = 0; i < additionalPlugins.length; i++) {
				plugins.push(additionalPlugins[i]);
			}
		}
		if (options.importcss) {
			plugins.push('importcss');
			var importcssOptions = {
				content_css: options.importcss,
				importcss_append: true,
				importcss_merge_classes: true,
			};

			Object.assign(options.additionalOptions, importcssOptions);
		}

		if (!options.overrideToolbar) {
			toolbar += ' | code';
		}

		var opts = {
			selector: '#' + this.state.id,
			toolbar: toolbar,
			plugins: plugins,
			menubar: options.menubar || false,
			skin: options.skin || 'keystone',
		};

		if (this.shouldRenderField()) {
			opts.uploadimage_form_url = options.enableS3Uploads ? Keystone.adminPath + '/api/s3/upload' : Keystone.adminPath + '/api/cloudinary/upload';
		} else {
			Object.assign(opts, {
				mode: 'textareas',
				readonly: true,
				menubar: false,
				toolbar: 'code',
				statusbar: false,
			});
		}

		if (options.additionalOptions) {
			Object.assign(opts, options.additionalOptions);
		}

		return opts;
	},

	getFieldClassName () {
		var className = this.props.wysiwyg ? 'wysiwyg' : 'code';
		return className;
	},

	renderField () {
		var className = this.state.isFocused ? 'is-focused' : '';
		var style = {
			height: this.props.height,
		};
		return (
			<div className={className}>
				<RichEditor />
				<FormInput multiline ref="editor" style={style} onChange={this.valueChanged} id={this.state.id} className={this.getFieldClassName()} name={this.props.path} value={this.props.value} />
			</div>
		);
	},

	renderValue () {
		return <FormInput multiline noedit value={this.props.value} />;
	},

});
