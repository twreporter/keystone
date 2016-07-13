// Modified from https://github.com/dburrows/draft-js-basic-html-editor/blob/master/src/utils/processInlineStylesAndEntities.js

import _ from 'lodash';

export default function InlineStylesProcessor (inlineTagMap, entityTagMap, entityMap, block) {
	//  exit if there is no inlineStyleRanges/entityRanges or length === 0 as well
	if ((!block.inlineStyleRanges && !block.entityRanges)
		|| (block.inlineStyleRanges.length === 0 && block.entityRanges.length === 0)) {
		return block.text;
	}
	let html = block.text;
	let tagInsertMap = {};

	let sortedRanges = _.sortBy(block.inlineStyleRanges, 'offset');

	// map all the tag insertions we're going to do
	sortedRanges.forEach(function (range) {
		let tag = inlineTagMap[range.style];

		if (!tagInsertMap[range.offset]) {
			tagInsertMap[range.offset] = [];
		}

		// add starting tag to the end of the array to form the tag nesting
		tagInsertMap[range.offset].push(tag[0]);
		if (tag[1]) {
			if (!tagInsertMap[range.offset + range.length]) {
				tagInsertMap[range.offset + range.length] = [];
			}
			// add closing tags to start of array, otherwise tag nesting will be invalid
			tagInsertMap[range.offset + range.length].unshift(tag[1]);
		}
	});

	// SORT BEFORE PROCESSING
	block.entityRanges.forEach(function (range) {
		let entity = entityMap[range.key];
		let tag = entityTagMap[entity.type];

		let compiledTag0 = _.template(tag[0])(entity.data);
		let compiledTag1 = _.template(tag[1])(entity.data);

		if (!tagInsertMap[range.offset]) {
			tagInsertMap[range.offset] = [];
		}

		// add starting tag
		tagInsertMap[range.offset].push(compiledTag0);
		if (tag[1]) {
			if (!tagInsertMap[range.offset + range.length]) {
				tagInsertMap[range.offset + range.length] = [];
			}
			// add closing tags to start of array, otherwise tag nesting will be invalid
			tagInsertMap[range.offset + range.length].unshift(compiledTag1);
		}
	});

	// sort on position, as we'll need to keep track of offset
	let orderedKeys = Object.keys(tagInsertMap).sort(function (a, b) {
		a = Number(a);
		b = Number(b);
		if (a > b) {
			return 1;
		}
		if (a < b) {
			return -1;
		}
		return 0;
	});

	// insert tags into string, keep track of offset caused by our text insertions
	let offset = 0;
	orderedKeys.forEach(function (pos) {
		let index = Number(pos);
		tagInsertMap[pos].forEach(function (tag) {
			html = html.substr(0, offset + index)
				+ tag + html.substr(offset + index);
			offset += tag.length;
		});
	});

	return html;
}
