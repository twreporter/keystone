import { Button, FormField, FormInput, InputGroup, Modal } from 'elemental';
import React from 'react';
import ReactDOM from 'react-dom';

const LinkButton = React.createClass({
    displayName: 'LinkButton',

    _textValue: '',

    _urlValue: '',

    propTypes: {
        active: React.PropTypes.bool,
        label: React.PropTypes.string,
        onToggle: React.PropTypes.func.isRequired,
        textValue: React.PropTypes.string,
        urlValue: React.PropTypes.string
    },

    getDefaultProps () {
        return {
            active: false,
            label: 'Link',
            textValue: '',
            urlValue: ''
        }
    },

    getInitialState () {
        this._textValue = this.props.textValue;
        this._urlValue = this.props.urlValue;
        return {
            isModalOpen: false,
            textValue: this.props.textValue,
            urlValue: this.props.urlValue
        };
    },

    componentWillReceiveProps (nextProps) {
        this._textValue = nextProps.textValue;
        this._urlValue = nextProps.urlValue;
        this.setState({
            textValue: nextProps.textValue,
            urlValue: nextProps.urlValue
        });
    },

    toggleModal () {
        this.setState({
            isModalOpen: !this.state.isModalOpen
        });
    },

    handleUrlChange (e) {
        this._urlValue = e.target.value;
    },

    handleTextChange (e) {
        this._textValue = e.target.value;
    },

    handleSave () {
        this.props.onToggle({
            text: this._textValue,
            url: this._urlValue
        });
        this.setState({
            isModalOpen: !this.state.isModalOpen,
            textValue: this._textValue,
            urlValue: this._urlValue
        });
    },

    showEditingBlock () {
        return (
            <Modal isOpen={this.state.isModalOpen} onCancel={this.toggleModal} backdropClosesModal>
                <Modal.Header text={"Insert " + this.props.label} showCloseButton onClose={this.toggleModal} />
                <Modal.Body>
                    <FormField label="URL" htmlFor="form-input-url">
                        <FormInput type="urlValue" placeholder="Enter URL" name="formrm-input-url" onChange={this.handleUrlChange} defaultValue={this.state.urlValue}/>
                    </FormField>
                    <FormField label="TEXT" htmlFor="form-input-text">
                        <FormInput type="textValue" placeholder="Enter TEXT" name="formrm-input-text" onChange={this.handleTextChange} defaultValue={this.state.textValue}/>
                    </FormField>
                </Modal.Body>
                <Modal.Footer>
                    <Button type="primary" onClick={this.handleSave}>Save</Button>
                    <Button type="link-cancel" onClick={this.toggleModal}>Cancel</Button>
                </Modal.Footer>
            </Modal>
        );
    },

    render() {
        let className = 'RichEditor-styleButton Button Button--link';
        if (this.props.active) {
            className += ' RichEditor-activeButton';
        }

        return (
            <div>
                {this.showEditingBlock()}
                <span className={className} onMouseDown={this.toggleModal}>
                    {this.props.label}
                </span>
            </div>
        );
    }
});

export default LinkButton;
