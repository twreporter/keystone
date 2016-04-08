'use strict';

import { Entity } from 'draft-js';
import CONSTANT from '../../CONSTANT';

export default (editorState, blockKey, images) => {
  const content = editorState.getCurrentContent();
  const block = content.getBlockForKey(blockKey);
  const entityKey = block.getEntityAt(0);
  Entity.mergeData(entityKey, {images: images.map((image) => {
      return pick(image, CONSTANT.imageRequiredProps)
  })});
  return editorState;
}
