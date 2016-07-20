'use strict';

import { Entity } from 'draft-js';

export function replaceAtomicBlock (editorState, blockKey, value) {
	const content = editorState.getCurrentContent();
	const block = content.getBlockForKey(blockKey);
	const entityKey = block.getEntityAt(0);
	Entity.replaceData(entityKey, value);
	return editorState;
};
