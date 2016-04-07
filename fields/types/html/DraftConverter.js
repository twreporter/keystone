// Modified from https://github.com/dburrows/draft-js-basic-html-editor/blob/master/src/utils/draftRawToHtml.js

import InlineStylesProcessor from './InlineStylesProcessor';

let blockTagMap = {
    'blockquote': `<blockquote>%content%</blockquote>\n`,
    'code-block': `<code>%content%</code>\n`,
    'default': `<p>%content%</p>\n`,
    'header-one': `<h1>%content%</h1>\n`,
    'header-two': `<h1>%content%</h1>\n`,
    'ordered-list-item': `<li>%content%</li>\n`,
    'unordered-list-item': `<li>%content%</li>\n`,
    'media': `<div>%content%</div>\n`,
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
    slideshow: ['<ol> <% _.forEach(images, function(image) { %><li><img src="<%- image.url %>" /></li><% }); %>', '</ol>']
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
        // TODO convert special block such as slideshow to html
        /*
            if (block.type === 'slideshow') {
            }
         */

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

function _convertBlocksToApiData (blocks, entityMap) {
    // TBD
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
    let data;
    raw = raw || {};
    const blocks = Array.isArray(raw.blocks) ? raw.blocks : [];
    const entityMap = typeof raw.entityMap === 'object' ? raw.entityMap : {};
    data = _convertBlocksToApiData(blocks, entityMap);
    return data;
}

export default {
    convertToHtml: convertRawToHtml,
    convertToApiData: convertRawToApiData
};
