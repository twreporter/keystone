'use strict';
import { shallowEqual } from 'react-pure-render';
import { Pill } from 'elemental';
import _ from 'lodash';
import objectAssign from 'object-assign';
import React from 'react';

class ImageItem extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            isSelected: props.isSelected
        };
    }

    _handleSelect (e) {
        if (typeof this.props.onSelect === 'function') {
            this.props.onSelect(e);
        }
    }

    _handleRemove (e) {
        this.props.onRemove(e);
    }

    componentWillReceiveProps (nextProps) {
        this.setState({
            isSelected: nextProps.isSelected
        });
    }

    shouldComponentUpdate (nextProps, nextState) {
        let shouldUpdate = false;
        Object.keys(this.props).forEach((prop) => {
            if (prop === 'onRemove' || prop === 'onSelect') {
                // do nothing
            }
            shouldUpdate = this.props[prop] ===  nextProps[prop] ? false : true;
        })
        return !shallowEqual(this.state, nextState) || shouldUpdate;
    }

    render () {
        const { width, padding, url, doShowRemove, style } = this.props;
        const { isSelected } = this.state;

        const styles = {
            imageGridItem: objectAssign({
                border: isSelected ? '1px solid' : '',
                boxSizing: 'border-box',
                display: 'inline-block',
                padding,
                width: `${width}%`
            }, style),
            imageWrapper: {
                backgroundImage: `url(${url})`,
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                cursor: 'pointer',
                paddingBottom: '100%',
                position: 'relative',
                textAlign: 'right',
                width: '100%'
            },
        };

        const RemoveBt = doShowRemove ? (
            <svg
                onClick={this._handleRemove.bind(this)}
                viewBox="0 0 24 24"
                preserveAspectRatio="xMidYMid meet"
                style={{fill:"white",verticalAlign:"middle",width:"32px",height:"32px",cursor:'pointer'}}
            >
                <g><path d="M19 6.41l-1.41-1.41-5.59 5.59-5.59-5.59-1.41 1.41 5.59 5.59-5.59 5.59 1.41 1.41 5.59-5.59 5.59 5.59 1.41-1.41-5.59-5.59z"></path></g>
            </svg>
        ): null;

        return (
            <div onClick={this._handleSelect.bind(this)} className="imageGridItem" style={styles.imageGridItem}>
                <div className="imageWrapper" style={styles.imageWrapper}>{RemoveBt}</div>
                {this.props.children}
            </div>
        );
    }
}
ImageItem.propTypes = {
    doShowRemove: React.PropTypes.bool,
    isSelected: React.PropTypes.bool,
    onSelect: React.PropTypes.func,
    onRemove: React.PropTypes.func,
    padding: React.PropTypes.number,
    url: React.PropTypes.string.isRequired,
    style: React.PropTypes.object,
    width: React.PropTypes.number.isRequired
};

ImageItem.defaultProps = {
    doShowRemove: false,
    isSelected: false,
    padding: 0,
    url: '',
    style: {},
    width: 100
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
    shouldComponentUpdate (nextProps, nextState) {
        return  !shallowEqual(this.props, nextProps) ||
            !shallowEqual(this.state, nextState);
    }
    _handleSelect (image) {
        this.props.onSelect(image);
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
                    onSelect={this._handleSelect.bind(this, image)}
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
    onSelect: React.PropTypes.func,
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
