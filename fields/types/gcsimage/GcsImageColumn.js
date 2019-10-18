var React = require('react');
var get = require('lodash/get');

const _ = {
  get,
}

var GcsImageColumn = React.createClass({
	render: function () {
		var value = this.props.data.fields[this.props.col.path] || {};
		var isVal = _.get(value, ['resizedTargets', 'mobile', 'url'], value.url);
		return (
			<td className="ItemList__col">
				<div className="ItemList__value ItemList__value--gcs-image"><a href={isVal} target="_blank"><img src={isVal} height="150" width="150"/></a></div>
			</td>
		);
	},
});

module.exports = GcsImageColumn;
