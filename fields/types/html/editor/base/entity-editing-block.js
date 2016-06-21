'use strict';
import { Button, FormField, FormInput, InputGroup, Modal } from 'elemental';
import React, { Component } from 'react';

// This is an abstract class to be extended
class EntityEditingBlock extends Component {

    constructor(props) {
        super(props);
        this.state = {
            editingFields: {}
        };
        this.toggleModal = this._toggleModal.bind(this);
        this.handleChange = this._handleChange.bind(this);
        this.handleSave = this._handleSave.bind(this);
        this.composeEditingFields = this._composeEditingFields.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this._editingFields = this.composeEditingFields(nextProps);
        this.setState({
            editingFields: this._editingFields
        });
    }

    componentWillUnmount() {
        this._editingFields = null;
    }

    // this function should be overwritten by children
    _composeEditingFields(props) {
        console.warning('_composeEditingFields should be extended');
        return {};
    }

    // this function should be overwritten by children
    _decomposeEditingFields(fields) {
        console.warning('_decomposeEditingFields should be extended');
        return {};
    }

    _toggleModal() {
        this.props.handleToggle();
    }

    _handleChange(field, e) {
        this._editingFields[field].value = e.target.value;
    }

    _handleSave() {
        this.setState({
            editingFields: this._editingFields
        }, () => {
            this.props.handleToggle();
            this.props.onToggle(this._decomposeEditingFields(this._editingFields));
        });
    }

    _renderEditingField(field, type, value) {
        return (
            <FormField label={field} htmlFor={"form-input-"+field} key={field}>
                <FormInput type={type} multiline={type === 'textarea' ? true : false} placeholder={"Enter " + field} name={"form-input-"+field} onChange={this.handleChange.bind(this, field)} defaultValue={value}/>
            </FormField>
        );
    }
    _renderEditingFields(fields) {
        let Fields = Object.keys(fields).map((field) => {
            const type = fields[field].type;
            const value = fields[field].value;
            return this._renderEditingField(field, type, value);
        });
        return Fields;
    }

    render() {
        return (
            <Modal isOpen={this.props.isModalOpen} onCancel={this.toggleModal} backdropClosesModal>
                <Modal.Header text={"Insert " + this.props.label} showCloseButton onClose={this.toggleModal} />
                <Modal.Body>
                    {this._renderEditingFields(this.state.editingFields)}
                </Modal.Body>
                <Modal.Footer>
                    <Button type="primary" onClick={this.handleSave}>Save</Button>
                    <Button type="link-cancel" onClick={this.toggleModal}>Cancel</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

EntityEditingBlock.propTypes = {
    label: React.PropTypes.string,
    isModalOpen: React.PropTypes.bool,
    onToggle: React.PropTypes.func.isRequired
};

EntityEditingBlock.defaultProps = {
    label: 'default',
    isModalOpen: true
};

export default EntityEditingBlock;
