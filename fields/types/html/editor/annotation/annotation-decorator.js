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
		this.setState({
			isExpanded: !this.state.isExpanded,
		});
	}

	render () {
		const { annotation, pureAnnotationText, text } = Entity.get(this.props.entityKey).getData();
		return (
			<abbr
				className="annotation"
				title={pureAnnotationText}
				onClick={this.handleExpand}
				style={{ cursor: 'pointer', borderBottom: 0 }}
			>
				<span
					style={{ color: 'red' }}
				>
					{text}
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

function findLinkEntities (contentBlock, callback) {
	contentBlock.findEntityRanges(
		(character) => {
			const entityKey = character.getEntity();
			return (
				entityKey !== null
				&& Entity.get(entityKey).getType() === ENTITY.annotation.type
			);
		},
		callback
	);
}

export default { strategy: findLinkEntities, component: Annotation };
