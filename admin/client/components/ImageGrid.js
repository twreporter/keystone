'use strict';
import { Pill } from 'elemental';
import React from 'react';

class ImageItem extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            isSelected: props.isSelected
        };
    }

    _handleClick (e) {
        this.props.onClick(e);
    }

    _handleRemove (e) {
        this.props.onRemove(e);
    }

    componentWillReceiveProps (nextProps) {
        this.setState({
            isSelected: nextProps.isSelected
        });
    }
    render () {
        const { width, padding, url, link, doShowRemove } = this.props;
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

        const RemoveBt = doShowRemove ? (
            <Pill type="primary" onClear={this._handleRemove.bind(this)} />
        ): null;

        return (
            <div onClick={this._handleClick.bind(this)} className="imageGridItem" style={styles.imageGridItem}>
                <div className="imageWrapper" style={styles.imageWrapper}>{RemoveBt}</div>
            </div>
        );
    }
}
ImageItem.propTypes = {
    doShowRemove: React.PropTypes.bool,
    isSelected: React.PropTypes.bool,
    link: React.PropTypes.string,
    onClick: React.PropTypes.func.isRequired,
    onRemove: React.PropTypes.func,
    padding: React.PropTypes.number,
    url: React.PropTypes.string.isRequired,
    width: React.PropTypes.number.isRequired
};

ImageItem.defaultProps = {
    doShowRemove: false,
    isSelected: false,
    link: '',
    padding: 0,
    url: '',
    width: 0
};

class ImageGrid extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            images: props.images,
            selectedImages: props.selectedImages
        };
    }
    componentWillReceiveProps (nextProps) {
        this.setState({
            images: nextProps.images,
            selectedImages: nextProps.selectedImages
        });
    }
    _handleClick (image) {
        this.props.onClick(image);
    }
    render () {
        const { images, selectedImages } = this.state;
        const { columns, padding } = this.props;
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
                    onClick={this._handleClick.bind(this, image)}
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
}

ImageGrid.propTypes = {
    columns: React.PropTypes.number,
    images: React.PropTypes.array.isRequired,
    onClick: React.PropTypes.func.isRequired,
    padding: React.PropTypes.number,
    selectedImages: React.PropTypes.array
};

ImageGrid.defaultProps = {
    columns: 3,
    images: [],
    padding: 10,
    selectedImages: []
};

export { ImageGrid, ImageItem };
