'use strict';
import EntityEditingBlockMixin from '../mixins/entity-editing-block-mixin';
import React from 'react';

class LinkEditingBlock extends EntityEditingBlockMixin(React.Component) {

    constructor(props) {
        super(props);
        this.state.editingFields = {
            text: props.text,
            url: props.url
        };
    }

    // overwrite
    _composeEditingFields(props) {
        return {
            text: {
                type: 'text',
                value: props.text
            },
            url: {
                type: 'text',
                value: props.url
            }
        };
    }

    // overwrite
    _decomposeEditingFields(fields) {
        return {
            text: fields.text.value,
            url: fields.url.value
        };
    }
};

LinkEditingBlock.displayName = 'LinkEditingBlock';

LinkEditingBlock.propTypes = {
    text: React.PropTypes.string,
    isModalOpen: React.PropTypes.bool,
    onToggle: React.PropTypes.func.isRequired,
    toggleModal: React.PropTypes.func,
    url: React.PropTypes.string
};

LinkEditingBlock.defaultProps = {
    text: '',
    isModalOpen: false,
    url: '',
};

export default LinkEditingBlock;
