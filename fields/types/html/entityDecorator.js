'use strict';

import React from 'react';
import { CompositeDecorator, Entity } from 'draft-js';
import CONSTANT from './CONSTANT';

const styles = {
    link: {
        color: '#3b5998',
        textDecoration: 'underline',
    }
};

const Link = (props) => {
    const {url} = Entity.get(props.entityKey).getData();
    return (
        <a href={url} style={styles.link}>
            {props.children}
        </a>
    );
};

function findLinkEntities(contentBlock, callback) {
    contentBlock.findEntityRanges(
        (character) => {
            const entityKey = character.getEntity();
            return (
                entityKey !== null &&
                    Entity.get(entityKey).getType() === CONSTANT.link
            );
        },
        callback
    );
}

const decorator = new CompositeDecorator([{
    strategy: findLinkEntities,
    component: Link
}]);

export default decorator;
