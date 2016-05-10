'use strict';

import { pick } from 'lodash';
import {
  AtomicBlockUtils,
  Entity,
} from 'draft-js';
import { ENTITY } from '../CONSTANT';

export function insertImagesBlock(editorState, type, images) {
  const entityKey = Entity.create(
    type,
    'IMMUTABLE',
    {
        images: images.map((image) => {
            return pick(image, ENTITY.image.imageRequiredProps)
        })
    }
  );

  return AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, ' ');
}

export function insertImageBlock(editorState, type, image) {
  const entityKey = Entity.create(
    type,
    'IMMUTABLE',
    pick(image, ENTITY.image.imageRequiredProps)
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

export function insertInfoBoxBlock(editorState, type, title = '', body = '') {
  const entityKey = Entity.create(
    type,
    'IMMUTABLE',
    {
        title: title,
        body: body
    }
  );

  return AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, ' ');
}
