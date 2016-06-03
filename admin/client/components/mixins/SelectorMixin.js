'use strict';
import { Button, FormInput, InputGroup, Modal, Pagination } from 'elemental';
import qs from 'qs';
import xhr from 'xhr';
import React from 'react';

const API = '/api/';

let SelectorMixin = (superclass) => class extends superclass {
    constructor(props) {
        super(props);

        // input in the search field
        this._searchInput = '';
        this.PAGE_SIZE = 10;

        this.state = {
            currentPage: 1,
            error: null,
            isSelectionOpen: props.isSelectionOpen,
            items: [],
            selectedItems: [],
            total: 0,
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
        this._getItems();
    }

    componentWillUnmount () {
        this._searchInput = '';
    }

    componentWillReceiveProps (nextProps) {
        this.setState({
            isSelectionOpen: nextProps.isSelectionOpen,
            selectedItems: nextProps.selectedItems
        });
    }

    _handleCancel () {
        this.toggleSelect(false);
        this.props.onFinish();
    }
    _handleSave () {
        this.toggleSelect(false);
        this.props.onChange(this.state.selectedItems);
        this.props.onFinish();
    }

    /** build query string for keystone api
     * @param {number} [page=0] - Page we used to calculate how many items we want to skip
     * @param {limit} [limit=10] - The number of items we want to get
     * @param {string[]} [filters=[]] - keywords for filtering
     * @return {Promise}
     */
    _buildQueryString (page=0, limit=10, filters=[]) {
        return Promise.resolve(this._buildFilters(filters, page, this.PAGE_SIZE));
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
	loadItems (queryString = '') {
        return new Promise((resolve, reject) => {
            xhr({
                url: Keystone.adminPath + API + this.props.apiPath + '?' + queryString,
                responseType: 'json',
            }, (err, resp, data) => {
                if (err) {
                    console.error('Error loading items:', err);
                    return reject(err);
                }
                this.state.total = data.count;
                resolve(data.results);
            });
        });
	}

    _handlePageSelect (selectedPage) {
        this._buildQueryString(selectedPage, this.PAGE_SIZE, this._searchInput)
        .then((queryString) => {
            return this.loadItems(queryString)
        })
        .then((items) => {
            this.setState({
                items: items,
                currentPage: selectedPage
            });
        }, (reason) => {
            this.setState({
                error: reason
            });
        });
    }

	_updateSelection (selectedItems) {
        this.setState({
            selectedItems: selectedItems
        });
	}

	toggleSelect (visible) {
		this.setState({
            isSelectionOpen: visible
		});
    }

    _getItems () {
        this._buildQueryString(this.state.currentPage, this.PAGE_SIZE)
        .then((queryString) => {
            return this.loadItems(queryString);
        })
        .then((items) => {
            this.setState({
                items: items
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
        this._buildQueryString(this.state.currentPage, this.PAGE_SIZE, this._searchInput)
        .then((queryString) => {
            return this.loadItems(queryString);
        })
        .then((items) => {
            this.setState({
                items: items,
                currentPage: 1
            })
        }, (reason) => {
            this.setState({
                error: reason
            });
        });
    }

    _renderSearchFilter () {
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
}

export default SelectorMixin;
