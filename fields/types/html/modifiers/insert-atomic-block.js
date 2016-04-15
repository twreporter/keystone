'use strict';

import { constant } from '../CONSTANT';
import {pick} from 'lodash';
import {
  AtomicBlockUtils,
  Entity,
} from 'draft-js';

export function insertImagesBlock(editorState, type, images) {
  const entityKey = Entity.create(
    type,
    'IMMUTABLE',
    {
        images: images.map((image) => {
            return pick(image, constant.imageRequiredProps)
        })
    }
  );

  return AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, ' ');
}

export function insertImageBlock(editorState, type, image) {
  const entityKey = Entity.create(
    type,
    'IMMUTABLE',
    pick(image, constant.imageRequiredProps)
  );

  return AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, ' ');
}

export function insertEmbeddedCodeBlock(editorState, type, embeddedCode) {
  const entityKey = Entity.create(
    type,
    'IMMUTABLE',
    embeddedCode
  );

  return AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, ' ');
}
