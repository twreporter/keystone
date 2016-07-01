'use strict';

import _ from 'lodash';
import { Entity } from 'draft-js';
import ENTITY from '../entities';

export function replaceAtomicBlock(atomicBlockType, editorState, blockKey, value) {
  const content = editorState.getCurrentContent();
  const block = content.getBlockForKey(blockKey);
  const entityKey = block.getEntityAt(0);
  let requiredProps = _.get(ENTITY, [ atomicBlockType, 'requiredProps' ])
  if (requiredProps) {
    Entity.mergeData(entityKey, _.pick(value, requiredProps));
  } else {
    Entity.mergeData(entityKey, value);
  }
  return editorState;
};

export function replaceImagesBlock(editorState, blockKey, images) {
  const content = editorState.getCurrentContent();
  const block = content.getBlockForKey(blockKey);
  const entityKey = block.getEntityAt(0);
  Entity.mergeData(entityKey, {images: images.map((image) => {
      return _.pick(image, ENTITY.image.requiredProps)
  })});
  return editorState;
};
