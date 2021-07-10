var React = require('react');
var get = require('lodash/get');

const _ = {
  get,
};

var GcsImageColumn = React.createClass({
  render: function() {
    var value = this.props.data.fields[this.props.col.path] || {};
    const thumbnail = _.get(value, ['resizedTargets', 'mobile', 'url']);
    const gcsDir = _.get(value, 'gcsDir', '');
    const gcsBucket = _.get(value, 'gcsBucket', '');
    const filename = _.get(value, 'filename', '');
    let location = '';

    if (gcsBucket && gcsDir && filename) {
      if (typeof gcsDir === 'string' && gcsDir.endsWith('/')) {
        location = `gs://${gcsBucket}/${gcsDir}${filename}`;
      }
      location = `gs://${gcsBucket}/${gcsDir}/${filename}`;
    } else if (gcsBucket && filename) {
      location = `gs://${gcsBucket}/${filename}`;
    }

    const thumbnailJsx = thumbnail ? (
      <a href={thumbnail} target="_blank">
        <img src={thumbnail} height="100" width="100" style={{ objectFit: 'cover' }}/>
      </a>
    ) : (
      <p>
        {location}
      </p>
    );

    const iptc = _.get(value, ['iptc'], {});
    const { byline, caption, created_time } = iptc;

    let createdTime = created_time;
    if (typeof createdTime === 'string' && createdTime !== '') {
      const hour = createdTime.slice(0, 2);
      const minute = createdTime.slice(2, 4);
      const second = createdTime.slice(4, 6);
      const timezone = createdTime.slice(6);
      createdTime = `${hour}:${minute}:${second}${timezone}`;
    }

    return (
      <td className="ItemList__col">
        <div className="ItemList__value ItemList__value--gcsimage">
          <div>
            {thumbnailJsx}
          </div>
          <div>
            <p>描述：{caption}</p>
            <p>製作程式：{byline}</p>
            <p>關鍵字：{Array.isArray(iptc.keywords) ? iptc.keywords.join(';') : iptc.keywords}</p>
            <p>製作日期: {iptc.created_date} {createdTime}</p>
          </div>
        </div>
      </td>
    );
  },
});

module.exports = GcsImageColumn;
