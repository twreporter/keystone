'use strict';

import { Slideshow } from '@twreporter/react-article-components/dist/components/article/index';
import ENTITY from '../entities';
import AtomicBlockRendererMixin from '../mixins/atomic-block-renderer-mixin';
import EditingBt from '../base/editing-bt';
import ImageSelector from '../../../../../admin/client/components/ImageSelector';
import React from 'react';
import get from 'lodash/get';

const _ = {
  get,
}

export default class SlideshowBlock extends AtomicBlockRendererMixin(React.Component) {
	constructor (props) {
		super(props);
	}

	_renderImageSelector (props) {
		return (
			<ImageSelector {...props}/>
		);
	}

	render () {
		if (!this.state.data) {
			return null;
		}

		let images = _.get(this.state.data, 'content', []);

		const EditBlock = this.state.editMode ? this._renderImageSelector({
			apiPath: 'images',
			isSelectionOpen: true,
			onChange: this.onValueChange,
			onFinish: this.toggleEditMode,
			selectedImages: images,
			selectionLimit: ENTITY.SLIDESHOW.slideshowSelectionLimit,
		}) : null;

		return (
			<div
				contentEditable={false}
				className="slideshow-container"
				style={{
					position: 'relative',
				}}
			>
				<Slideshow
					{...this.state.data}
					device={this.props.device}
				/>
				<EditingBt
					onClick={this.toggleEditMode}
				/>
				{EditBlock}
			</div>
		);
	}
}
