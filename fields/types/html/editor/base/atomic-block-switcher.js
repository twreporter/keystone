'use strict';

import { Entity } from 'draft-js';
import _ from 'lodash';
import ENTITY from '../entities';
import AudioBlock from '../audio/audio-block';
import BlockQuoteBlock from '../quote/block-quote-block';
import EmbeddedCodeBlock from '../embedded-code/embedded-code-block';
import ImageBlock from '../image/image-block';
import ImageDiffBlock from '../image-diff/image-diff-block';
import InfoBoxBlock from '../info-box/info-box-block';
import React from 'react';
import SlideshowBlock from '../slideshow/slideshow-block';
import YoutubeBlock from '../youtube/youtube-block';
import Wrapper from './block-wrapper';
import classNames from 'classnames';
import { mobileStyle, tabletMinStyle, tabletMaxStyle, tabletFullStyle } from '../constants/layout-style';

class AtomicBlockSwitcher extends React.Component {
	constructor (props) {
		super(props);
		this.alignLeft = this._alignLeft.bind(this);
		this.alignCenter = this._alignCenter.bind(this);
		this.alignRight = this._alignRight.bind(this);
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

	render () {
		const entityKey = this.props.block.getEntityAt(0);
		const type = entityKey ? Entity.get(entityKey).getType() : null;

		const Buttons = (
			<div style={{ textAlign: 'center' }}>
				<span className="alignmentButton"
					onClick={this.alignLeft}
					style={{ marginLeft: '-2.4em' }}
					role="button" key={'left'}
				>
					L
				</span>
				<span className="alignmentButton"
					onClick={this.alignCenter}
					role="button" key={'center'}
				>
					C
				</span>
				<span className="alignmentButton"
					onClick={this.alignRight}
					style={{ marginLeft: '0.9em' }}
					role="button" key={'right'}
				>
					R
				</span>
			</div>
		);

		const device = _.get(this.props, ['blockProps', 'device'], 'mobile');
		let BlockComponent;
		let style;


		switch (type) {
			case ENTITY.audio.type:
				BlockComponent = AudioBlock;
				if (device === 'mobile') {
					style = mobileStyle;
				} else {
					style = tabletMinStyle;
				}
				break;
			case ENTITY.blockQuote.type:
				BlockComponent = BlockQuoteBlock;
				if (device === 'mobile') {
					style = mobileStyle;
				} else {
					style = tabletMinStyle;
				}
				break;
			case ENTITY.embeddedCode.type:
				BlockComponent = EmbeddedCodeBlock;
				if (device === 'mobile') {
					style = mobileStyle;
				} else {
					style = tabletMinStyle;
				}
				break;
			case ENTITY.infobox.type:
				BlockComponent = InfoBoxBlock;
				if (device === 'mobile') {
					style = mobileStyle;
				} else {
					style = tabletMinStyle;
				}
				break;
			case ENTITY.image.type:
				BlockComponent = ImageBlock;
				if (device === 'mobile') {
					style = mobileStyle;
				} else {
					style = tabletMaxStyle;
				}
				break;
			case ENTITY.slideshow.type:
				BlockComponent = SlideshowBlock;
				if (device === 'mobile') {
					style = mobileStyle;
				} else {
					style = tabletMaxStyle;
				}
				break;
			case ENTITY.imageDiff.type:
				BlockComponent = ImageDiffBlock;
				if (device === 'mobile') {
					style = mobileStyle;
				} else {
					style = tabletMaxStyle;
				}
				break;
			case ENTITY.youtube.type:
				BlockComponent = YoutubeBlock;
				if (device === 'mobile') {
					style = mobileStyle;
				} else {
					style = tabletFullStyle;
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
