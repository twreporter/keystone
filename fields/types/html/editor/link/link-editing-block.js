'use strict';
import objectAssgin from 'object-assign';
import EntityEditingBlock from '../base/entity-editing-block';
import React from 'react';

class LinkEditingBlock extends EntityEditingBlock {

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

LinkEditingBlock.propTypes = objectAssgin({}, EntityEditingBlock.propTypes, {
    text: React.PropTypes.string,
    url: React.PropTypes.string
});

LinkEditingBlock.defaultProps = objectAssgin({}, EntityEditingBlock.defaultProps, {
    text: '',
    url: ''
});

export default LinkEditingBlock;
