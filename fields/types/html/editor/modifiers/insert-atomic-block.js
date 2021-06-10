'use strict';

import {
  AtomicBlockUtils,
} from 'draft-js';

export default function insertAtomicBlock (editorState, type, value) {
  const contentState = editorState.getCurrentContent();
  const contentStateWithEntity = contentState.createEntity(type, 'IMMUTABLE', value);
  const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

	return AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, ' ');
}
