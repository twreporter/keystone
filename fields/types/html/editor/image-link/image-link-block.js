'use strict';

import { AlignedEmbedded } from '@twreporter/react-article-components/dist/components/article/index';
import AtomicBlockRendererMixin from '../mixins/atomic-block-renderer-mixin';
import EditingBt from '../base/editing-bt';
import ImageLinkEditingBlock from './image-link-editing-block';
import React from 'react';
import get from 'lodash/get';

const _ = {
  get,
}

export default class ImageLinkBlock extends AtomicBlockRendererMixin(React.Component) {
	constructor (props) {
		super(props);
	}

	render () {
		if (!this.state.data) {
			return null;
		}

		let blockContent = _.get(this.state.data, ['content', 0], {});
		let caption = blockContent.caption;
		let url = blockContent.url;
		const EditBlock = (
			<ImageLinkEditingBlock
				description={caption}
				label="image-link"
				isModalOpen={this.state.editMode}
				onToggle={this.handleEditingBlockChange}
				url={url}
				toggleModal={this.toggleEditMode}
			/>
		);

		return (
			<div
				contentEditable={false}
				className="image-link-container"
				style={{ position: 'relative' }}
			>
				<AlignedEmbedded
					{...this.state.data}
					device={this.props.device}
				>
					{this.props.children}
				</AlignedEmbedded>
				<EditingBt
					onClick={this.toggleEditMode}
				/>
				{EditBlock}
			</div>
		);
	}
};
