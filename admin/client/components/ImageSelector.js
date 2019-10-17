'use strict';
import { Button, Modal, Pagination } from 'elemental';
import { parseImageAPIResponse } from '../../../lib/parseAPIResponse';
import ImagesEditor from './ImagesEditor';
import ImageSelection from './ImageSelection';
import SelectorMixin from './mixins/SelectorMixin';
import React from 'react';
import merge from 'lodash/merge';

const _ = {
  merge,
}

const PAGINATION_LIMIT = 10;

class ImageSelector extends SelectorMixin(React.Component) {
	constructor (props) {
		super(props);
		this.state.selectedItems = props.selectedImages;
	}

	componentWillReceiveProps (nextProps) {
		let props = {};
		_.merge(props, nextProps, { selectedItems: nextProps.selectedImages });
		super.componentWillReceiveProps(props);
	}

	loadItems (querstring = '') {
		return new Promise((resolve, reject) => {
			super.loadItems(querstring)
				.then((images) => {
					resolve(images.map((image) => {
						return parseImageAPIResponse(image);
					}));
				}).catch((err) => reject(err));
		});
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
				<Modal.Header text="Select image" showCloseButton onClose={this.handleCancel} />
				<Modal.Body>
					<div style={{
						marginBottom: '30px',
						borderBottom: '3px solid',
					}}>
						{this._renderSearchFilter()}
						<ImageSelection
							images={items}
							selectedImages={selectedItems}
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
					<div>
						<ImagesEditor
							images={selectedItems}
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
	selectionLimit: React.PropTypes.number,
};

ImageSelector.defaultProps = {
	apiPath: '',
	isSelectionOpen: false,
	selectedImages: [],
	selectionLimit: 1,
};

export default ImageSelector;
