'use strict';

import {
	AtomicBlockUtils,
	Entity,
} from 'draft-js';

export default function insertAtomicBlock (editorState, type, value) {
	const entityKey = Entity.create(
		type,
		'IMMUTABLE',
		value
	);

	return AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, ' ');
}
