import { shallowEqual } from 'react-pure-render';
import { ContentState, Editor, RichUtils } from 'draft-js';
import blockStyleFn from './base/block-style-fn';
import React from 'react';

class DraftEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      editorState: props.editorState
    };

    this.handleEditorStateChange = this._handleEditorStateChange.bind(this);
    this.handleKeyCommand = this._handleKeyCommand.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      editorState: nextProps.editorState
    });
  }

  shouldComponentUpdate (nextProps, nextState) {
      return !shallowEqual(this.state, nextState);
  }

  _handleEditorStateChange(editorState) {
    this.props.onChange(editorState);
  }

	_handleKeyCommand(command) {
		const { editorState } = this.state;
		const newState = RichUtils.handleKeyCommand(editorState, command);
		if (newState) {
			this.handleEditorStateChange(newState);
			return true;
		}
		return false;
	}

  focus() {
    this.refs.editor.focus();
  }

  render() {
		return (
      <Editor blockRendererFn={this.props.blockRendererFn}
        blockStyleFn={blockStyleFn}
        customStyleMap={this.props.styleMap}
        editorState={this.state.editorState}
        handleKeyCommand={this.handleKeyCommand}
        onChange={this.handleEditorStateChange}
        placeholder="Enter HTML Here..."
        spellCheck={this.props.spellCheck}
        ref='editor'
      />
		);
  }
}

DraftEditor.propTypes = {
  blockRendererFn: React.PropTypes.func,
  customStyleMap: React.PropTypes.object,
  editorState: React.PropTypes.object,
  onChange: React.PropTypes.func.isRequired,
  spellCheck: React.PropTypes.bool
};

DraftEditor.defaultProps = {
  customStyleMap: {},
  editorState: {},
  spellCheck: true
};

export default DraftEditor;
