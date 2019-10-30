// Modified from https://github.com/dburrows/draft-js-basic-html-editor/blob/master/src/utils/draftRawToHtml.js

'use strict';
import { List } from 'immutable';
import * as InlineStylesProcessor from './inline-styles-processor';
import ApiDataInstance from './api-data-instance';
import AtomicBlockProcessor from './atomic-block-processor';
import ENTITY from './entities';
import merge from 'lodash/merge';

const _ = {
  merge,
}

const annotationIndicatorPrefix = '__ANNOTATION__=';

let defaultBlockTagMap = {
	'atomic': `<div>%content%</div>`,
	'blockquote': `<blockquote>%content%</blockquote>`,
	'code-block': `<code>%content%</code>`,
	'default': `<p>%content%</p>`,
	'header-one': `<h1>%content%</h1>`,
	'header-two': `<h2>%content%</h2>`,
	'header-three': `<h3>%content%</h3>`,
	'header-four': `<h4>%content%</h4>`,
	'header-five': `<h5>%content%</h5>`,
	'header-six': `<h6>%content%</h6>`,
	'ordered-list-item': `<li>%content%</li>`,
	'paragraph': `<p>%content%</p>`,
	'unordered-list-item': `<li>%content%</li>`,
	'unstyled': `<p>%content%</p>`,
};

let inlineTagMap = {
	BOLD: ['<strong>', '</strong>'],
	CODE: ['<code>', '</code>'],
	default: ['<span>', '</span>'],
	ITALIC: ['<em>', '</em>'],
	UNDERLINE: ['<u>', '</u>'],
};

let defaultEntityTagMap = {
	[ENTITY.ANNOTATION.type]: ['<abbr title="<%= data.pureAnnotationText %>"><%= data.text %>', '</abbr>'],
	[ENTITY.AUDIO.type]: ['<div class="audio-container"><div class="audio-title"><%= data.title %></div><div class="audio-desc"><%= data.description %></div><audio src="<%= data.url %>" />', '</div>'],
	[ENTITY.BLOCKQUOTE.type]: ['<blockquote><div><%= data.quote %></div><div><%= data.quoteBy %></div>', '<blockquote>'],
	[ENTITY.EMBEDDEDCODE.type]: ['<div><%= data.embeddedCode%>', '</div>'],
	[ENTITY.INFOBOX.type]: ['<div class="info-box-container"><div class="info-box-title"><%= data.title %></div><div class="info-box-body"><%= data.body %></div>', '</div>'],
	[ENTITY.LINK.type]: ['<a target="_blank" href="<%= data.url %>">', '</a>'],
	[ENTITY.IMAGE.type]: ['<img alt="<%= data.description %>" src="<%= data.url %>">', '</img>'],
	[ENTITY.IMAGELINK.type]: ['<img alt="<%= data.description %>" src="<%= data.url %>">', '</img>'],
  [ENTITY.SLIDESHOW.type]: ['<!-- slideshow component start --> <ol class="slideshow-container"> <% if(!data) { data = []; } data.forEach(function(image) { %><li class="slideshow-slide"><img src="<%- image.url %>" /></li><% }); %>', '</ol><!-- slideshow component end -->'],
	[ENTITY.IMAGEDIFF.type]: ['<!-- imageDiff component start --> <ol class="image-diff-container"> <% if(!data) { data = []; } data.forEach(function(image, index) { if (index > 1) { return; } %><li class="image-diff-item"><img src="<%- image.url %>" /></li><% }); %>', '</ol><!-- imageDiff component end-->'],
	[ENTITY.YOUTUBE.type]: ['<iframe width="560" height="315" src="https://www.youtube.com/embed/<%= data.youtubeId %>" frameborder="0" allowfullscreen>', '</iframe>'],
};

let nestedTagMap = {
	'ordered-list-item': ['<ol>', '</ol>'],
	'unordered-list-item': ['<ul>', '</ul>'],
};

function _convertInlineStyle (block, entityMap, blockTagMap, entityTagMap) {
	return blockTagMap[block.type] ? blockTagMap[block.type].replace(
		'%content%',
		InlineStylesProcessor.convertToHtml(inlineTagMap, entityTagMap, entityMap, block)
	) : blockTagMap.default.replace(
		'%content%',
		InlineStylesProcessor.convertToHtml(inlineTagMap, block)
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

function convertBlocksToApiData (blocks, entityMap, entityTagMap) {
	let apiDataArr = List();
	let content = [];
	let nestLevel = [];
	blocks.forEach((block) => {
		// block is not a list-item
		if (!nestedTagMap[block.type]) {
			// if previous block is a list-item
			if (content.length > 0 && nestLevel.length > 0) {
				apiDataArr = apiDataArr.push(new ApiDataInstance({ type: nestLevel[0], content: content }));
				content = [];
				nestLevel.shift();
			}

			if (block.type.startsWith('atomic') || block.type.startsWith('media')) {
				apiDataArr = apiDataArr.push(AtomicBlockProcessor.convertBlock(entityMap, block));
			} else {
				let converted = InlineStylesProcessor.convertToHtml(inlineTagMap, entityTagMap, entityMap, block);
				let type = block.type;

				// special case for block containing annotation entity
				// set this block type as annotation
				if (converted.indexOf(annotationIndicatorPrefix) > -1) {
					type = ENTITY.ANNOTATION.type.toLowerCase();
				}
				apiDataArr = apiDataArr.push(new ApiDataInstance({ id: block.key, type: type, content: [converted] }));
			}
		} else {
			let converted = InlineStylesProcessor.convertToHtml(inlineTagMap, entityTagMap, entityMap, block);

			// previous block is not an item-list block
			if (nestLevel.length === 0) {
				nestLevel.unshift(block.type);
				content.push(converted);
			} else if (nestLevel[0] === block.type) {
				// previous block is a item-list and current block is the same item-list
				content.push(converted);
			} else if (nestLevel[0] !== block.type) {
				// previous block is a different item-list.
				apiDataArr = apiDataArr.push(new ApiDataInstance({ id: block.key, type: nestLevel[0], content: content }));
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
	blockTagMap = _.merge({}, defaultBlockTagMap, blockTagMap);
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
	let entityTagMap = _.merge({}, defaultEntityTagMap, {
		// special handling for annotation entity
		// annotation entity data will be included in the speical comment.
		[ENTITY.ANNOTATION.type]: [`<!--${annotationIndicatorPrefix}<%= JSON.stringify(data) %>--><!--`, '-->'],
	});
	apiData = convertBlocksToApiData(blocks, entityMap, entityTagMap);
	return apiData;
}

export default {
	convertToHtml: convertRawToHtml,
	convertToApiData: convertRawToApiData,
};
