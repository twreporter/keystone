'use strict';
import { Button, FormInput, InputGroup, Modal, Pagination } from 'elemental';
import parseImageAPIResponse from '../../../lib/parseImageAPIResponse';
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

        // input in the search field
        this._searchInput = '';

        this.state = {
            currentPage: 1,
            error: null,
            images: [],
            totalImages: 0,
            isSelectionOpen: props.isSelectionOpen,
            selectedImages: props.selectedImages
        };

        // method binding
        this.searchFilterChange = this._searchFilterChange.bind(this);
        this.updateSelection = this._updateSelection.bind(this);
        this.handlePageSelect = this._handlePageSelect.bind(this);
        this.searchByInput = this._searchByInput.bind(this);
        this.handleCancel = this._handleCancel.bind(this);
        this.handleSave = this._handleSave.bind(this);
    }

    componentWillMount () {
        this.getImages();
    }

    componentWillUnmount () {
        this._searchInput = '';
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
     * @param {number} [page=0] - Page we used to calculate how many items we want to skip
     * @param {limit} [limit=10] - The number of items we want to get
     * @param {string[]} [filters=[]] - keywords for filtering
     * @return {Promise}
     */
    _buildQueryString (page=0, limit=10, filters=[]) {
        return Promise.resolve(this._buildFilters(filters, page, PAGE_SIZE));
    }

    /** build query string filtered by description for keystone api
     * @param {string[]} [filters=[]] - keywords for filtering
     * @param {number} [page=0] - Page we used to calculate how many items we want to skip
     * @param {limit} [limit=10] - The number of items we want to get
     * @return {string} a query string
     */
    _buildFilters (filters=[], page=0, limit=10) {
        let filterQuery = {
            description: {
                value: filters
            }
        };
        let queryString = {
            filters: JSON.stringify(filterQuery),
            select: 'image,description,keywords',
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
                    return parseImageAPIResponse(result);
                }));
            });
        });
	}

    _handlePageSelect (selectedPage) {
        this._buildQueryString(selectedPage, PAGE_SIZE, this._searchInput)
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
        this._buildQueryString(this.state.currentPage, PAGE_SIZE)
        .then((queryString) => {
            return this.loadImages(queryString);
        })
        .then((images) => {
            this.setState({
                images: images
            });
        }, (reason) => {
            console.warn(reason);
            this.setState({
                error: reason
            });
        });
    }

    _searchFilterChange (event) {
        let inputString = event.currentTarget.value;
        this._searchInput = inputString.split(',');
    }

    _searchByInput () {
        this.state.currentPage = 1;
        this._buildQueryString(this.state.currentPage, PAGE_SIZE, this._searchInput)
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
                    <FormInput type="text" placeholder="Input tag" defaultValue={this._searchInput} onChange={this.searchFilterChange}/>
                </InputGroup.Section>
                <InputGroup.Section>
                    <Button onClick={this.searchByInput}>Filter</Button>
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
