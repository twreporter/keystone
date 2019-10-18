'use strict';
import { Entity } from 'draft-js';
import React, { Component } from 'react';
import get from 'lodash/get';

const _ = {
  get,
}

const getDisplayName = (WrappedComponent) => (
	WrappedComponent.displayName || WrappedComponent.name || 'Component'
);

// Export
export default function WrapComponent (WrappedComponent) {
	class Wrapper extends Component {
		constructor (props) {
			super(props);

			const entityKey = this.props.block.getEntityAt(0);
			let alignment;
			if (entityKey) {
				alignment = _.get(Entity.get(entityKey).get('data'), 'alignment', 'center');
			}
			this.state = {
				alignment: alignment,
			};
			this.align = this._align.bind(this);
		}

		_align (alignment) {
			const entityKey = this.props.block.getEntityAt(0);
			if (entityKey) {
				Entity.mergeData(entityKey, { alignment });
				this.setState({ alignment });

				// Force refresh
				this.props.blockProps.refreshEditorState();
			}
		}

		render () {
			// let clearfix = this.state.alignment !== 'center' ? true : false;
			return (
				<div>
					<WrappedComponent {...this.props}
						align={this.align}
					/>
				</div>
			);
		}
	}
	Wrapper.displayName = `Decorated(${getDisplayName(WrappedComponent)})`;
	Wrapper.defaultProps = {
		readOnly: false,
	};

	return Wrapper;
}
