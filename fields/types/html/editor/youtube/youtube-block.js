'use strict';

import { AlignedYoutube } from '@twreporter/react-article-components/dist/components/article/index';
import AtomicBlockRendererMixin from '../mixins/atomic-block-renderer-mixin';
import EditingBt from '../base/editing-bt';
import React from 'react';
import YoutubeEditingBlock from './youtube-editing-block';
import get from 'lodash/get';

const _ = {
  get,
}

export default class YoutubeBlock extends AtomicBlockRendererMixin(React.Component) {
	constructor (props) {
		super(props);
	}

	render () {
		if (!this.state.data) {
			return null;
		}

		let blockContent = _.get(this.state.data, ['content', 0], {});
		let youtubeId = blockContent.youtubeId;
		let description = blockContent.description;
		const EditBlock = (
			<YoutubeEditingBlock
				description={description}
				label="youtube"
				isModalOpen={this.state.editMode}
				onToggle={this.handleEditingBlockChange}
				toggleModal={this.toggleEditMode}
				youtubeId={youtubeId}
			/>
		);

		return (
			<div
				contentEditable={false}
				calssName="youtube-container"
				style={{
					position: 'relative',
				}}
			>
				<AlignedYoutube
					{...this.state.data}
				/>
				<EditingBt
					onClick={this.toggleEditMode}
				/>
				{EditBlock}
			</div>
		);
	}
};
