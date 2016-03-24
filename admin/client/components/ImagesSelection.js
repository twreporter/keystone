import React from 'react';

const ImageItem = React.createClass({
    displayName: 'ImageItem',
    propTypes: {
        isSelected: React.PropTypes.bool,
        link: React.PropTypes.string,
        onClick: React.PropTypes.func,
        padding: React.PropTypes.number,
        url: React.PropTypes.string.isRequired,
        width: React.PropTypes.number.isRequired
    },
    getDefaultProps () {
        return {
            isSelected: false,
            link: '',
            padding: 0,
            url: '',
            width: 0
        }
    },
    getInitialState () {
        return {
            isSelected: this.props.isSelected
        }
    },
    componentWillReceiveProps (nextProps) {
        this.setState({
            isSelected: nextProps.isSelected
        });
    },
    render () {
        const { width, padding, url, link } = this.props;
        const { isSelected } = this.state;

        const styles = {
            imageGridItem: {
                border: isSelected ? '1px solid' : '',
                boxSizing: 'border-box',
                display: 'inline-block',
                padding,
                width: `${width}%`
            },
            imageWrapper: {
                backgroundImage: `url(${url})`,
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                paddingBottom: '100%',
                position: 'relative',
                width: '100%'
            },
        };

        return (
            <div onClick={this.props.onClick} className="imageGridItem" style={styles.imageGridItem}>
                <div className="imageWrapper" style={styles.imageWrapper}></div>
            </div>
        );
    }
});

const ImageGrid = React.createClass({
    displayName: 'ImageGrid',
    propTypes: {
        columns: React.PropTypes.number,
        images: React.PropTypes.array.isRequired,
        onDeselect: React.PropTypes.func,
        onSelect: React.PropTypes.func,
        padding: React.PropTypes.number,
        selectedImages: React.PropTypes.array.isRequired
    },
    getDefaultProps () {
		return {
            columns: 3,
            images: [],
            padding: 10,
            selectedImages: []
		};
    },
    getInitialState () {
        return {
            images: this.props.images,
            selectedImages: this.props.selectedImages
        };
    },
    componentWillReceiveProps (nextProps) {
        this.setState({
            images: nextProps.images,
            selectedImages: nextProps.selectedImages
        });
    },
    onDeselect (image) {
        this.props.onDeselect(image);
    },
    onSelect (image) {
        this.props.onSelect(image);
    },
    render () {
        let _this = this;
        const { images, selectedImages } = this.state;
        const { columns, padding, onSelect, onDeselect } = this.props;
        const width = Math.floor(100 / columns);
        const imageNodes = images.map((image, index) => {
            const isSelected = selectedImages.find((element) => {
                return element.id === image.id;
            }) ? true : false;
            return (
                <ImageItem
                    id={image.id}
                    isSelected={isSelected}
                    key={image.id}
                    link={image.link}
                    onClick={ isSelected ? _this.onDeselect.bind(_this, image) : _this.onSelect.bind(_this, image) }
                    padding={padding}
                    url={image.url}
                    width={width}
                />
            );
        });

        return (
            <div className="imageGrid">
                {imageNodes}
            </div>
        );
    }
});

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
            doSelectMany: this.props.doSelectMany,
            images: Array.isArray(this.props.images) ? this.props.images : [],
            modalIsOpen: this.props.modalIsOpen,
            selectedImages: Array.isArray(this.props.selectedImages) ? this.props.selectedImages : []
		};
	},

    componentWillReceiveProps (nextProps) {
        this.setState({
            doSelectMany: nextProps.doSelectMany,
            images: nextProps.images,
            selectedImages: nextProps.selectedImages
        });
    },

    onSelect (image) {
        let _selectImages = this.state.selectedImages;
        if (this.state.doSelectMany) {
            _selectImages.push(image);
        } else {
            _selectImages = [];
            _selectImages.push(image);
        }
        this.setState({
            selectedImages: _selectImages
        });
        this.props.updateSelection(_selectImages);
    },

    onDeselect (image) {
        let _selectImages = this.state.selectedImages;
        if (this.state.doSelectMany) {
           _selectImages = _selectImages.filter((_selectImage) => {
                return _selectImage !== image;
            });
        } else {
            _selectImages = [];
        }
        this.setState({
            selectedImages: _selectImages
        });
        this.props.updateSelection(_selectImages);
    },

	render () {
		return (
            <ImageGrid
                doSelectMany={this.state.doSelectMany}
                images={this.state.images}
                onDeselect={this.onDeselect}
                onSelect={this.onSelect}
                selectedImages={this.state.selectedImages}
            />
		);
	}
});

module.exports = ImagesSelection;
