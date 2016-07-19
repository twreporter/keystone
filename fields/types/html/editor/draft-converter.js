// Modified from https://github.com/dburrows/draft-js-basic-html-editor/blob/master/src/utils/draftRawToHtml.js

'use strict';
import { List } from 'immutable';
import quoteTypes from './quote/quote-types';
import ApiDataInstance from './api-data-instance';
import AtomicBlockProcessor from './atomic-block-processor';
import InlineStylesProcessor from './inline-styles-processor';

let defaultBlockTagMap = {
	'code-block': `<code>%content%</code>\n`,
	'default': `<p>%content%</p>\n`,
	'header-one': `<h1>%content%</h1>\n`,
	'header-two': `<h1>%content%</h1>\n`,
	'ordered-list-item': `<li>%content%</li>\n`,
	'unordered-list-item': `<li>%content%</li>\n`,
	'atomic': `<div>%content%</div>\n`,
	'unstyled': `<p>%content%</p>\n`,
};

let inlineTagMap = {
	BOLD: ['<strong>', '</strong>'],
	CODE: ['<code>', '</code>'],
	default: ['<span>', '</span>'],
	ITALIC: ['<em>', '</em>'],
	UNDERLINE: ['<u>', '</u>'],
};

let defaultEntityTagMap = {
	annotation: ['<div><div><%= data.text %></div><div><%= data.annotation %></div>', '</div>'],
	audio: ['<div><h4><%= data.title %></h4><span><%= data.description %></span><audio src="<%= data.url %>" />', '</div>'],
	blockQuote: ['<blockquote><div><%= data.quote %></div><div><%= data.quoteBy %></div>', '<blockquote>'],
	embeddedCode: ['<div><%= data.embeddedCode%>', '</div>'],
	infobox: ['<div><div><span><%= data.title %></span></div><div><span><%= data.body %></span></div>', '</div>'],
	link: ['<a href="<%= data.url %>">', '</a>'],
	image: ['<img src="<%= data.url %>">', '</img>'],
	slideshow: ['<!-- slideshow component --> <ol> <%  _.forEach(data, function(image) { %><li><img src="<%- image.url %>" /></li><% }); %>', '</ol>'],
	imageDiff: ['<!-- imageDiff component --> <ol> <% _.forEach(data, function(image, index) { if (index > 1) { return; } %><li><img src="<%- image.url %>" /></li><% }); %>', '</ol>'],
	youtube: ['<iframe width="560" height="315" src="https://www.youtube.com/embed/<%= data.youtubeId %>" frameborder="0" allowfullscreen>', '</iframe>'],
};

let nestedTagMap = {
	'ordered-list-item': ['<ol>', '</ol>'],
	'unordered-list-item': ['<ul>', '</ul>'],
};

function _convertInlineStyle (block, entityMap, blockTagMap, entityTagMap) {
	return blockTagMap[block.type] ? blockTagMap[block.type].replace(
		'%content%',
		InlineStylesProcessor(inlineTagMap, entityTagMap, entityMap, block)
	) : blockTagMap.default.replace(
		'%content%',
		InlineStylesProcessor(inlineTagMap, block)
	);
}

function _convertBlocksToHtml (blocks, entityMap, blockTagMap, entityTagMap) {
	let html = '';
	let nestLevel = []; // store the list type of the previous item: null/ol/ul
	blocks.forEach((block) => {
		// create tag for <ol> or <ul>: deal with ordered/unordered list item
		// if the block is a list-item && the previous block is not a list-item
		if (nestedTagMap[block.type] && nestLevel[0] !== block.type) {
			html += nestedTagMap[block.type][0]; // start with <ol> or <ul>
			nestLevel.unshift(block.type);
		}

		// end tag with </ol> or </ul>: deal with ordered/unordered list item
		if (nestLevel.length > 0 && nestLevel[0] !== block.type) {
			html += nestedTagMap[nestLevel.shift()][1]; // close with </ol> or </ul>
		}

		html += _convertInlineStyle(block, entityMap, blockTagMap, entityTagMap);
	});

	// end tag with </ol> or </ul>: or if it is the last block
	if (blocks.length > 0 && nestedTagMap[blocks[blocks.length - 1].type]) {
		html += nestedTagMap[nestLevel.shift()][1]; // close with </ol> or </ul>
	}

	return html;
}

function convertBlocksToApiData (blocks, entityMap) {
	let apiDataArr = List();
	let content = [];
	let nestLevel = [];
	blocks.forEach((block) => {
		// block is not a list-item
		if (!nestedTagMap[block.type]) {
			// if previous block is a list-item
			if (content.length > 0 && nestLevel.length > 0) {
				apiDataArr = apiDataArr.push(new ApiDataInstance({ type: nestLevel[0], content: [content] }));
				content = [];
				nestLevel.shift();
			}

			if (block.type.startsWith('atomic') || block.type.startsWith('media')) {
				apiDataArr = apiDataArr.push(AtomicBlockProcessor.convertBlock(entityMap, block));
			} else if (quoteTypes.hasOwnProperty(block.type)) {
				let style = quoteTypes[block.type].style;
				let converted = InlineStylesProcessor(inlineTagMap, defaultEntityTagMap, entityMap, block);
				// set type as blockquote for easy understanding
				apiDataArr = apiDataArr.push(new ApiDataInstance({ id: block.key, type: 'blockquote', content: [converted], styles: [style] }));
			} else {
				let converted = InlineStylesProcessor(inlineTagMap, defaultEntityTagMap, entityMap, block);
				apiDataArr = apiDataArr.push(new ApiDataInstance({ id: block.key, type: block.type, content: [converted] }));
			}
		} else {
			let converted = InlineStylesProcessor(inlineTagMap, defaultEntityTagMap, entityMap, block);

			// previous block is not an item-list block
			if (nestLevel.length === 0) {
				nestLevel.unshift(block.type);
				content.push(converted);
			} else if (nestLevel[0] === block.type) {
				// previous block is a item-list and current block is the same item-list
				content.push(converted);
			} else if (nestLevel[0] !== block.type) {
				// previous block is a different item-list.
				apiDataArr = apiDataArr.push(new ApiDataInstance({ id: block.key, type: nestLevel[0], content: [content] }));
				content = [converted];
				nestLevel[0] = block.type;
			}
		}
	});

	// last block is a item-list
	if (blocks.length > 0 && nestLevel.length > 0) {
		let block = blocks[blocks.length - 1];
		apiDataArr = apiDataArr.push(new ApiDataInstance({ id: block.key, type: block.type, content: content }));
	}

	return apiDataArr;
}

function convertRawToHtml (raw, blockTagMap, entityTagMap) {
	blockTagMap = blockTagMap || defaultBlockTagMap;
	entityTagMap = entityTagMap || defaultEntityTagMap;
	let html = '';
	raw = raw || {};
	const blocks = Array.isArray(raw.blocks) ? raw.blocks : [];
	const entityMap = typeof raw.entityMap === 'object' ? raw.entityMap : {};
	html = _convertBlocksToHtml(blocks, entityMap, blockTagMap, entityTagMap);
	return html;
}

function convertRawToApiData (raw) {
	let apiData;
	raw = raw || {};
	const blocks = Array.isArray(raw.blocks) ? raw.blocks : [];
	const entityMap = typeof raw.entityMap === 'object' ? raw.entityMap : {};
	apiData = convertBlocksToApiData(blocks, entityMap);
	return apiData;
}

export default {
	convertToHtml: convertRawToHtml,
	convertToApiData: convertRawToApiData,
};
