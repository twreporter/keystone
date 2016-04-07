'use strict';

import { Entity } from 'draft-js';

export default (editorState, blockKey, image) => {
  const content = editorState.getCurrentContent();
  const block = content.getBlockForKey(blockKey);
  const entityKey = block.getEntityAt(0);
  Entity.mergeData(entityKey, {url: image.url, description: image.description});
  return editorState;
}
