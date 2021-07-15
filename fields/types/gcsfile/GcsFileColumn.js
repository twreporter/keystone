var React = require('react');

var GcsFileColumn = React.createClass({
  render: function() {
    var value = this.props.data.fields[this.props.col.path];
    var isVal = value.url ? value.url : null;
    return (
      <td className="ItemList__col">
        <div className="ItemList__value ItemList__value--gcsfile"><a href={isVal} target="_blank">{isVal}</a></div>
      </td>
    );
  },
});

module.exports = GcsFileColumn;
