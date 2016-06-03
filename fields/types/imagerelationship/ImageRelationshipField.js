import { Button, FormInput, InputGroup, Pagination } from 'elemental';
import async from 'async';
import parseImageAPIResponse from '../../../lib/parseImageAPIResponse';
import qs from 'qs';
import xhr from 'xhr';
import Field from '../Field';
import ImageSelector from '../../../admin/client/components/ImageSelector';
import Lists from '../../../admin/client/stores/Lists';
import React from 'react';

const API = '/api/';

module.exports = Field.create({

    displayName: 'ImageRelationshipField',

    // cache images loaded
    _itemsCache: {},

	getInitialState () {
        // image ids joined as a string in the mongodb
        let ids = this.props.value;
        ids = ids ? ids.split(',') : [];
		return {
            error: null,
            ids: ids,
            isSelectionOpen: false,
            selectedImages: [],
		};
	},

    componentWillMount () {
        const _this = this;
        // load images according to their ids
        this.loadByIds(this.state.ids)
        .then((images) => {
            _this.setState({
                error: null,
                selectedImages: images,
            });
        }, (reason) => {
             _this.setState({
                error: reason
            });
        });
    },

	componentWillReceiveProps (nextProps) {
        const _this = this;
        let ids = nextProps.value;
        ids = ids ? ids.split(',') : [];

        this.loadByIds(ids)
        .then((images) => {
            _this.setState({
                error: null,
                selectedImages: images,
                ids: ids
            });
        }, (reason) => {
             _this.setState({
                error: reason
            });
        });
    },

    componentWillUnmount () {
        this._itemsCache = {};
    },

	cacheItem (item) {
		item.href = Keystone.adminPath + '/' + this.props.refList.path + '/' + item.id;
		this._itemsCache[item.id] = item;
    },

    /** load an image by id
     * @param {string} id - Object Id of image
     * @return {Promise}
     */
    loadById (id) {
        const _this = this;
        return new Promise(function(resolve, reject) {
            if (_this._itemsCache[id]) {
                return resolve(_this._itemsCache[id]);
            }
            xhr({
                url: Keystone.adminPath + API + _this.props.refList.path + '/' + id,
                responseType: 'json',
            }, (err, resp, result) => {
                if (err) {
                    return reject(err);
                }
                let image = parseImageAPIResponse(result);
                _this.cacheItem(image);
                resolve(image);
            });
        });
    },

    /** load images by ids
     * @param {string[]} ids - Object ids
     * @return {Promise}
     */
	loadByIds (ids) {
        const _this = this;
        let promises = ids.map((id) => {
            return _this.loadById(id);
        });

        return Promise.all(promises);
	},

    openSelection () {
        console.log('openSelection');
        this.setState({
            isSelectionOpen: true
        });
    },

    closeSelection () {
        this.setState({
            isSelectionOpen: false
        });
    },

    updateSelection (selectedImages) {
        let _ids = [];
        selectedImages = Array.isArray(selectedImages) ? selectedImages : [selectedImages];
        selectedImages.forEach(function(image) {
            _ids.push(image.id);
        });
        // update selected images by joining their ids
        this.props.onChange({
            path: this.props.path,
            value: _ids.join(',')
        });
        this.setState({
            selectedImages: selectedImages,
            ids: _ids
        });
    },

	renderSelect () {
        if (this.state.error) {
            return (
                <span>There is an error, please reload the page. {this.state.error}</span>
            );
        }

        const { many } = this.props;
        const { isSelectionOpen, selectedImages } = this.state;

        let btValue;
        let imageNode;
        if (many) {
            // #TODO show many photos
        } else {
            btValue = selectedImages[0] ? 'Change Photo' : 'Select Photo';
            imageNode = selectedImages[0] ? (
                <span>
                    <img src={ selectedImages[0].src } width="150" />
                    <FormInput ref="imageInput"  id={selectedImages[0].id} name={this.props.path} value={selectedImages[0].id} type="hidden" />
                </span>
            ): null;
        }
        return (
            <div>
                <ImageSelector
                    isSelectionOpen={isSelectionOpen}
                    selectedImages={selectedImages}
                    onChange={this.updateSelection}
                    apiPath={this.props.refList.path}
                    onFinish={this.closeSelection}
                />
                {imageNode}
                <Button onClick={this.openSelection}>
                    {btValue}
                </Button>
            </div>
        );
    },

	renderValue () {
		return this.renderSelect(true);
	},

    renderField () {
        return this.renderSelect();
	},

});
