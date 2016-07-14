'use strict';

import { AlignedYoutube } from 'react-article-components';
import AtomicBlockRendererMixin from '../mixins/atomic-block-renderer-mixin';
import YoutubeEditingBlock from './youtube-editing-block';
import React from 'react';

export default class YoutubeBlock extends AtomicBlockRendererMixin(React.Component) {
	constructor (props) {
		super(props);
		this.handleEditingBlockChange = this._handleEditingBlockChange.bind(this);
	}

	_handleEditingBlockChange (value) {
		this.onValueChange(value);
		this.toggleEditMode();
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
				onClick={this.toggleEditMode}
				style={{ cursor: 'pointer' }}
			>
				<AlignedYoutube
					{...this.state.data}
				/>
				{EditBlock}
			</div>
		);
	}
};
