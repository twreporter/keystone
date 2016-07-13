'use strict';
import EntityEditingBlockMixin from '../mixins/entity-editing-block-mixin';
import React from 'react';

class BlockQuoteEditingBlock extends EntityEditingBlockMixin(React.Component) {
	constructor (props) {
		super(props);
	}

	// overwrite EntityEditingBlock._composeEditingFields
	_composeEditingFields (props) {
		return {
			quoteBy: {
				type: 'text',
				value: props.quoteBy,
			},
			quote: {
				type: 'textarea',
				value: props.quote,
			},
		};
	}


	// overwrite EntityEditingBlock._decomposeEditingFields
	_decomposeEditingFields (fields) {
		return {
			quoteBy: fields.quoteBy.value,
			quote: fields.quote.value,
		};
	}
};

BlockQuoteEditingBlock.displayName = 'BlockQuoteEditingBlock';

BlockQuoteEditingBlock.propTypes = {
	isModalOpen: React.PropTypes.bool,
	onToggle: React.PropTypes.func.isRequired,
	quote: React.PropTypes.string,
	quoteBy: React.PropTypes.string,
	toggleModal: React.PropTypes.func,
};

BlockQuoteEditingBlock.defaultProps = {
	isModalOpen: false,
	quote: '',
	quoteBy: '',
};

export default BlockQuoteEditingBlock;
