var React = require('react');
var get = require('lodash/get');

const _ = {
  get,
}

var GcsImageColumn = React.createClass({
  render: function () {
    var value = this.props.data.fields[this.props.col.path] || {};
    const thumbnail = _.get(value, ['resizedTargets', 'mobile', 'url']);
    const gcsDir = _.get(value, 'gcsDir', '');
    const gcsBucket = _.get(value, 'gcsBucket', '');
    const filename = _.get(value, 'filename', '');
    const location = gcsDir ? `gs://${gcsBucket}/${gcsDir}/${filename}` : `gs://${gcsBucket}/${filename}`;

    const displayJsx = thumbnail ? (
      <a href={thumbnail} target="_blank">
        <img src={thumbnail} height="150" width="150" />
      </a>
    ) : (
      <p>
        {location}
      </p>
    )

    return (
      <td className="ItemList__col">
        <div className="ItemList__value ItemList__value--gcs-image">
          {displayJsx}
        </div>
      </td>
    );
  },
});

module.exports = GcsImageColumn;
