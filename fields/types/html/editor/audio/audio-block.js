'use strict';
import { Audio } from '@twreporter/react-article-components/dist/components/article/index';
import AtomicBlockRendererMixin from '../mixins/atomic-block-renderer-mixin';
import React from 'react';

export default class AudioBlock extends AtomicBlockRendererMixin(React.Component) {
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
				<Audio
					{...this.state.data}
					device={this.props.device}
				/>
			</div>
		);
	}
};
