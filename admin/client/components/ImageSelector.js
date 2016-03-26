'use strict';
import { Button, FormInput, InputGroup, Modal, Pagination } from 'elemental';
import qs from 'qs';
import xhr from 'xhr';
import ImagesSelection from '../../../admin/client/components/ImagesSelection';
import React from 'react';

const PAGE_SIZE = 3;
const PAGINATION_LIMIT = 5;
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
        this.buildQueryString = this._buildQueryString.bind(this);
        this.buildTagFilters = this._buildTagFilters.bind(this);
        this.loadImages = this._loadImages.bind(this);
        this.loadTagIds = this._loadTagIds.bind(this);
        this.handlePageSelect = this._handlePageSelect.bind(this);
        this.updateSelection = this._updateSelection.bind(this);
        this.searchByTag = this._searchByTag.bind(this);
        this.tagFilterChange = this._tagFilterChange.bind(this);
        this.toggleSelect = this._toggleSelect.bind(this);
        this.getImages = this._getImages.bind(this);
        this.renderTagFilter = this._renderTagFilter.bind(this);
        this.onCancel = () => {
            this.toggleSelect(false);
            props.onFinish();
        }
        this.onSave = () => {
            this.toggleSelect(false);
            props.onChange(this.state.selectedImages);
            props.onFinish();
        }
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

    /** build query string for keystone api
     * @param {string} [tag=] - Tag input
     * @param {number} [page=0] - Page we used to calculate how many items we want to skip
     * @param {limit} [limit=10] - The number of items we want to get
     * @return {Promise}
     */
    _buildQueryString (tag='', page=0, limit=10) {
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
    _buildTagFilters (tagIds=[], page=0, limit=10) {
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
	_loadImages (queryString = '') {

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
                    const image =  Object.assign({}, result.fields.image, {id: result.id});
                    return image;
                }));
            });
        });
	}

    /** load Object ids according to tag string from keystone api
     * @param {string} tag - Tag string
     * @return {Promise}
     */
    _loadTagIds (tag) {
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

	_toggleSelect (visible) {
		this.setState({
            isSelectionOpen: visible
		});
    }

    _getImages () {
        this.buildQueryString('', this.state.currentPage, PAGE_SIZE)
        .then((queryString) => {
            return this.loadImages(queryString);
        })
        .then(function(images) {
            this.setState({
                images: images
            });
        }, function(reason) {
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

    _renderTagFilter () {
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

        // const { many } = this.props;
        const { isSelectionOpen, images, selectedImages } = this.state;
        return (
            <Modal isOpen={isSelectionOpen} onCancel={this.onCancel} width="large" backdropClosesModal>
                <Modal.Header text="Select image" showCloseButton onClose={this.onCancel} />
                <Modal.Body>
                    <div style={{width: '50%'}}>
                        {this.renderTagFilter()}
                        <ImagesSelection
                            doSelectMany={this.props.doSelectMany}
                            images={images}
                            selectedImages={selectedImages}
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
                </Modal.Body>
                <Modal.Footer>
                    <Button type="primary" onClick={this.onSave}>Save</Button>
                    <Button type="link-cancel" onClick={this.onCancel}>Cancel</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

ImageSelector.propTypes = {
    apiPath: React.PropTypes.string,
    doSelectMany: React.PropTypes.bool,
    isSelectionOpen: React.PropTypes.bool,
    onChange: React.PropTypes.func.isRequired,
    onFinish: React.PropTypes.func.isRequired,
    selectedImages: React.PropTypes.array
};

ImageSelector.defaultProps = {
    apiPath: '',
    doSelectMany: false,
    isSelectionOpen: false,
    selectedImages: []
};

export default ImageSelector;
