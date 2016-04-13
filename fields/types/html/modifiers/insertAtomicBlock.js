'use strict';

import {pick} from 'lodash';
import {
  AtomicBlockUtils,
  Entity,
} from 'draft-js';
import CONSTANT from '../CONSTANT';

export function insertImagesBlock(editorState, type, images) {
  const entityKey = Entity.create(
    type,
    'IMMUTABLE',
    {
        images: images.map((image) => {
            return pick(image, CONSTANT.imageRequiredProps)
        })
    }
  );

  return AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, ' ');
}

export function insertImageBlock(editorState, type, image) {
  const entityKey = Entity.create(
    type,
    'IMMUTABLE',
    pick(image, CONSTANT.imageRequiredProps)
  );

  return AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, ' ');
}
