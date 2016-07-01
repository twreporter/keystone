'use strict'
import { convertToRaw, ContentState, EditorState } from 'draft-js';
import decorator from '../entity-decorator';
import objectAssgin from 'object-assign';
import DraftConverter from '../draft-converter';
import DraftPasteProcessor from 'draft-js/lib/DraftPasteProcessor';
import EntityEditingBlock from '../base/entity-editing-block';
import React from 'react';

class AnnotationEditingBlock extends EntityEditingBlock {
    constructor(props) {
        super(props);
        const processedHTML = DraftPasteProcessor.processHTML(props.annotation);
        const initialState = ContentState.createFromBlockArray(processedHTML);
        let editorState = EditorState.createWithContent(initialState, decorator);

        this.state = {
            editorState: editorState,
            editingFields: {
                text: props.text,
                annotation: props.annotation
            }
        }
    }

    // overwrite
    _composeEditingFields(props) {
        return {
            text: {
                type: 'text',
                value: props.text
            },
            annotation: {
                type: 'html',
                value: props.annotation
            }
        };
    }

    // overwrite
    _decomposeEditingFields(fields) {
        let { editorState } = this.state;
        const content = convertToRaw(editorState.getCurrentContent());
        const cHtml = DraftConverter.convertToHtml(content);
        return {
            text: fields.text.value,
            annotation: cHtml
        }
    }

    // overwrite EntityEditingBlock._handleEditingFieldChange
    _handleEditingFieldChange(field, e) {
        if (field === 'annotation') {
            return;
        }
        return super._handleEditingFieldChange(field, e);
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
