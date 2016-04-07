'use strict';

import { Entity } from 'draft-js';
import CONSTANT from '../CONSTANT';
import ImageBlock from '../image/ImageBlock';
import ImageDiffBlock from '../image-diff/ImageDiffBlock';
import React from 'react';
import SlideshowBlock from '../slideshow/SlideshowBlock';

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
            case CONSTANT.slideshow:
                BlockComponent = SlideshowBlock;
                break;
            case CONSTANT.imageDiff:
                BlockComponent = ImageDiffBlock;
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
