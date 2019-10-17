'use strict';

import { AlignedQuoteBy } from '@twreporter/react-article-components/dist/components/article/index';
import AtomicBlockRendererMixin from '../mixins/atomic-block-renderer-mixin';
import BlockQuoteEditingBlock from './block-quote-editing-block';
import React from 'react';
import get from 'lodash/get';

const _ = {
  get,
}

export default class BlockQuoteBlock extends AtomicBlockRendererMixin(React.Component) {
	constructor (props) {
		super(props);
	}

	render () {
		if (!this.state.data) {
			return null;
		}

		let blockContent = _.get(this.state.data, ['content', 0], {});
		let quote = blockContent.quote;
		let quoteBy = blockContent.quoteBy;

		const EditBlock = (
			<BlockQuoteEditingBlock
				label="blockquote"
				isModalOpen={this.state.editMode}
				onToggle={this.handleEditingBlockChange}
				quote={quote}
				quoteBy={quoteBy}
				toggleModal={this.toggleEditMode}
			/>
		);

		return (
			<div
				contentEditable={false}
				onClick={this.toggleEditMode}
				style={{ cursor: 'pointer' }}
			>
				<AlignedQuoteBy
					{...this.state.data}
					device={this.props.device}
				>
				{this.props.children}
				</AlignedQuoteBy>
				{EditBlock}
			</div>
		);
	}
}
