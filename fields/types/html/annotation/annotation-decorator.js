import React from 'react';
import { Entity } from 'draft-js';
import { ENTITY } from '../CONSTANT';

const Annotation = (props) => {
    const {text, annotation} = Entity.get(props.entityKey).getData();
    return (
        <div style={{color: "#3b5998"}}>
            {props.children}
        </div>
    );
};

function findAnnotationEntities(contentBlock, callback) {
    contentBlock.findEntityRanges(
        (character) => {
            const entityKey = character.getEntity();
            return (
                entityKey !== null &&
                    Entity.get(entityKey).getType() === ENTITY.annotation.type
            );
        },
        callback
    );
}

export default { strategy: findAnnotationEntities, component: Annotation };
