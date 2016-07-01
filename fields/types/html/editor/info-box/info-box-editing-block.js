'use strict'
import { convertToRaw, ContentState, EditorState } from 'draft-js';
import decorator from '../entity-decorator';
import objectAssgin from 'object-assign';
import DraftConverter from '../draft-converter';
import DraftPasteProcessor from 'draft-js/lib/DraftPasteProcessor';
import EntityEditingBlock from '../base/entity-editing-block';
import React from 'react';

class InfoBoxEditingBlock extends EntityEditingBlock {
    constructor(props) {
        super(props);
        this.state.editorState = this._initEditorState(props.draftRawObj);
    }

    // overwrite EntityEditingBlock._composeEditingFields
    _composeEditingFields(props) {
        return {
            title: {
                type: 'text',
                value: props.title
            },
            body: {
                type: 'html',
                value: props.body
            }
        };
    }


    // overwrite EntityEditingBlock._decomposeEditingFields
    _decomposeEditingFields(fields) {
        let { editorState } = this.state;
        const content = convertToRaw(editorState.getCurrentContent());
        const cHtml = DraftConverter.convertToHtml(content);
        return {
            title: fields.title.value,
            body: cHtml,
            draftRawObj: content
        }
    }

    // overwrite EntityEditingBlock._handleEditingFieldChange
    _handleEditingFieldChange(field, e) {
        if (field === 'body') {
            return;
        }
        return super._handleEditingFieldChange(field, e);
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
