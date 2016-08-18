// Modified from https://github.com/dburrows/draft-js-basic-html-editor/blob/master/src/utils/processInlineStylesAndEntities.js

import _ from 'lodash';
import ENTITY from './entities';

function _fullfilIntersection (block) {
	// SORT BEFORE PROCESSING
	let sortedISRanges = _.sortBy(block.inlineStyleRanges, 'offset');
	let sortedEntityRanges = _.sortBy(block.entityRanges, 'offset');
	let splitedISInline = [];

	for (let i = 0; i < sortedEntityRanges.length; i++) {
		let entityRange = sortedEntityRanges[i];
		for (let j = 0; j < sortedISRanges.length; j++) {
			let entityOffset = _.get(entityRange, 'offset', 0);
			let entityLength = _.get(entityRange, 'length', 0);
			let inlineLength = _.get(sortedISRanges, [j, 'length'], 0);
			let inlineOffset = _.get(sortedISRanges, [j, 'offset'], 0);
			let inlineStyle = _.get(sortedISRanges, [j, 'style'], '');
			let nextEntityOffset = _.get(sortedEntityRanges, [i + 1, 'offset'], 0);
			let nextEntityLength = _.get(sortedEntityRanges, [i + 1, 'length'], 0);

			// handle intersections of inline style and entity
			// <a></a> is entity
			// <abbr></abbr> is next entity
			// <strong></strong>  is inline style
			if (nextEntityOffset >= inlineOffset && nextEntityOffset < (inlineOffset + inlineLength) && (nextEntityOffset + nextEntityLength) > (inlineOffset + inlineLength) // <a><strong></a></strong>
				&& entityOffset < inlineOffset && (entityOffset + entityLength) > inlineOffset && (entityOffset + entityLength) <= (inlineOffset + inlineLength)) { // <strong><abbr></strong></abbr>
				// situation: <a><strong></a><abbr></strong></abbr>
				// should be: <a><strong></strong></a><strong></strong><abbr><strong></strong></abbr>

				// skip next entity checking
				i = i + 1;

				splitedISInline.push({
					index: j,
					replace: [{
						length: entityOffset + entityLength - inlineOffset,
						offset: inlineOffset,
						style: inlineStyle,
					}, {
						length: nextEntityOffset - (entityOffset + entityLength),
						offset: entityOffset + entityLength,
						style: inlineStyle,
					}, {
						length: inlineOffset + inlineLength - nextEntityOffset,
						offset: nextEntityOffset,
						style: inlineStyle,
					}],
				});

			} else if (entityOffset >= inlineOffset && entityOffset < (inlineOffset + inlineLength) && (entityOffset + entityLength) > (inlineOffset + inlineLength)) {
				// situation: <strong><a></strong></a>
				// should be: <strong></strong><a><strong></strong></a>
				splitedISInline.push({
					index: j,
					replace: [{
						length: entityOffset - inlineOffset,
						offset: inlineOffset,
						style: inlineStyle,
					}, {
						length: inlineOffset + inlineLength - entityOffset,
						offset: entityOffset,
						style: inlineStyle,
					}],
				});
			} else if (entityOffset < inlineOffset && (entityOffset + entityLength) > inlineOffset && (entityOffset + entityLength) <= (inlineOffset + inlineLength)) {
				// situation: <a><strong></a></strong>
				// should be: <a><strong></strong></a><strong></strong>
				splitedISInline.push({
					index: j,
					replace: [{
						length: entityOffset + entityLength - inlineOffset,
						offset: inlineOffset,
						style: inlineStyle,
					}, {
						length: inlineOffset + inlineLength - entityOffset - entityLength,
						offset: entityOffset + entityLength,
						style: inlineStyle,
					}],
				});
			}
		}
	}

	_.forEachRight(splitedISInline, (ele) => {
		sortedISRanges.splice(ele.index, 1, ...ele.replace);
	});

	return sortedISRanges;
}

function _inlineTag (inlineTagMap, inlineStyleRanges, tagInsertMap = {}) {
	// SORT BEFORE PROCESSING
	let sortedRanges = _.sortBy(inlineStyleRanges, 'offset');

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
	return tagInsertMap;
}

function _entityTag (entityTagMap, entityMap, entityRanges, tagInsertMap = {}) {
	_.forEach(entityRanges, (range) => {
		let entity = entityMap[range.key];
		let type = entity.type && entity.type.toUpperCase();
		let tag = entityTagMap[type];
		let data = entity.data;

		// special case
		if (type === ENTITY.ANNOTATION.type) {
			data = _.pick(data, 'text', 'annotation', 'pureAnnotationText');
		}

		let compiledTag0 = _.template(tag[0], { variable: 'data' })(data);
		let compiledTag1 = _.template(tag[1], { variable: 'data' })(data);

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
	return tagInsertMap;
}

function convertToHtml (inlineTagMap, entityTagMap, entityMap, block) {
	//  exit if there is no inlineStyleRanges/entityRanges or length === 0 as well
	if ((!block.inlineStyleRanges && !block.entityRanges)
		|| (block.inlineStyleRanges.length === 0 && block.entityRanges.length === 0)) {
		return block.text;
	}
	let html = block.text;
	let inlineStyleRanges = _fullfilIntersection(block);

	let tagInsertMap = {};
	tagInsertMap = _entityTag(entityTagMap, entityMap, block.entityRanges, tagInsertMap);
	tagInsertMap = _inlineTag(inlineTagMap, inlineStyleRanges, tagInsertMap);

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

export {
	convertToHtml,
};
