/**
 * The following codes are modified from https://github.com/cezary/react-image-diff.git
 */

'use strict';

import React, { Component } from 'react';
import Rcslider from 'rc-slider';

const bgImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUAQMAAAC3R49OAAAABlBMVEX5+fn///8pDrwNAAAAFElEQVQI12NgsP/AQAz+f4CBGAwAJIIdTTn0+w0AAAAASUVORK5CYII=';

export default class ImagesDiff extends Component {
	constructor () {
		super();
		this.handleImgLoad = this.handleImgLoad.bind(this);
		this.handleValueChange = this.handleValueChange.bind(this);
	}

	componentWillMount () {
		this.setState({
			width: this.props.width,
			height: this.props.height,
		});
	}

	componentWillReceiveProps (nextProps) {
		this.setState({
			width: nextProps.width || this.state.width,
			height: nextProps.height || this.state.height,
		});
	}

	handleImgLoad (ref) {
		return () => {
			if (!this.props.height && !this.props.width) {
				let { height, width } = React.findDOMNode(this.refs[ref]);
				this.setState({
					height, width,
				});
			}
		};
	}

	handleValueChange (value) {
		this.setState({
			value: (value / 100).toFixed(2),
		});
	}

	renderSwipe () {
		let style = {
			backgroundImage: `url(${bgImage})`,
			height: this.state.height || this.props.heightPct,
			margin: 0,
			position: 'absolute',
			width: this.state.width || this.props.widthPct,
		};

		let beforeStyle = {
			border: '1px solid #f77',
			...style,
		};

		let afterStyle = {
			border: '1px solid #63c363',
			right: 0,
			...style,
		};

		let swiperStyle = {
			borderLeft: '1px solid #999',
			height: this.state.height || this.props.heightPct,
			margin: 0,
			overflow: 'hidden',
			position: 'absolute',
			right: -2,
			width: this.state.width ? this.state.width * (1 - this.state.value) : this.props.widthPct,
		};

		return (
			<div className="ImageDiff__inner--swipe" style={style}>
				<div className="ImageDiff__before" style={beforeStyle}>
					<img
						ref="before"
						src={this.props.before}
						height={this.state.height || this.props.heightPct}
						width={this.state.width || this.props.widthPct}
						onLoad={this.handleImgLoad('before')}
					/>
				</div>
				<div className="ImageDiff--swiper" style={swiperStyle}>
					<div className="ImageDiff__after" style={afterStyle}>
						<img
							ref="after"
							src={this.props.after}
							height={this.state.height || this.props.heightPct}
							width={this.state.width || this.props.widthPct}
							onLoad={this.handleImgLoad('after')}
						/>
					</div>
				</div>
				<div>
					<Rcslider
						tipTransitionName="rc-slider-tooltip-zoom-down"
						onChange={this.handleValueChange}
					/>
				</div>
			</div>
		);
	}

	render () {
		return (
			<div className="ImageDiff" style={{ height: this.state.height }}>
				{this.renderSwipe()}
			</div>
		);
	}
}

ImagesDiff.propTypes = {
	after: React.PropTypes.string.isRequired,
	before: React.PropTypes.string.isRequired,
	height: React.PropTypes.number,
	heightPct: React.PropTypes.string,
	value: React.PropTypes.number,
	width: React.PropTypes.number,
	widthPct: React.PropTypes.string,
};

ImagesDiff.defaultProps = {
	heightPct: 'auto',
	value: 0.5,
	widthPct: '100%',
};

