'use strict';

import _ from 'lodash';
import {
  AtomicBlockUtils,
  Entity,
} from 'draft-js';
import ENTITY from '../entities';

export function insertAnnotationBlock(editorState, type, text, annotation) {
    const entityKey = Entity.create(
        type,
        'IMMUTABLE',
        {
          text,
          annotation
        }
    );

    return AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, ' ');
}

export function insertAudioBlock(editorState, type, audio) {
    _.set(audio, 'coverPhoto', _.pick(audio.coverPhoto, ENTITY.image.requiredProps));
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
        images: images.map((image) => {
            return _.pick(image, ENTITY.image.requiredProps)
        })
    }
  );

  return AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, ' ');
}

export function insertImageBlock(editorState, type, image) {
  const entityKey = Entity.create(
    type,
    'IMMUTABLE',
    _.pick(image, ENTITY.image.requiredProps)
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
