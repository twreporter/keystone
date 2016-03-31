'use strict';
import { ImageGrid } from './ImageGrid';
import { shallowEqual } from 'react-pure-render';
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
            selectedImages: Array.isArray(this.props.selectedImages) ? this.props.selectedImages : []
		};
	},

    componentWillReceiveProps (nextProps) {
        this.setState({
            images: nextProps.images,
            selectedImages: nextProps.selectedImages
        });
    },

    shouldComponentUpdate (nextProps, nextState) {
        let shouldUpdate = false;
        if (this.props.doSelectMany !== nextProps.doSelectMany ||
            this.props.updateSelection !== nextProps.updateSelection) {
                shouldUpdate = true;
        }
        return shouldUpdate || !shallowEqual(this.state, nextState);
    },

    handleClick (image) {
        let _selectImages = this.state.selectedImages;
        let filtered = _selectImages.filter((selectedImage) => {
            return selectedImage.id !== image.id;
        });

        // select the image
        if (filtered.length === _selectImages.length) {
            if (this.props.doSelectMany) {
                // create a new array for pure render
                const len = filtered.length;
                filtered = len === 0 ? [image] : filtered.concat(image);
            } else {
                filtered = [image];
            }
        }
        this.setState({
            selectedImages: filtered
        }, () => {
            this.props.updateSelection(filtered);
        });
    },

	render () {
		return (
            <ImageGrid
                doSelectMany={this.state.doSelectMany}
                images={this.state.images}
                onClick={this.handleClick}
                selectedImages={this.state.selectedImages}
            />
		);
	}
});

module.exports = ImagesSelection;
