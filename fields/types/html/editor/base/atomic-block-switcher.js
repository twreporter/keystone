'use strict';

import AudioBlock from '../audio/audio-block';
import BlockQuoteBlock from '../quote/block-quote-block';
import ENTITY from '../entities';
import EmbeddedCodeBlock from '../embedded-code/embedded-code-block';
import ImageBlock from '../image/image-block';
import ImageDiffBlock from '../image-diff/image-diff-block';
import ImageLinkBlock from '../image-link/image-link-block';
import InfoBoxBlock from '../info-box/info-box-block';
import React from 'react';
import SlideshowBlock from '../slideshow/slideshow-block';
import Wrapper from './block-wrapper';
import YoutubeBlock from '../youtube/youtube-block';
import classNames from 'classnames';
import get from 'lodash/get';
import { Entity } from 'draft-js';
import { mobileStyle, tabletMinStyle, tabletMaxStyle } from '../constants/layout-style';

const _ = {
  get,
}

class AtomicBlockSwitcher extends React.Component {
	constructor (props) {
		super(props);
		this.alignLeft = this._alignLeft.bind(this);
		this.alignCenter = this._alignCenter.bind(this);
		this.alignRight = this._alignRight.bind(this);
        this.alignCenterSmall = this._alignCenterSmall.bind(this);
	}

	_alignLeft (e) {
		e.stopPropagation();
		this.props.align('left');
	}

	_alignCenter (e) {
		e.stopPropagation();
		this.props.align('center');
	}

	_alignRight (e) {
		e.stopPropagation();
		this.props.align('right');
	}

    _alignCenterSmall (e) {
        e.stopPropagation()
        this.props.align('center-small')
    }

	render () {
		const entityKey = this.props.block.getEntityAt(0);
		let type = entityKey ? Entity.get(entityKey).getType() : '';
		// backward compatible. Old data type is lower case
		type = type && type.toUpperCase();

		const Buttons = (
			<div style={{ textAlign: 'center' }}>
				<span className="alignmentButton"
					onClick={this.alignLeft}
					style={{ marginLeft: '-2.4em' }}
					role="button" key="left"
				>
					L
				</span>
				<span className="alignmentButton"
					onClick={this.alignCenter}
					role="button" key="center"
				>
					C
				</span>
				<span className="alignmentButton"
					onClick={this.alignRight}
					style={{ marginLeft: '0.9em' }}
					role="button" key="right"
				>
					R
				</span>
				<span className="alignmentButton"
					onClick={this.alignCenterSmall}
					style={{ marginLeft: '2.6em' }}
					role="button" key="center-small"
				>
					S
				</span>
			</div>
		);

		const device = _.get(this.props, ['blockProps', 'device'], 'mobile');
		let BlockComponent;
		let style;


		switch (type) {
			case ENTITY.AUDIO.type:
				BlockComponent = AudioBlock;
				if (device === 'mobile') {
					style = mobileStyle;
				} else {
					style = tabletMinStyle;
				}
				break;
			case ENTITY.BLOCKQUOTE.type:
				BlockComponent = BlockQuoteBlock;
				if (device === 'mobile') {
					style = mobileStyle;
				} else {
					style = tabletMinStyle;
				}
				break;
			case ENTITY.EMBEDDEDCODE.type:
				BlockComponent = EmbeddedCodeBlock;
				if (device === 'mobile') {
					style = mobileStyle;
				} else {
					style = tabletMinStyle;
				}
				break;
			case ENTITY.INFOBOX.type:
				BlockComponent = InfoBoxBlock;
				if (device === 'mobile') {
					style = mobileStyle;
				} else {
					style = tabletMinStyle;
				}
				break;
			case ENTITY.IMAGE.type:
				BlockComponent = ImageBlock;
				if (device === 'mobile') {
					style = mobileStyle;
				} else {
					style = tabletMaxStyle;
				}
				break;
			case ENTITY.IMAGELINK.type:
				BlockComponent = ImageLinkBlock;
				if (device === 'mobile') {
					style = mobileStyle;
				} else {
					style = tabletMaxStyle;
				}
				break;
			case ENTITY.SLIDESHOW.type:
				BlockComponent = SlideshowBlock;
				if (device === 'mobile') {
					style = mobileStyle;
				} else {
					style = tabletMaxStyle;
				}
				break;
			case ENTITY.IMAGEDIFF.type:
				BlockComponent = ImageDiffBlock;
				if (device === 'mobile') {
					style = mobileStyle;
				} else {
					style = tabletMaxStyle;
				}
				break;
			case ENTITY.YOUTUBE.type:
				BlockComponent = YoutubeBlock;
				if (device === 'mobile') {
					style = mobileStyle;
				} else {
					style = tabletMaxStyle;
				}
				break;
			default:
				return null;
		}
		if (!BlockComponent) {
			return null;
		}

		return (
			<div className={classNames('center-block')} style={style}>
				<BlockComponent
					{...this.props}
					device={device}
				>
				{device !== 'mobile' ? Buttons : null}
				</BlockComponent>
			</div>
		);
	}
}

export default Wrapper(AtomicBlockSwitcher);
