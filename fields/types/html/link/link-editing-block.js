import { Button, FormField, FormInput, InputGroup, Modal } from 'elemental';
import React from 'react';

const LinkEditingBlock = React.createClass({
    displayName: 'LinkEditingBlock',

    _textValue: '',

    _urlValue: '',

    propTypes: {
        label: React.PropTypes.string,
        isModalOpen: React.PropTypes.bool,
        onToggle: React.PropTypes.func.isRequired,
        textValue: React.PropTypes.string,
        urlValue: React.PropTypes.string
    },

    getDefaultProps () {
        return {
            label: 'link',
            isModalOpen: true,
            textValue: '',
            urlValue: ''
        }
    },

    getInitialState () {
        this._textValue = this.props.textValue;
        this._urlValue = this.props.urlValue;
        return {
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

    componentWillUnmount () {
        this._textValue = '';
        this._urlValue = '';
    },

    toggleModal () {
        this.props.handleToggle();
    },

    handleUrlChange (e) {
        this._urlValue = e.target.value;
    },

    handleTextChange (e) {
        this._textValue = e.target.value;
    },

    handleSave () {
        this.setState({
            textValue: this._textValue,
            urlValue: this._urlValue
        }, () => {
            this.props.handleToggle();
            this.props.onToggle({
                text: this._textValue,
                url: this._urlValue
            });
        });
    },

    render() {
        return (
            <Modal isOpen={this.props.isModalOpen} onCancel={this.toggleModal} backdropClosesModal>
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
    }
});

export default LinkEditingBlock;
