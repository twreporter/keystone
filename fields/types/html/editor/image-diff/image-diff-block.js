'use strict';
import { AlignedImageDiff } from 'react-article-components';
import AtomicBlockRendererMixin from '../mixins/atomic-block-renderer-mixin';
import React from 'react';

export default class ImageDiffBlock extends AtomicBlockRendererMixin(React.Component) {
	constructor (props) {
		super(props);
	}

	render () {
		if (!this.state.data) {
			return null;
		}

		return (
			<div
				contentEditable={false}
			>
				<AlignedImageDiff
					{...this.state.data}
				>
					{this.props.children}
				</AlignedImageDiff>
			</div>
		);
	}
}
