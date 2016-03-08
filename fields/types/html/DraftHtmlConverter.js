// Modified from https://github.com/dburrows/draft-js-basic-html-editor/blob/master/src/utils/draftRawToHtml.js

import InlineStylesProcessor from './InlineStylesProcessor';

let blockTagMap = {
	'header-one': `<h1>%content%</h1>\n`,
	'header-two': `<h1>%content%</h1>\n`,
	'unstyled': `<p>%content%</p>\n`,
	'code-block': `<code>%content%</code>\n`,
	'blockquote': `<blockquote>%content%</blockquote>\n`,
	'ordered-list-item': `<li>%content%</li>\n`,
	'unordered-list-item': `<li>%content%</li>\n`,
	'default': `<p>%content%</p>\n`,
};

let inlineTagMap = {
	BOLD: ['<strong>', '</strong>'],
	ITALIC: ['<em>', '</em>'],
	UNDERLINE: ['<u>', '</u>'],
	CODE: ['<code>', '</code>'],
	default: ['<span>', '</span>'],
};

let entityTagMap = {
	link: ['<a href="<%= href %>">', '</a>'],
};

let nestedTagMap = {
	'ordered-list-item': ['<ol>', '</ol>'],
	'unordered-list-item': ['<ul>', '</ul>'],
};

export default function (raw) {
	let html = '';
	let nestLevel = [];   // store the list type of the previous item: null/ol/ul

	raw.blocks.forEach(function (block) {
		// create tag for <ol> or <ul>: deal with ordered/unordered list item
		// if the block is a list-item && the previous block is not a list-item
		if (nestedTagMap[block.type] && nestLevel[0] !== block.type) {
			html += nestedTagMap[block.type][0];   // start with <ol> or <ul>
			nestLevel.unshift(block.type);
		}

		// end tag with </ol> or </ul>: deal with ordered/unordered list item
		if (nestLevel.length > 0 && nestLevel[0] !== block.type) {
			html += nestedTagMap[nestLevel.shift()][1];         // close with </ol> or </ul>
		}

		html += blockTagMap[block.type]
			? blockTagMap[block.type].replace(
				'%content%',
				InlineStylesProcessor(inlineTagMap, entityTagMap, raw.entityMap, block)
			)
			: blockTagMap.default.replace(
				'%content%',
				InlineStylesProcessor(inlineTagMap, block)
			);
	});

	// end tag with </ol> or </ul>: or if it is the last block
	if (raw.blocks.length > 0 && nestedTagMap[raw.blocks[raw.blocks.length - 1].type]) {
		html += nestedTagMap[nestLevel.shift()][1];         // close with </ol> or </ul>
	}

	return html;

}
