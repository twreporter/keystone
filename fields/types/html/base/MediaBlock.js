'use strict';

import { Entity } from 'draft-js';
import CONSTANT from '../CONSTANT';
import ImageBlock from '../image/ImageBlock';
import React from 'react';

export default class MediaBlock extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const entityKey = this.props.block.getEntityAt(0);
        const entity =  entityKey ? Entity.get(entityKey).getData(): null;

        if (!entity) {
            return;
        }

        const type = entity.type;
        let BlockComponent;

        switch (type) {
            case CONSTANT.image:
                BlockComponent = ImageBlock;
                break;
            default:
                return;
        }

        return (
            <BlockComponent
                {...this.props}
            />
        );
    }
}
