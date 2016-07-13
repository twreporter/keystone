import React from 'react';

import { SegmentedControl } from 'elemental';

var PasswordFilter = React.createClass({

	getInitialState () {
		return {
			checked: this.props.value || true,
		};
	},

	toggleChecked (checked) {
		this.setState({
			checked: checked,
		});
	},

	renderToggle () {
		let options = [
			{ label: 'Is Set', value: true },
			{ label: 'Is NOT Set', value: false },
		];

		return <SegmentedControl equalWidthSegments options={options} value={this.state.checked} onChange={this.toggleChecked} />;
	},

	render () {
		return this.renderToggle();
	},

});

module.exports = PasswordFilter;
