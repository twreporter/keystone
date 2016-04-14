'use strict';
import { Entity } from 'draft-js';
import quoteTypes from './quote-types';

export default function quoteBlockStyleFn(contentBlock) {
    const blockType = contentBlock.getType();
    if (quoteTypes.hasOwnProperty(blockType)) {
        return quoteTypes[blockType].style;
    }
    return;
}
