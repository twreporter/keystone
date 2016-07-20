'use strict';
import { AlignedImageDiff } from 'react-article-components';
import _ from 'lodash';
import AtomicBlockRendererMixin from '../mixins/atomic-block-renderer-mixin';
import ImageSelector from '../../../../../admin/client/components/ImageSelector';
import React from 'react';

export default class ImageDiffBlock extends AtomicBlockRendererMixin(React.Component) {
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

		const EditBt = (
			<i className="fa fa-pencil-square-o" onClick={this.toggleEditMode} style={{
				position: 'absolute',
				fontSize: '50px',
				top: 0,
				bottom: 0,
				left: 0,
				right: 0,
				width: '55px',
				height: '50px',
				margin: 'auto',
				backgroundColor: '#FFF',
				borderRadius: '5px',
				textAlign: 'center',
				cursor: 'pointer',
			}}/>
		);

		const EditBlock = this.state.editMode ? this._renderImageSelector({
			apiPath: 'images',
			isSelectionOpen: true,
			onChange: this.onValueChange,
			onFinish: this.toggleEditMode,
			selectedImages: images,
			selectionLimit: 2,
		}) : null;


		return (
			<div
				contentEditable={false}
				className="image-diff-container"
				style={{
					position: 'relative',
				}}
			>
				<AlignedImageDiff
					{...this.state.data}
				>
					{this.props.children}
				</AlignedImageDiff>
				{EditBt}
				{EditBlock}
			</div>
		);
	}
}
