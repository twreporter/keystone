'use strict';

import ENTITY from '../entities';
import { insertImageBlock, insertImagesBlock } from './insert-atomic-block';
import { replaceAtomicBlock } from './replace-block';
import { Entity } from 'draft-js';
import removeBlock from './remove-block';

const handleAtomicEdit = (editorState, blockKey, valueChanged) => {
    const block = editorState.getCurrentContent().getBlockForKey(blockKey);
    const entityKey = block.getEntityAt(0)
    let blockType;
    try {
        blockType = entityKey ? Entity.get(entityKey).getType() : null;
    } catch (e) {
        console.log('Get entity type in the block occurs error ', e);
        return editorState;
    }

    switch (blockType) {
        case ENTITY.audio.type:
        case ENTITY.annotation.type:
        case ENTITY.embeddedCode.type:
        case ENTITY.image.type:
        case ENTITY.infobox.type:
            if (valueChanged) {
                return replaceAtomicBlock(editorState, blockKey, valueChanged);
            }
            return removeBlock(editorState, blockKey);
        case ENTITY.imageDiff.type:
        case ENTITY.slideshow.type:
            if (valueChanged) {
                return replaceAtomicBlock(editorState, blockKey, { images: valueChanged });
            }
            return removeBlock(editorState, blockKey);
        default:
            return editorState;
    }
};

export default {
    handleAtomicEdit
};
