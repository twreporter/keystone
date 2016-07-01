'use strict';

import _ from 'lodash';
import { convertToRaw, Entity } from 'draft-js';
import ENTITY from '../entities';

export function replaceAtomicBlock(editorState, blockKey, value) {
    const content = editorState.getCurrentContent();
    const block = content.getBlockForKey(blockKey);
    const entityKey = block.getEntityAt(0);
    Entity.mergeData(entityKey, value);
    return editorState;
};
