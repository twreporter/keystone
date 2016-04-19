'use strict';

import { pick } from 'lodash';
import { Entity } from 'draft-js';
import { ENTITY } from '../CONSTANT';

export function replaceImageBlock(editorState, blockKey, image) {
  const content = editorState.getCurrentContent();
  const block = content.getBlockForKey(blockKey);
  const entityKey = block.getEntityAt(0);
  Entity.mergeData(entityKey, pick(image, ENTITY.image.imageRequiredProps));
  return editorState;
};

export function replaceImagesBlock(editorState, blockKey, images) {
  const content = editorState.getCurrentContent();
  const block = content.getBlockForKey(blockKey);
  const entityKey = block.getEntityAt(0);
  Entity.mergeData(entityKey, {images: images.map((image) => {
      return pick(image, ENTITY.image.imageRequiredProps)
  })});
  return editorState;
};
