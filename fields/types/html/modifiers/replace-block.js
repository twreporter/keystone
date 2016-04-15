'use strict';

import {constant} from '../CONSTANT';
import {pick} from 'lodash';
import { Entity } from 'draft-js';

export function replaceImageBlock(editorState, blockKey, image) {
  const content = editorState.getCurrentContent();
  const block = content.getBlockForKey(blockKey);
  const entityKey = block.getEntityAt(0);
  Entity.mergeData(entityKey, pick(image, constant.imageRequiredProps));
  return editorState;
};

export function replaceImagesBlock(editorState, blockKey, images) {
  const content = editorState.getCurrentContent();
  const block = content.getBlockForKey(blockKey);
  const entityKey = block.getEntityAt(0);
  Entity.mergeData(entityKey, {images: images.map((image) => {
      return pick(image, constant.imageRequiredProps)
  })});
  return editorState;
};
