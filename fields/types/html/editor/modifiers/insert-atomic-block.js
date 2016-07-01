'use strict';

import {
  AtomicBlockUtils,
  Entity,
} from 'draft-js';
import ENTITY from '../entities';

export function insertAnnotationBlock(editorState, type, text, annotation, draftRawObj) {
    const entityKey = Entity.create(
        type,
        'IMMUTABLE',
        {
          text,
          annotation,
          draftRawObj
        }
    );

    return AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, ' ');
}

export function insertAudioBlock(editorState, type, audio) {
    const entityKey = Entity.create(
        type,
        'IMMUTABLE',
        audio
    );

    return AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, ' ');
}

export function insertImagesBlock(editorState, type, images) {
  const entityKey = Entity.create(
    type,
    'IMMUTABLE',
    {
        images
    }
  );

  return AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, ' ');
}

export function insertImageBlock(editorState, type, image) {
  const entityKey = Entity.create(
    type,
    'IMMUTABLE',
    image
  );

  return AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, ' ');
}

export function insertEmbeddedCodeBlock(editorState, type, caption = '', embeddedCode = '') {
  const entityKey = Entity.create(
    type,
    'IMMUTABLE',
    {
        caption,
        embeddedCode
    }
  );

  return AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, ' ');
}

export function insertInfoBoxBlock(editorState, type, title = '', body = '', draftRawObj) {
  const entityKey = Entity.create(
    type,
    'IMMUTABLE',
    {
        title: title,
        body: body,
        draftRawObj
    }
  );

  return AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, ' ');
}
