'use strict'
import objectAssgin from 'object-assign';
import EntityEditingBlock from '../base/entity-editing-block';
import React from 'react';

class AnnotationEditingBlock extends EntityEditingBlock {
    constructor(props) {
        super(props);
        this.state.editingFields = {
            text: props.text,
            annotation: props.annotation
        };
    }

    // overwrite
    _composeEditingFields(props) {
        return {
            text: {
                type: 'text',
                value: props.text
            },
            annotation: {
                type: 'textarea',
                value: props.annotation
            }
        };
    }

    // overwrite
    _decomposeEditingFields(fields) {
        return {
            text: fields.text.value,
            annotation: fields.annotation.value
        }
    }
};

AnnotationEditingBlock.displayName = 'AnnotationEditingBlock';

AnnotationEditingBlock.propTypes = objectAssgin({}, EntityEditingBlock.propTypes, {
    annotation: React.PropTypes.string,
    text: React.PropTypes.string
});

AnnotationEditingBlock.defaultProps = objectAssgin({}, EntityEditingBlock.defaultProps, {
    annotation: '',
    text: ''
});

export default AnnotationEditingBlock;
