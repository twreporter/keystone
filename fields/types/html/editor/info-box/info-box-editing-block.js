'use strict'
import { convertToRaw, ContentState, EditorState } from 'draft-js';
import decorator from '../entity-decorator';
import objectAssgin from 'object-assign';
import DraftjsEditingMixin from '../mixins/draftjs-editing-mixin';
import DraftConverter from '../draft-converter';
import DraftPasteProcessor from 'draft-js/lib/DraftPasteProcessor';
import EntityEditingBlock from '../base/entity-editing-block';
import React from 'react';

class InfoBoxEditingBlock extends DraftjsEditingMixin(EntityEditingBlock) {
    constructor(props) {
        super(props);
        const processedHTML = DraftPasteProcessor.processHTML(props.body);
        const initialState = ContentState.createFromBlockArray(processedHTML);
        let editorState = EditorState.createWithContent(initialState, decorator);

        this.state = {
            editorState: editorState,
            editingFields: {
                title: props.title,
                body: props.body
            }
        }
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
        const cHtml = DraftConverter.convertToHtml(content, {
            unstyled: `<div class="info-box">%content%</div>\n`,
        }, {
            link: ['<a class="info-box-link" href="<%= url %>"><span class="info-box-link-text">', '</span></a>'],
        });
        return {
            title: fields.title.value,
            body: cHtml
        }
    }

    // overwrite EntityEditingBlock._handleChange
    _handleChange(field, e) {
        if (field === 'body') {
            return;
        }
        return super._handleChange(field, e);
    }

    // overwrite DraftjsEditingMixin._onChange
    _onChange(editorState) {
        this.setState({
            editorState: editorState
        });
    }

    // overwrite EntityEditingBlock._renderEditingField
    _renderEditingField(field, type, value) {
        if (type === 'html') {
            return super._renderDraftjsEditingField(this.state.editorState);
        }
        return super._renderEditingField(field, type, value);
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
