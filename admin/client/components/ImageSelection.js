'use strict';
import { ImageGrid } from './ImageGrid';
import { shallowEqual } from 'react-pure-render';
import React from 'react';

const ImageSelection = React.createClass({
	displayName: 'ImageSelection',
	propTypes: {
        images: React.PropTypes.array,
        selectedImages: React.PropTypes.array,
        selectionLimit: React.PropTypes.number,
        updateSelection: React.PropTypes.func.isRequired
	},

	getDefaultProps () {
		return {
            images: [],
			selectedImages: [],
            selectionLimit: 1
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
        if ( this.props.updateSelection !== nextProps.updateSelection ||
            this.props.selectionLimit !== nextProps.selectionLimit ) {
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
            // select many
            if (this.props.selectionLimit > 1) {
                const len = filtered.length;
                if (len >= this.props.selectionLimit) {
                    filtered.shift();
                }
                // create a new array for pure render
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
                images={this.state.images}
                onClick={this.handleClick}
                selectedImages={this.state.selectedImages}
            />
		);
	}
});

module.exports = ImageSelection;
