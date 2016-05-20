'use strict';
import { Button, FormInput, InputGroup, Modal, Pagination } from 'elemental';
import _ from 'lodash';
import qs from 'qs';
import xhr from 'xhr';
import ImagesEditor from './ImagesEditor';
import ImagesSelection from './ImagesSelection';
import React from 'react';

const PAGE_SIZE = 10;
const PAGINATION_LIMIT = 10;
const API = '/api/';

class ImageSelector extends React.Component {
    constructor(props) {
        super(props);

        // tag input in the tag field
        this._tagInput = '';

        this.state = {
            currentPage: 1,
            error: null,
            images: [],
            totalImages: 0,
            isSelectionOpen: props.isSelectionOpen,
            selectedImages: props.selectedImages,
            tagFilter: ''
        };

        // method binding
        this.tagFilterChange = this._tagFilterChange.bind(this);
        this.updateSelection = this._updateSelection.bind(this);
        this.handlePageSelect = this._handlePageSelect.bind(this);
        this.searchByTag = this._searchByTag.bind(this);
        this.handleCancel = this._handleCancel.bind(this);
        this.handleSave = this._handleSave.bind(this);
    }

    componentWillMount () {
        this.getImages();
    }

    componentWillUnmount () {
        this._tagInput = '';
    }

    componentWillReceiveProps (nextProps) {
        this.setState({
            isSelectionOpen: nextProps.isSelectionOpen,
            selectedImages: nextProps.selectedImages
        });
    }

    _handleCancel () {
        this.toggleSelect(false);
        this.props.onFinish();
    }
    _handleSave () {
        this.toggleSelect(false);
        this.props.onChange(this.state.selectedImages);
        this.props.onFinish();
    }

    /** build query string for keystone api
     * @param {string} [tag=] - Tag input
     * @param {number} [page=0] - Page we used to calculate how many items we want to skip
     * @param {limit} [limit=10] - The number of items we want to get
     * @return {Promise}
     */
    buildQueryString (tag='', page=0, limit=10) {
        if (tag) {
            return this.loadTagIds(tag)
            .then((ids) => {
                return this.buildTagFilters(ids, page, PAGE_SIZE);
            });
        }
        return Promise.resolve(qs.stringify({
            limit: limit,
            skip: page === 0 ? 0 : (page - 1) * limit
        }));
    }

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
    }

    /** load images from keystone api
     * @param {string} [queryString=] - Query string for keystone api
     * @return {Promise}
     */
	loadImages (queryString = '') {
        return new Promise((resolve, reject) => {
            xhr({
                url: Keystone.adminPath + API + this.props.apiPath + '?' + queryString,
                responseType: 'json',
            }, (err, resp, data) => {
                if (err) {
                    console.error('Error loading items:', err);
                    return reject(err);
                }
                this.state.totalImages = data.count;
                resolve(data.results.map(function(result) {
                    let url = _.get(result, ['fields', 'image', 'url'], '');
                    if (url) {
                        // use suffix with mobile url
                        let matches = url.match(/^(http\:\/\/|https\:\/\/)(.*)\.(\w+?)$/)
                        if (matches) {
                            result.fields.image.url = matches[1] + matches[2] + '-mobile.' + matches[3];
                        }
                    }
                    const image = Object.assign({}, result.fields.image, {id: result.id});
                    return image;
                }));
            });
        });
	}

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
    }

    _handlePageSelect (selectedPage) {
        this.buildQueryString(this.state.tagFilter, selectedPage, PAGE_SIZE)
        .then((queryString) => {
            return this.loadImages(queryString)
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
    }

	_updateSelection (selectedImages) {
        this.setState({
            selectedImages: selectedImages
        });
	}

	toggleSelect (visible) {
		this.setState({
            isSelectionOpen: visible
		});
    }

    getImages () {
        this.buildQueryString('', this.state.currentPage, PAGE_SIZE)
        .then((queryString) => {
            return this.loadImages(queryString);
        })
        .then((images) => {
            this.setState({
                images: images
            });
        }, (reason) => {
            console.log(reason);
            this.setState({
                error: reason
            });
        });
    }

    _tagFilterChange (event) {
        this._tagInput = event.currentTarget.value;
    }

    _searchByTag () {
        this.state.currentPage = 1;
        let tag = this.state.tagFilter = this._tagInput;
        this.buildQueryString(tag, this.state.currentPage, PAGE_SIZE)
        .then((queryString) => {
            return this.loadImages(queryString);
        })
        .then((images) => {
            this.setState({
                images: images,
                currentPage: 1
            })
        }, (reason) => {
            this.setState({
                error: reason
            });
        });
    }

    renderTagFilter () {
        return (
            <InputGroup contiguous>
            <InputGroup.Section grow>
                    <FormInput type="text" placeholder="Input tag" defaultValue={this.state.tagFilter} onChange={this.tagFilterChange}/>
                </InputGroup.Section>
                <InputGroup.Section>
                    <Button onClick={this.searchByTag}>Filter</Button>
                </InputGroup.Section>
            </InputGroup>
        );
    }


	render () {
        if (this.state.error) {
            return (
                <span>There is an error, please reload the page.{this.state.error}</span>
            );
        }

        const { isSelectionOpen, images, selectedImages } = this.state;
        return (
            <Modal isOpen={isSelectionOpen} onCancel={this.handleCancel} width="large" backdropClosesModal>
                <Modal.Header text="Select image" showCloseButton onClose={this.handleCancel} />
                <Modal.Body>
                    <div>
                        {this.renderTagFilter()}
                        <ImagesSelection
                            images={images}
                            selectedImages={selectedImages}
                            selectionLimit={this.props.selectionLimit}
                            updateSelection={this.updateSelection}
                        />
                        <Pagination
                            currentPage={this.state.currentPage}
                            onPageSelect={this.handlePageSelect}
                            pageSize={PAGE_SIZE}
                            total={this.state.totalImages}
                            limit={PAGINATION_LIMIT}
                        />
                    </div>
                    <div>
                        <ImagesEditor
                            images={selectedImages}
                            onChange={this.updateSelection}
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button type="primary" onClick={this.handleSave}>Save</Button>
                    <Button type="link-cancel" onClick={this.handleCancel}>Cancel</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

ImageSelector.propTypes = {
    apiPath: React.PropTypes.string,
    isSelectionOpen: React.PropTypes.bool,
    onChange: React.PropTypes.func.isRequired,
    onFinish: React.PropTypes.func.isRequired,
    selectedImages: React.PropTypes.array,
    selectionLimit: React.PropTypes.number
};

ImageSelector.defaultProps = {
    apiPath: '',
    isSelectionOpen: false,
    selectedImages: [],
    selectionLimit: 1
};

export default ImageSelector;
