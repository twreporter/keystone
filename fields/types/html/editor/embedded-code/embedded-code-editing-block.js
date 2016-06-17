'use strict';
import objectAssgin from 'object-assign';
import EntityEditingBlock from '../base/entity-editing-block';
import React from 'react';

class EmbeddedCodeEditingBlock extends EntityEditingBlock {
    constructor(props) {
        super(props);
        this.state.editingFields = {
            caption: props.caption,
            embeddedCode: props.embeddedCode
        };
    }

    // overwrite
    _composeEditingFields(props) {
        return {
            caption: {
                type: 'text',
                value: props.caption
            },
            embeddedCode: {
                type: 'textarea',
                value: props.embeddedCode
            }
        };
    }

    // overwrite
    _decomposeEditingFields(fields) {
        return {
            caption: fields.caption.value,
            embeddedCode: fields.embeddedCode.value
        }
    }
}

EmbeddedCodeEditingBlock.displayName = 'EmbeddedCodeEditingBlock';

EmbeddedCodeEditingBlock.propTypes = objectAssgin({}, EntityEditingBlock.propTypes, {
    caption: React.PropTypes.string,
    embeddedCode: React.PropTypes.string,
});

EmbeddedCodeEditingBlock.defaultProps = objectAssgin({}, EntityEditingBlock.defaultProps, {
    caption: '',
    embeddedCode: ''
});

export default EmbeddedCodeEditingBlock;
