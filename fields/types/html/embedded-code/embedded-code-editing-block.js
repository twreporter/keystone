import { Button, FormField, FormInput, InputGroup, Modal } from 'elemental';
import React from 'react';

class EmbeddedCodeEditingBlock extends React.Component {
    constructor(props) {
        super(props);
        this._embeddedCode = '';
        this.state = {
            embeddedCode: props.embeddedCode,
        }
        this.toggleModal = this._toggleModal.bind(this);
        this.handleChange = this._handleChange.bind(this);
        this.handleSave = this._handleSave.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            embeddedCode: nextProps.embeddedCode
        });
    }

    componentWillUnmount() {
        this._embeddedCode = '';
    }

    _toggleModal() {
        this.props.handleToggle();
    }

    _handleChange(e) {
        this._embeddedCode = e.target.value;
    }

    _handleSave() {
        this.setState({
            embeddedCode: this._embeddedCode
        }, () => {
            this.props.handleToggle();
            this.props.onToggle({
                embeddedCode: this._embeddedCode
            });
        });
    }

    render() {
        return (
            <Modal isOpen={this.props.isModalOpen} onCancel={this.toggleModal} backdropClosesModal>
                <Modal.Header text={"Insert " + this.props.label} showCloseButton onClose={this.toggleModal} />
                <Modal.Body>
                    <FormField label="EmbeddedCode" htmlFor="form-input-embedded-code">
                        <FormInput type="embeddedCode" multiline placeholder="Enter Embedded Code" name="formr-input-embedded-code" onChange={this.handleChange} defaultValue={this.state.embeddedCode}/>
                    </FormField>
                </Modal.Body>
                <Modal.Footer>
                    <Button type="primary" onClick={this.handleSave}>Save</Button>
                    <Button type="link-cancel" onClick={this.toggleModal}>Cancel</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

EmbeddedCodeEditingBlock.propTypes = {
    embeddedCode: React.PropTypes.string,
    label: React.PropTypes.string,
    isModalOpen: React.PropTypes.bool,
    onToggle: React.PropTypes.func.isRequired
};
EmbeddedCodeEditingBlock.defaultProps = {
    embeddedCode: '',
    label: 'embeddedCode',
    isModalOpen: true
};

export default EmbeddedCodeEditingBlock;
