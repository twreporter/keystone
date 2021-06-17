'use strict';

export function replaceAtomicBlock(editorState, blockKey, value) {
  const contentState = editorState.getCurrentContent();
  const block = contentState.getBlockForKey(blockKey);
  const entityKey = block.getEntityAt(0);
  contentState.replaceEntityData(entityKey, value);
  return editorState;
}
