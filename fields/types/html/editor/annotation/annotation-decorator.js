'use strict';
import { Entity } from 'draft-js';
import ENTITY from '../entities';
import React from 'react';
import classNames from 'classnames';
class Annotation extends React.Component {
	constructor (props) {
		super(props);
		this.state = {
			isExpanded: false,
		};
		this.handleExpand = this._handleExpand.bind(this);
	}

	_handleExpand (e) {
		e.stopPropagation();
		this.setState({
			isExpanded: !this.state.isExpanded,
		});
	}

	render () {
		const { annotation, pureAnnotationText } = Entity.get(this.props.entityKey).getData();
		return (
			<abbr
				className="annotation"
				title={pureAnnotationText}
				style={{ cursor: 'pointer', borderBottom: 0 }}
			>
				<span
					onClick={this.handleExpand}
					style={{ color: 'red' }}
				>
					{this.props.children}
					<span className={classNames(this.state.isExpanded ? 'up' : '', 'indicator')}/>
				</span>
				<span
					className="annotation-html"
					dangerouslySetInnerHTML={{ __html: annotation }}
					style={{
						display: this.state.isExpanded ? 'block' : 'none',
						backgroundColor: 'white',
						padding: '16px',
						fontSize: '15px',
						lineHeight: 1.5,
					}}
				/>
			</abbr>
		);
	}

}

function findAnnotationEntities (contentBlock, callback) {
	contentBlock.findEntityRanges(
		(character) => {
			const entityKey = character.getEntity();
			if (entityKey !== null) {
				let type = Entity.get(entityKey).getType();
				type = type && type.toUpperCase();
				return type === ENTITY.ANNOTATION.type;
			}
			return false;
		},
		callback
	);
}

export default { strategy: findAnnotationEntities, component: Annotation };
