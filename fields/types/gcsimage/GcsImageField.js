import Field from '../Field';
import React from 'react';
import ReactDOM from 'react-dom';
import get from 'lodash/get';
import keys from 'lodash/keys';
import replaceGCSUrlOrigin from '../../utils/replace-gcs-url-origin';
import { Button, FormField, FormInput, FormNote } from 'elemental';

const _ = {
  get,
  keys,
};

const supportTypes = ['image/gif', 'image/png', 'image/jpeg', 'image/x-tiff', 'image/svg+xml', 'image/bmp'];

module.exports = Field.create({

  displayName: 'GcsImageField',

  getThumbnail() {
    return _.get(this.props, 'value.resizedTargets.mobile.url', '');
  },

  getLocation() {
    const gcsBucket = _.get(this.props, 'value.gcsBucket', '');
    const gcsDir = _.get(this.props, 'value.gcsDir', '');
    const filename = _.get(this.props, 'value.filename', '');

    if (gcsBucket && gcsDir && filename) {
      if (typeof gcsDir === 'string' && gcsDir.endsWith('/')) {
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
  hasLocal() {
    return this.state.origin === 'local';
  },

  hasImage() {
    return this.getLocation() || this.hasLocal();
  },

  getImageSource() {
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
  renderImagePreview() {
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
  renderImageDetails() {
    if (this.getLocation()) {
      const iptc = _.get(this.props, 'value.iptc', {});
      let createdTime = _.get(iptc, 'created_time', '');
      if (typeof createdTime === 'string' && createdTime !== '') {
        const hour = createdTime.slice(0, 2);
        const minute = createdTime.slice(2, 4);
        const second = createdTime.slice(4, 6);
        const timezone = createdTime.slice(6);
        createdTime = `${hour}:${minute}:${second}${timezone}`;
      }

      const resizedTargets = _.get(this.props, 'value.resizedTargets', {});
      const resizedJsx = _.keys(resizedTargets)
        .map(resolution => {
          const url = replaceGCSUrlOrigin(_.get(resizedTargets, [resolution, 'url'], ''));
          return (
            <p key={`${resolution}-img-url`}>{resolution}: {url}</p>
          );
        });

      return (
        <div key={this.props.path + '_details'} className="image-details">
          <div className="image-values">
            <FormInput noedit multiline>
              {
                resizedJsx ? (
                  <div>
                    <h6>壓縮大小後的照片位址</h6>
                    {resizedJsx}
                  </div>
                ) : null
              }
              <h6>長x寬</h6>
              <p>{this.props.value.width} x {this.props.value.height}</p>
              <h6>IPTC Core</h6>
              <p>描述: {iptc.caption}</p>
              <p>製作程式: {iptc.byline}</p>
              <p>關鍵字: {Array.isArray(iptc.keywords) ? iptc.keywords.join(';') : iptc.keywords}</p>
              <p>製作日期: {iptc.created_date} {createdTime}</p>
              <h6>原始照片檔案位址</h6>
              <p>{this.getLocation()}</p>
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

  fileFieldNode() {
    return ReactDOM.findDOMNode(this.refs.fileField);
  },

  changeImage() {
    this.fileFieldNode().click();
  },

  /**
   * Check support for input files on input change.
   */
  fileChanged(event) {
    var self = this;

    if (window.FileReader) {
      var files = event.target.files;
      Array.prototype.forEach.call(files, function(f) {
        if (supportTypes.indexOf(f.type) === -1) {
          alert(`系統不支援您上傳的檔案格式。系統支援的檔案格式為 GIF, PNG, JPG, TIFF, SVG, BMP。`);
          return false;
        }

        var fileReader = new FileReader();
        fileReader.onload = function(e) {
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


  renderImageToolbar() {
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

  renderNote() {
    const defaultNoteJsx = (
      <FormNote note="系統支援的圖片檔案格式為 GIF, PNG, JPG, TIFF, SVG, BMP。" />
    );
    if (!this.props.note) {
      return defaultNoteJsx;
    }
    return (
      <div>
        {defaultNoteJsx}
        <FormNote note={this.props.note} />
      </div>
    );
  },

  renderUI() {
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
        {this.renderNote()}
      </FormField>
    );
  },
});
