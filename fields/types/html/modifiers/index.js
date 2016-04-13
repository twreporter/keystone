'use strict';

import { insertImageBlock, insertImagesBlock } from './insertAtomicBlock';
import { replaceImageBlock, replaceImagesBlock } from './replaceBlock';
import { Entity } from 'draft-js';
import removeBlock from './removeBlock';
import CONSTANT from '../CONSTANT';

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
        case CONSTANT.image:
            if (valueChanged) {
                return replaceImageBlock(editorState, blockKey, valueChanged);
            }
            return removeBlock(editorState, blockKey);
        case CONSTANT.slideshow:
            if (Array.isArray(valueChanged) && valueChanged.length > 0) {
                return replaceImagesBlock(editorState, blockKey, valueChanged);
            }
            return removeBlock(editorState, blockKey);
        case CONSTANT.imageDiff:
            if (Array.isArray(valueChanged) && valueChanged.length === 2) {
                return replaceImagesBlock(editorState, blockKey, valueChanged);
            }
            return removeBlock(editorState, blockKey);
        default:
            return editorState;
    }
};

export default {
    handleAtomicEdit
};
