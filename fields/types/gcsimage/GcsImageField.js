import Field from '../Field';
import React from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import get from 'lodash/get';
import { Button, FormField, FormInput, FormNote } from 'elemental';

const _ = {
  get,
};

// TODO (nick):
// Confirm image support type with photographers.
const supportTypes = ['image/gif', 'image/png', 'image/jpeg', 'image/x-tiff', 'image/svg+xml'];

module.exports = Field.create({

  displayName: 'GcsImageField',

  getThumbnail () {
    return _.get(this.props, 'value.resizedTargets.mobile.url', '');
  },

  getLocation () {
    const gcsBucket = _.get(this.props, 'value.gcsBucket', '');
    const gcsDir = _.get(this.props, 'value.gcsDir', '');
    const filename = _.get(this.props, 'value.filename', '');

    if (gcsBucket && gcsDir && filename) {
      if (typeof gcsDir === 'string' && gcsDir.slice(-1) === '/') {
        return `gs://${gcsBucket}/${gcsDir}${filename}`;
      }
      return `gs://${gcsBucket}/${gcsDir}/${filename}`;
    } else if (gcsBucket && filename) {
      return `gs://${gcsBucket}/${filename}`;
    }

    return '';
  },

  /**
   *  is this image uploaded from end user local workspace in this session?
   */
  hasLocal () {
    return this.state.origin === 'local';
  },

  hasImage () {
    return this.getLocation() || this.hasLocal();
  },

  getImageSource () {
    if (this.hasLocal()) {
      return this.state.localSource;
    } else if (this.getThumbnail()) {
      return this.getThumbnail();
    } else {
      return null;
    }
  },

  /**
   * Render an image preview
   */
  renderImagePreview () {
    const thumbnail = this.getImageSource();

    if (thumbnail) {
      return (
        <div className="image-preview">
          <a className="img-thumbnail" href={thumbnail} target="_blank">
            <img className="img-load" style={{ height: '90' }} src={thumbnail} alt="圖片無法載入，請稍後再試。"/>
          </a>
        </div>
      );
    }

    return null;
  },

  /**
   * Render image details
   */
  renderImageDetails () {
    if (this.getLocation()) {
      const iptc = _.get(this.props, 'value.iptc', {});
      let createdTime = _.get(iptc, 'created_time', '')
      if (typeof createdTime === 'string' && createdTime !== '') {
        const hour = createdTime.slice(0, 2);
        const minute = createdTime.slice(2, 4);
        const second = createdTime.slice(4, 6);

        if (hour < 12) {
          createdTime = `上午${hour}:${minute}:${second}`
        } else {
          createdTime = `下午${hour}:${minute}:${second}`
        }
      }

      return (
        <div key={this.props.path + '_details'} className="image-details">
          <div className="image-values">
            <FormInput noedit multiline>
              <h6>檔案位址</h6>
              <p>{this.getLocation()}</p>
              <h6>長寬比</h6>
              <p>{this.props.value.width} x {this.props.value.height}</p>
              <h6>IPTC Core</h6>
              <p>描述: {iptc.caption}</p>
              <p>製作程式: {iptc.byline}</p>
              <p>關鍵字: {Array.isArray(iptc.keywords) ? iptc.keywords.join(';') : iptc.keywords}</p>
              <p>製作日期: {iptc.created_date} {createdTime}</p>
            </FormInput>
          </div>
        </div>
      );
    } else if (this.hasLocal()) {
      return (
        <FormInput noedit>Image selected - save to upload</FormInput>
      );
    }

    return null;
  },

  fileFieldNode () {
    return ReactDOM.findDOMNode(this.refs.fileField);
  },

  changeImage () {
    this.fileFieldNode().click();
  },

  /**
   * Check support for input files on input change.
   */
  fileChanged (event) {
    var self = this;

    if (window.FileReader) {
      var files = event.target.files;
      Array.prototype.forEach.call(files, function (f) {
        if (supportTypes.indexOf(f.type) === -1) {
          self.removeImage();
          alert('Unsupported file type. Supported formats are: GIF, PNG, JPG, TIFF, SVG');
          return false;
        }

        var fileReader = new FileReader();
        fileReader.onload = function (e) {
          if (!self.isMounted()) return;
          self.setState({
            localSource: e.target.result,
            origin: 'local',
          });
        };
        fileReader.readAsDataURL(f);
      });
    } else {
      this.setState({
        origin: 'local',
      });
    }
  },


  renderImageToolbar () {
    return (
      <div key={this.props.path + '_toolbar'} className="image-toolbar">
        <div className="u-float-left">
          <Button onClick={this.changeImage}>
            Upload Image
          </Button>
        </div>
      </div>
    );
  },

  renderUI () {
    const fileLocation = this.getLocation();
    const fileInputJsx = fileLocation ? null : (
      <div>
        <input ref="fileField" type="file" name={this.props.paths.upload} className="field-upload" onChange={this.fileChanged} tabIndex="-1" />
        <input type="hidden" name={this.props.paths.action} className="field-action" value={this.state.action} />
      </div>
    );

    const toolbarJsx = fileLocation ? null : this.renderImageToolbar();

    const previewAndDetailJsx = (
      <div className="image-container">
        {this.renderImagePreview()}
        {this.renderImageDetails()}
      </div>
    );

    return (
      <FormField label={this.props.label} className="field-type-gcsimage">
        {fileInputJsx}
        {previewAndDetailJsx}
        {toolbarJsx}
      </FormField>
    );
  },
});
