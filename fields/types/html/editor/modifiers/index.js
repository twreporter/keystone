'use strict';

import insertAtomicBlock from './insert-atomic-block';
import { replaceAtomicBlock } from './replace-block';
import { Entity } from 'draft-js';
import removeBlock from './remove-block';

const handleAtomicEdit = (editorState, blockKey, valueChanged) => {
	const block = editorState.getCurrentContent().getBlockForKey(blockKey);
	const entityKey = block.getEntityAt(0);
	let blockType;
	try {
		blockType = entityKey ? Entity.get(entityKey).getType() : '';
	} catch (e) {
		console.log('Get entity type in the block occurs error ', e);
		return editorState;
	}

	// backward compatible. Old block type is lower case
	blockType = blockType && blockType.toUpperCase();

	if (valueChanged) {
		return replaceAtomicBlock(editorState, blockKey, valueChanged);
	}
	return removeBlock(editorState, blockKey);
};

export default {
	insertAtomicBlock,
	handleAtomicEdit,
};
