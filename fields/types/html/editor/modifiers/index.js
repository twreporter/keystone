'use strict';

import ENTITY from '../entities';
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

	switch (blockType) {
		case ENTITY.ANNOTATION.type:
		case ENTITY.AUDIO.type:
		case ENTITY.BLOCKQUOTE.type:
		case ENTITY.EMBEDDEDCODE.type:
		case ENTITY.IMAGE.type:
		case ENTITY.IMAGEDIFF.type:
		case ENTITY.INFOBOX.type:
		case ENTITY.SLIDESHOW.type:
		case ENTITY.YOUTUBE.type:
			if (valueChanged) {
				return replaceAtomicBlock(editorState, blockKey, valueChanged);
			}
			return removeBlock(editorState, blockKey);
		default:
			return editorState;
	}
};

export default {
	insertAtomicBlock,
	handleAtomicEdit,
};
