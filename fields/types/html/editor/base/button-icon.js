'use strict';
import React from 'react';

class EntityStyleButton extends React.Component {
	constructor (props) {
		super(props);
		this.state = {
			active: props.active,
		};
	}

	componentWillReceiveProps (nextProps) {
		this.setState({
			active: nextProps.active,
		});
	}

	render () {
		const { active } = this.state;
		// let className = 'RichEditor-styleButton Button Button--link';
		let className = '';
		if (active) {
			className += ' RichEditor-activeButton';
		}

		return (
			<span
				type="default"
				className={className}
				data-tooltip={this.props.label}>
				<i className={'fa ' + this.props.icon}></i>
				<span>{this.props.iconText}</span>
			</span>
		);
	}
}

EntityStyleButton.propTypes = {
	active: React.PropTypes.bool,
	iconText: React.PropTypes.string,
	label: React.PropTypes.string,
};

EntityStyleButton.defaultProps = {
	active: false,
	iconText: '',
	label: 'base',
};

export default EntityStyleButton;
