import { Entity } from 'draft-js';
import CONSTANT from '../CONSTANT';
import React from 'react';

const styles = {
    link: {
        color: '#3b5998',
        textDecoration: 'underline',
    }
};

const Image = (props) => {
    const {url} = Entity.get(props.entityKey).getData();
    return (
        <img src={url} style={{width:"600px"}}/>
    );
};

function findImageEntities(contentBlock, callback) {
    contentBlock.findEntityRanges(
        (character) => {
            const entityKey = character.getEntity();
            return (
                entityKey !== null &&
                    Entity.get(entityKey).getType() === CONSTANT.image
            );
        },
        callback
    );
}

export default { strategy: findImageEntities, component: Image };
