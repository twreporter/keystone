'use strict';
import { ImageGrid } from './ImageGrid';
import React from 'react';

const ImagesSelection = React.createClass({
	displayName: 'ImagesSelection',
	propTypes: {
        doSelectMany: React.PropTypes.bool,
        images: React.PropTypes.array,
        selectedImages: React.PropTypes.array,
        updateSelection: React.PropTypes.func.isRequired
	},

	getDefaultProps () {
		return {
            doSelectMany: false,
            images: [],
			selectedImages: []
		};
	},

	getInitialState () {
		return {
            images: Array.isArray(this.props.images) ? this.props.images : [],
            modalIsOpen: this.props.modalIsOpen,
            selectedImages: Array.isArray(this.props.selectedImages) ? this.props.selectedImages : []
		};
	},

    componentWillReceiveProps (nextProps) {
        this.setState({
            images: nextProps.images,
            selectedImages: nextProps.selectedImages
        });
    },

    handleClick (image) {
        let _selectImages = this.state.selectedImages;
        let filtered = _selectImages.filter((selectedImage) => {
            return selectedImage.id !== image.id;
        });

        // select the image
        if (filtered.length === _selectImages.length) {
            if (this.props.doSelectMany) {
                filtered.push(image);
            } else {
                filtered = [image];
            }
        }
        this.setState({
            selectedImages: filtered
        });
        this.props.updateSelection(filtered);
    },

	render () {
		return (
            <ImageGrid
                doSelectMany={this.state.doSelectMany}
                images={this.state.images}
                handleClick={this.handleClick}
                selectedImages={this.state.selectedImages}
            />
		);
	}
});

module.exports = ImagesSelection;
