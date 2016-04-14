// Modified from https://github.com/dburrows/draft-js-basic-html-editor/blob/master/src/utils/draftRawToHtml.js

'use strict';
import { List } from 'immutable';
import quoteTypes from './quote/quote-types';
import ApiDataInstance from './ApiDataInstance';
import AtomicBlockProcessor from './AtomicBlockProcessor';
import InlineStylesProcessor from './InlineStylesProcessor';

let blockTagMap = {
    'blockquote': `<blockquote class="${quoteTypes.blockquote.style}">%content%</blockquote>\n`,
    'introquote': `<blockquote class="${quoteTypes.introquote.style}">%content%</blockquote>\n`,
    'pumpingquote': `<blockquote class="${quoteTypes.pumpingquote.style}">%content%</blockquote>\n`,
    'forwardquote': `<blockquote class="${quoteTypes.forwardquote.style}">%content%</blockquote>\n`,
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

let entityTagMap = {
    link: ['<a href="<%= url %>">', '</a>'],
    image: ['<img src="<%= url %>">', '</img>'],
    slideshow: ['<!-- slideshow component --> <ol> <% _.forEach(images, function(image) { %><li><img src="<%- image.url %>" /></li><% }); %>', '</ol>'],
    imageDiff: ['<!-- imageDiff component --> <ol> <% _.forEach(images, function(image, index) { if (index > 1) { return; } %><li><img src="<%- image.url %>" /></li><% }); %>', '</ol>']
};

let nestedTagMap = {
    'ordered-list-item': ['<ol>', '</ol>'],
    'unordered-list-item': ['<ul>', '</ul>'],
};

function _convertInlineStyle(block, entityMap) {
    return blockTagMap[block.type] ? blockTagMap[block.type].replace(
        '%content%',
        InlineStylesProcessor(inlineTagMap, entityTagMap, entityMap, block)
    ) : blockTagMap.default.replace(
        '%content%',
        InlineStylesProcessor(inlineTagMap, block)
    );
}

function _convertBlocksToHtml(blocks, entityMap) {
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

        html += _convertInlineStyle(block, entityMap);
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
                apiDataArr = apiDataArr.push(new ApiDataInstance({type: nestLevel[0], content: [content]}));
                content = [];
                nestLevel.shift();
            }

            if (block.type.startsWith('atomic') || block.type.startsWith('media')) {
                apiDataArr = apiDataArr.push(AtomicBlockProcessor.convertBlock(entityMap, block));
            } else if (quoteTypes.hasOwnProperty(block.type)) {
                let style = quoteTypes[block.type].style;
                let converted = InlineStylesProcessor(inlineTagMap, entityTagMap, entityMap, block);
                // set type as blockquote for easy understanding
                apiDataArr = apiDataArr.push(new ApiDataInstance({type: 'blockquote', content: [converted], styles: [style]}));
            } else {
                let converted = InlineStylesProcessor(inlineTagMap, entityTagMap, entityMap, block);
                apiDataArr = apiDataArr.push(new ApiDataInstance({type: block.type, content: [converted]}));
            }
        } else {
            let converted = InlineStylesProcessor(inlineTagMap, entityTagMap, entityMap, block);

            // previous block is not an item-list block
            if (nestLevel.length === 0) {
                nestLevel.unshift(block.type);
                content.push(converted);
            } else if (nestLevel[0] === block.type) {
                // previous block is a item-list and current block is the same item-list
                content.push(converted);
            } else if (nestLevel[0] !== block.type) {
                // previous block is a different item-list.
                apiDataArr = apiDataArr.push(new ApiDataInstance({type: nestLevel[0], content: [content]}));
                content = [converted];
                nestLevel[0] = block.type;
            }
        }
    });

    // last block is a item-list
    if (blocks.length > 0 && nestLevel.length > 0) {
        apiDataArr = apiDataArr.push(new ApiDataInstance({type: blocks[blocks.length - 1].type, content: content}));
    }

    return apiDataArr;
}

function convertRawToHtml(raw) {
    let html = '';
    raw = raw || {};
    const blocks = Array.isArray(raw.blocks) ? raw.blocks : [];
    const entityMap = typeof raw.entityMap === 'object' ? raw.entityMap : {};
    html = _convertBlocksToHtml(blocks, entityMap);
    return html;
}

function convertRawToApiData(raw) {
    let apiData;
    raw = raw || {};
    const blocks = Array.isArray(raw.blocks) ? raw.blocks : [];
    const entityMap = typeof raw.entityMap === 'object' ? raw.entityMap : {};
    apiData = convertBlocksToApiData(blocks, entityMap);
    return apiData;
}

export default {
    convertToHtml: convertRawToHtml,
    convertToApiData: convertRawToApiData
};
