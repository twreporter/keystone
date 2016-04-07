'use strict';

import { Entity } from 'draft-js';
import CONSTANT from '../CONSTANT';
import ImageModifier from './image/image-modifier';
import SlideshowModifier from './slideshow/slideshow-modifier';

const handleFinishEdit = (editorState, blockKey, valueChanged) => {
    const block = editorState.getCurrentContent().getBlockForKey(blockKey);
    const entityKey = block.getEntityAt(0);
    let blockType;
    try {
        blockType = entityKey ? Entity.get(entityKey).getData().type : null;
    } catch (e) {
        console.log('Get entity type in the block occurs error ', e);
        return editorState;
    }

    switch (blockType) {
        case CONSTANT.image:
            if (valueChanged) {
                return ImageModifier.replaceImageBlock(editorState, blockKey, valueChanged);
            }
            return ImageModifier.removeImageBlock(editorState, blockKey);
        case CONSTANT.slideshow:
            if (Array.isArray(valueChanged) && valueChanged.length > 0) {
                return SlideshowModifier.replaceSlideshowBlock(editorState, blockKey, valueChanged);
            }
            return SlideshowModifier.removeSlideshowBlock(editorState, blockKey);
        default:
            return editorState;
    }
};

export default {
    handleFinishEdit
};
