import quoteTypes from './quote-types';
import React from 'react';

const Quote = (props) => {
	return (
		<blockquote {...props}>
			{props.children}
		</blockquote>
	);
};

function findQuote (contentBlock, callback) {
	if (quoteTypes.hasOwnProperty(contentBlock.getType())) {
		callback(0, contentBlock.getLength - 1);
	}
	callback(0, 0);
}

export default { strategy: findQuote, component: Quote };
