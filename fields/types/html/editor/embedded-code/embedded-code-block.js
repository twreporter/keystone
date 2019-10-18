'use strict';

import { AlignedEmbedded } from '@twreporter/react-article-components/dist/components/article/index';
import AtomicBlockRendererMixin from '../mixins/atomic-block-renderer-mixin';
import EditingBt from '../base/editing-bt';
import EmbeddedEditingBlock from './embedded-code-editing-block';
import React from 'react';
import get from 'lodash/get';
import merge from 'lodash/merge';

const _ = {
  get,
  merge,
}

export default class EmbeddedCodeBlock extends AtomicBlockRendererMixin(React.Component) {
	constructor (props) {
		super(props);
	}

	render () {
		if (!this.state.data) {
			return null;
		}

		let blockContent = _.get(this.state.data, ['content', 0], {});
		let embeddedCode = blockContent.embeddedCode;
		let description = blockContent.caption;
		let style = {};
		if (blockContent.height) {
			style.minHeight = blockContent.height;
		}
		if (blockContent.width) {
			style.width = blockContent.width;
		}

		const EditBlock = (
			<EmbeddedEditingBlock
				caption={description}
				embeddedCode={embeddedCode}
				label="embedded"
				isModalOpen={this.state.editMode}
				onToggle={this.handleEditingBlockChange}
				toggleModal={this.toggleEditMode}
			/>
		);

		return (
			<div
				contentEditable={false}
				className="embedded-container center-block"
				style={_.merge(style, {
					position: 'relative',
				})}
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
