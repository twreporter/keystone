import Field from '../Field';
import React from 'react';
import ReactDOM from 'react-dom';
import get from 'lodash/get';
import { Button, FormField, FormNote } from 'elemental';

const _ = {
  get,
};

const storageDefaults = {
  scheme: 'https',
  hostname: 'storage.googleapis.com',
};

const supportTypes = ['image/gif', 'image/png', 'image/jpeg', 'image/x-tiff', 'image/svg+xml', 'image/bmp'];

module.exports = Field.create({
  displayName: 'GcsAvatarField',
  getThumbnail() {
    const { scheme, hostname } = storageDefaults;
    const gcsBucket = _.get(this.props, 'value.gcsBucket', '');
    const gcsDir = _.get(this.props, 'value.gcsDir', '');
    const filename = _.get(this.props, 'value.filename', '');
    if (gcsBucket && gcsDir && filename) {
      return `${scheme}://${hostname}/${gcsBucket}/${gcsDir}${filename}`;
    }
  },
  /**
   *  is this image uploaded from end user local workspace in this session?
   */
  hasLocal() {
    return this.state.origin === 'local';
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
        <div>
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
    const fileInputJsx = (
      <div>
        <input ref="fileField" type="file" name={this.props.paths.upload} className="field-upload" onChange={this.fileChanged} tabIndex="-1" />
        <input type="hidden" name={this.props.paths.action} className="field-action" value={this.state.action} />
      </div>
    );

    const previewAndDetailJsx = (
      <div className="image-container">
        {this.renderImagePreview()}
      </div>
    );

    return (
      <FormField label={this.props.label} className="field-type-avatar">
        {fileInputJsx}
        {previewAndDetailJsx}
        {this.renderImageToolbar()}
        {this.renderNote()}
      </FormField>
    );
  },
});
