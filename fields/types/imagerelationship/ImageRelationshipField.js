import async from 'async';
import qs from 'qs';
import xhr from 'xhr';
import Lists from '../../../admin/client/stores/Lists';
import Field from '../Field';
import React from 'react';
import { Button, FormInput, InputGroup, Pagination } from 'elemental';
import ImagesSelection from '../../../admin/client/components/ImagesSelection';

const PAGE_SIZE = 1;
const PAGINATION_LIMIT = 5;
const API = '/api/';

module.exports = Field.create({

    displayName: 'ImageRelationshipField',

    // cache images loaded
    _itemsCache: {},

    // tag input in the tag field
    _tagInput: '',

	getInitialState () {
        // image ids joined as a string in the mongodb
        let ids = this.props.value;
        ids = ids ? ids.split(',') : [];
		return {
            error: null,
            ids: ids,
            images: [],
            totalImages: 0,
            currentPage: 1,
            isSelectionOpen: false,
            selectedImages: [],
            tagFilter: ''
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

    /** build query string for keystone api
     * @param {string} [tag=] - Tag input
     * @param {number} [page=0] - Page we used to calculate how many items we want to skip
     * @param {limit} [limit=10] - The number of items we want to get
     * @return {Promise}
     */
    buildQueryString (tag='', page=0, limit=10) {
        const _this = this;
        if (tag) {
            return this.loadTagIds(tag)
            .then((ids) => {
                return _this.buildTagFilters(ids, _this.state.currentPage, PAGE_SIZE);
            });
        }
        return Promise.resolve(qs.stringify({
            limit: limit,
            skip: page === 0 ? 0 : (page - 1) * limit
        }));
    },

    /** build query string filtered by tag ids for keystone api
     * @param {string[]} [tagIds=[]] - Tag ids
     * @param {number} [page=0] - Page we used to calculate how many items we want to skip
     * @param {limit} [limit=10] - The number of items we want to get
     * @return {string} a query string
     */
    buildTagFilters (tagIds=[], page=0, limit=10) {
        let filters = {
            tags: {
                value: tagIds
            }
        };
        let queryString = {
            filters: JSON.stringify(filters),
            select: 'image',
            limit: limit,
            skip: page === 0 ? 0 : (page-1) * limit
        };
        return qs.stringify(queryString);
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
                const image =  Object.assign({}, result.fields.image, {id: result.id});
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

    /** load images from keystone api
     * @param {string} [queryString=] - Query string for keystone api
     * @return {Promise}
     */
	loadImages (queryString = '') {
        const _this = this;

        return new Promise((resolve, reject) => {
            xhr({
                url: Keystone.adminPath + API + _this.props.refList.path + '?' + queryString,
                responseType: 'json',
            }, (err, resp, data) => {
                if (err) {
                    console.error('Error loading items:', err);
                    return reject(err);
                }
                this.state.totalImages = data.count;
                resolve(data.results.map(function(result) {
                    const image =  Object.assign({}, result.fields.image, {id: result.id});
                    // _this.cacheItem(image);
                    return image;
                }));
            });
        });
	},

    /** load Object ids according to tag string from keystone api
     * @param {string} tag - Tag string
     * @return {Promise}
     */
    loadTagIds (tag) {
        return new Promise((resolve, reject) => {
            xhr({
                url: Keystone.adminPath + API + 'tags?basic&search=' + tag,
                responseType: 'json',
            }, (err, resp, data) => {
                if (err) {
                    console.error('Error loading tag ids: ', err);
                    return reject(err);
                }
                resolve(data.results.map(function(result) {
                    return result.id;
                }));
            });
        });
    },

    handlePageSelect (selectedPage) {
        const _this = this;
        this.buildQueryString(this.state.tagFilter, selectedPage, PAGE_SIZE)
        .then((queryString) => {
            return _this.loadImages(queryString)
        })
        .then((images) => {
            this.setState({
                images: images,
                currentPage: selectedPage
            });
        }, (reason) => {
            this.setState({
                error: reason
            });
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

	toggleSelect (visible) {
		this.setState({
            error: null,
            images: [],
            totalImages: 0,
            currentPage: 1,
            isSelectionOpen: visible,
            tagFilter: ''
		});
    },

    openImagesSelection () {
        const _this = this;
        this.buildQueryString('', this.state.currentPage - 1, PAGE_SIZE)
        .then((queryString) => {
            return _this.loadImages(queryString);
        })
        .then(function(images) {
            _this.setState({
                images: images,
                isSelectionOpen: true
            });
        }, function(reason) {
            console.log(reason);
            _this.setState({
                error: reason
            });
        });
    },

    tagFilterChange (event) {
        this._tagInput = event.currentTarget.value;
    },

    searchByTag () {
        const _this = this;
        this.state.currentPage = 1;
        let tag = this.state.tagFilter = this._tagInput;
        this.buildQueryString(tag, this.state.currentPage - 1, PAGE_SIZE)
        .then((queryString) => {
            return _this.loadImages(queryString);
        })
        .then((images) => {
            _this.setState({
                images: images
            })
        }, (reason) => {
            _this.setState({
                error: reason
            });
        });
    },

    renderTagFilter () {
        return (
            <InputGroup contiguous>
            <InputGroup.Section grow>
                    <FormInput type="text" placeholder="Input tag" onChange={this.tagFilterChange}/>
                </InputGroup.Section>
                <InputGroup.Section>
                    <Button onClick={this.searchByTag}>Filter</Button>
                </InputGroup.Section>
            </InputGroup>
        );
    },

	renderSelect () {
        if (this.state.error) {
            return (
                <span>There is an error, please reload the page</span>
            );
        }

        const { many } = this.props;
        const { isSelectionOpen, images, selectedImages } = this.state;
        if ( isSelectionOpen && images.length > 0) {
            return (
                <ImagesSelection
                    images={images}
                    modalIsOpen={isSelectionOpen}
                    onCancel={this.toggleSelect.bind(this, false)}
                    updateSelection={this.updateSelection}
                >
                    {this.renderTagFilter()}
                    <Pagination
                        currentPage={this.state.currentPage}
                        onPageSelect={this.handlePageSelect}
                        pageSize={PAGE_SIZE}
                        total={this.state.totalImages}
                        limit={PAGINATION_LIMIT}
                    />
                </ImagesSelection>
            );
        }

        let btValue;
        let imageNode;
        if (many) {
            // #TODO show many photos
        } else {
            btValue = selectedImages[0] ? 'Change Photo' : 'Select Photo';
            imageNode = selectedImages[0] ? (
                <span>
                    <img src={ selectedImages[0].url } width="150" />
                    <FormInput ref="imageInput" onChange={this.updateSelection} id={selectedImages[0].id} name={this.props.path} value={selectedImages[0].id} type="hidden" />
                </span>
            ): null;
        }
        return (
            <div>
                {imageNode}
                <Button onClick={() => { this.openImagesSelection() }}>
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
