'use strict';

import _ from 'lodash';
import { AlignedEmbedded } from 'twreporter-react/lib/components/article/index';
import AtomicBlockRendererMixin from '../mixins/atomic-block-renderer-mixin';
import EditingBt from '../base/editing-bt';
import EmbeddedEditingBlock from './embedded-code-editing-block';
import React from 'react';

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
				className="embedded-container"
				style={{
					position: 'relative',
				}}
			>
				<AlignedEmbedded
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
