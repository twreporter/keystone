import React from 'react';
import { Entity } from 'draft-js';
import ENTITY from '../entities';

const styles = {
	link: {
		color: '#3b5998',
		textDecoration: 'underline',
	},
};

const Link = (props) => {
	const { url } = Entity.get(props.entityKey).getData();
	return (
		<a href={url} style={styles.link}>
			{props.children}
		</a>
	);
};

function findLinkEntities (contentBlock, callback) {
	contentBlock.findEntityRanges(
		(character) => {
			const entityKey = character.getEntity();
			if (entityKey !== null) {
				let type = Entity.get(entityKey).getType();
				type = type && type.toUpperCase();
				return type === ENTITY.LINK.type;
			}
			return false;
		},
		callback
	);
}

export default { strategy: findLinkEntities, component: Link };
