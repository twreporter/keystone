'use strict';
import objectAssgin from 'object-assign';
import EntityEditingBlock from '../base/entity-editing-block';
import React from 'react';

class EmbeddedCodeEditingBlock extends EntityEditingBlock {
    constructor(props) {
        super(props);
        this.state.editingFields = {
            embeddedCode: props.embeddedCode,
        };
    }

    // overwrite
    _composeEditingFields(props) {
        return {
            embeddedCode: {
                type: 'textarea',
                value: props.embeddedCode
            }
        };
    }

    // overwrite
    _decomposeEditingFields(fields) {
        return {
            embeddedCode: fields.embeddedCode.value
        }
    }
}

EmbeddedCodeEditingBlock.displayName = 'EmbeddedCodeEditingBlock';

EmbeddedCodeEditingBlock.propTypes = objectAssgin({}, EntityEditingBlock.propTypes, {
    embeddedCode: React.PropTypes.string,
});

EmbeddedCodeEditingBlock.defaultProps = objectAssgin({}, EntityEditingBlock.defaultProps, {
    embeddedCode: ''
});

export default EmbeddedCodeEditingBlock;
