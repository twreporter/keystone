'use strict';
import quoteTypes from '../quote/quote-types';

export default function blockStyleFn (contentBlock) {
	const blockType = contentBlock.getType();
	if (quoteTypes.hasOwnProperty(blockType)) {
		return quoteTypes[blockType].style;
	}
	return;
}
