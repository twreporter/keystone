import { Entity } from 'draft-js';
import ENTITY from '../entities';
import React from 'react';
class Annotation extends React.Component {
	constructor (props) {
		super(props);
		this.state = {
			expanded: false,
		};
		this.handleExpand = this._handleExpand.bind(this);
	}

	_handleExpand (e) {
		this.setState({
			expanded: !this.state.expanded,
		});
	}

	render () {
		// TBD Use react-article-components to render annotation component
		const { annotation, pureAnnotationText, text } = Entity.get(this.props.entityKey).getData();
		return (
			<abbr title={pureAnnotationText} onClick={this.handleExpand}>
				<span>
					{text}
				</span>
				<span dangerouslySetInnerHTML={{ __html: annotation }} style={{
					display: this.state.expanded ? 'block' : 'none',
				}} />
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
