'use strict'
import objectAssgin from 'object-assign';
import EntityEditingBlock from '../base/entity-editing-block';
import React from 'react';

class InfoBoxEditingBlock extends EntityEditingBlock {
    constructor(props) {
        super(props);
        this.state.editingFields = {
            title: props.title,
            body: props.body
        };
    }

    // overwrite
    _composeEditingFields(props) {
        return {
            title: {
                type: 'text',
                value: props.title
            },
            body: {
                type: 'textarea',
                value: props.body
            }
        };
    }

    // overwrite
    _decomposeEditingFields(fields) {
        return {
            title: fields.title.value,
            body: fields.body.value
        }
    }
};

InfoBoxEditingBlock.displayName = 'InfoBoxEditingBlock';

InfoBoxEditingBlock.propTypes = objectAssgin({}, EntityEditingBlock.propTypes, {
    body: React.PropTypes.string,
    title: React.PropTypes.string
});

InfoBoxEditingBlock.defaultProps = objectAssgin({}, EntityEditingBlock.defaultProps, {
    body: '',
    title: ''
});

export default InfoBoxEditingBlock;
