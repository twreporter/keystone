'use strict';
import { Button, FormInput, InputGroup } from 'elemental';
import qs from 'qs';
import xhr from 'xhr';
import React from 'react';


let SelectorMixin = (superclass) => class extends superclass {
	constructor (props) {
		super(props);

		// input in the search field
		this._searchInput = '';
		this.PAGE_SIZE = 6;
		this.API = '/api/';

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
			selectedItems: nextProps.selectedItems,
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
	 * @param {limit} [limit=6] - The number of items we want to get
	 * @param {string} [input=''] - keyword for filtering
	 * @return {Promise}
	 */
	_buildQueryString (page = 0, limit = 6, input = '') {
		let queryString = {
			search: input,
			limit: limit,
			skip: page === 0 ? 0 : (page - 1) * limit,
		};
		return Promise.resolve(qs.stringify(queryString));
	}

	/** build query string for keystone api
	 * @param {string[]} [filters=[]] - keywords for filtering
	 * @param {number} [page=0] - Page we used to calculate how many items we want to skip
	 * @param {limit} [limit=6] - The number of items we want to get
	 * @return {string} a query string
	 */
	_buildFilters (filters = [], page = 0, limit = 6) {
		let queryString = {
			limit: limit,
			skip: page === 0 ? 0 : (page - 1) * limit,
		};
		return qs.stringify(queryString);
	}

	/** load items from keystone api
	 * @param {string} [queryString=] - Query string for keystone api
	 * @return {Promise}
	 */
	loadItems (queryString = '') {
		return new Promise((resolve, reject) => {
			xhr({
				url: Keystone.adminPath + this.API + this.props.apiPath + '?' + queryString,
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
				return this.loadItems(queryString);
			})
		.then((items) => {
			this.setState({
				items: items,
				currentPage: selectedPage,
			});
		}, (reason) => {
			this.setState({
				error: reason,
			});
		});
	}

	_updateSelection (selectedItems) {
		this.setState({
			selectedItems: selectedItems,
		});
	}

	toggleSelect (visible) {
		this.setState({
			isSelectionOpen: visible,
		});
	}

	_getItems () {
		this._buildQueryString(this.state.currentPage, this.PAGE_SIZE)
			.then((queryString) => {
				return this.loadItems(queryString);
			})
			.then((items) => {
				this.setState({
					items: items,
				});
			}, (reason) => {
				console.warn(reason);
				this.setState({
					error: reason,
				});
			});
	}

	_searchFilterChange (event) {
		this._searchInput = event.currentTarget.value;
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
					currentPage: 1,
				});
			}, (reason) => {
				this.setState({
					error: reason,
				});
			});
	}

	_renderSearchFilter () {
		return (
			<InputGroup contiguous>
				<InputGroup.Section grow>
					<FormInput type="text" placeholder="請輸入關鍵字搜尋" defaultValue={this._searchInput} onChange={this.searchFilterChange}/>
				</InputGroup.Section>
				<InputGroup.Section>
					<Button onClick={this.searchByInput}>Search</Button>
				</InputGroup.Section>
			</InputGroup>
		);
	}
};

export default SelectorMixin;
