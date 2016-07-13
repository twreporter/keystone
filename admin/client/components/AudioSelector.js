'use strict';
import { parseAudioAPIResponse, parseImageAPIResponse } from '../../../lib/parseAPIResponse';
import { Button, Modal, Pagination } from 'elemental';
import _ from 'lodash';
import qs from 'qs';
import xhr from 'xhr';
import AudioSelection from './AudioSelection';
import SelectorMixin from './mixins/SelectorMixin';
import React from 'react';

const PAGINATION_LIMIT = 10;

class AudioSelector extends SelectorMixin(React.Component) {
	constructor (props) {
		super(props);
		this.state.selectedItems = props.selectedAudios;
	}

	componentWillReceiveProps (nextProps) {
		let props = {};
		_.merge(props, nextProps, { selectedItems: nextProps.selectedAudios });
		super.componentWillReceiveProps(props);
	}

	_loadImage (imageId) {
		return new Promise((resolve, reject) => {
			if (!imageId) {
				return reject(new Error('Should provide imageId'));
			}
			xhr({
				url: Keystone.adminPath + this.API + 'images/' + imageId,
				responseType: 'json',
			}, (err, resp, data) => {
				if (err) {
					console.error('Error loading item:', err);
					return reject(err);
				}
				resolve(parseImageAPIResponse(data));
			});
		});
	}

	_loadCoverPhotoForAudio (audio) {
		return new Promise((resolve, reject) => {
			let imageId = _.get(audio, ['fields', 'coverPhoto']);
			this._loadImage(imageId)
				.then((image) => {
					_.set(audio, ['fields', 'coverPhoto'], image);
					resolve(parseAudioAPIResponse(audio));
				}, (err) => {
					resolve(parseAudioAPIResponse(audio));
				});
		});
	}

	_loadCoverPhotoForAudios (audios) {
		return new Promise((resolve, reject) => {
			let promises = [];
			_.forEach(audios, (audio) => {
				promises.push(this._loadCoverPhotoForAudio(audio));
			});
			Promise.all(promises)
				.then((audios) => {
					resolve(audios);
				}, (err) => {
					reject(err);
				});
		});
	}

	loadItems (querystring = '') {
		return new Promise((resolve, reject) => {
			super.loadItems(querystring)
				.then((audios) => {
					this._loadCoverPhotoForAudios(audios)
						.then((audios) => {
							resolve(audios);
						});
				}).catch((err) => reject(err));
		});
	}

	/** build query string filtered by title for keystone api
	 * @override
	 * @param {string[]} [filters=[]] - keywords for filtering
	 * @param {number} [page=0] - Page we used to calculate how many items we want to skip
	 * @param {limit} [limit=10] - The number of items we want to get
	 * @return {string} a query string
	 */
	_buildFilters (filters = [], page = 0, limit = 10) {
		let filterQuery = {
			title: {
				value: filters,
			},
		};
		let queryString = {
			filters: JSON.stringify(filterQuery),
			select: 'audio,description,title,coverPhoto',
			limit: limit,
			skip: page === 0 ? 0 : (page - 1) * limit,
		};
		return qs.stringify(queryString);
	}

	render () {
		if (this.state.error) {
			return (
				<span>There is an error, please reload the page.{this.state.error}</span>
			);
		}

		const { isSelectionOpen, items, selectedItems } = this.state;
		return (
			<Modal isOpen={isSelectionOpen} onCancel={this.handleCancel} width="large" backdropClosesModal>
				<Modal.Header text="Select Audio" showCloseButton onClose={this.handleCancel} />
				<Modal.Body>
					<div>
						{this._renderSearchFilter()}
						<AudioSelection
							audios={items}
							selectedAudios={selectedItems}
							selectionLimit={this.props.selectionLimit}
							updateSelection={this.updateSelection}
						/>
						<Pagination
							currentPage={this.state.currentPage}
							onPageSelect={this.handlePageSelect}
							pageSize={this.PAGE_SIZE}
							total={this.state.total}
							limit={PAGINATION_LIMIT}
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

AudioSelector.propTypes = {
	apiPath: React.PropTypes.string,
	isSelectionOpen: React.PropTypes.bool,
	onChange: React.PropTypes.func.isRequired,
	onFinish: React.PropTypes.func.isRequired,
	selectedAudios: React.PropTypes.array,
	selectionLimit: React.PropTypes.number,
};

AudioSelector.defaultProps = {
	apiPath: '',
	isSelectionOpen: false,
	selectedAudios: [],
	selectionLimit: 1,
};

export default AudioSelector;
