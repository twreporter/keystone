'use strict';

import { Entity } from 'draft-js';
import Alignment from './BlockAlignmentWrapper';
import CONSTANT from '../CONSTANT';
import ImageBlock from '../image/ImageBlock';
import ImageDiffBlock from '../image-diff/ImageDiffBlock';
import React from 'react';
import SlideshowBlock from '../slideshow/SlideshowBlock';

class MediaBlock extends React.Component {
    constructor(props) {
        super(props);
        this.alignLeft = this._alignLeft.bind(this);
        this.alignCenter = this._alignCenter.bind(this);
        this.alignRight = this._alignRight.bind(this);
    }

    _alignLeft() {
        this.props.align('left');
    }

    _alignCenter() {
        this.props.align('center');
    }

    _alignRight() {
        this.props.align('right');
    }

    render() {
        const entityKey = this.props.block.getEntityAt(0);
        const entity =  entityKey ? Entity.get(entityKey).getData(): null;

        if (!entity) {
            return;
        }
        const buttons = [
            <span className="alignmentButton"
                onClick={this.alignLeft}
                style={{ marginLeft: '-2.4em' }}
                role="button" key={'left'}
                >
                L
            </span>,
            <span className="alignmentButton"
                onClick={this.alignCenter}
                role="button" key={'center'}
                >
                C
            </span>,
            <span className="alignmentButton"
                onClick={this.alignRight}
                style={{ marginLeft: '0.9em' }}
                role="button" key={'right'}
                >
                R
            </span>,
        ];

        const type = entity.type;
        const { alignment } = this.props;
        let className = alignment;
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
                className={className}
                >
                {buttons}
            </BlockComponent>
        );
    }
}

export default Alignment(MediaBlock);
