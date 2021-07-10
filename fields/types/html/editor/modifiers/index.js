'use strict';

import insertAtomicBlock from './insert-atomic-block';
import { replaceAtomicBlock } from './replace-block';
import removeBlock from './remove-block';

const handleAtomicEdit = (editorState, blockKey, valueChanged) => {
  if (valueChanged) {
    return replaceAtomicBlock(editorState, blockKey, valueChanged);
  }
  return removeBlock(editorState, blockKey);
};

export default {
  insertAtomicBlock,
  handleAtomicEdit,
};
