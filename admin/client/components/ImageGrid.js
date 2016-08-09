'use strict';
import objectAssign from 'object-assign';
import React from 'react';

class ImageItem extends React.Component {
	constructor (props) {
		super(props);
		this.state = {
			isSelected: props.isSelected,
		};
	}

	componentWillReceiveProps (nextProps) {
		this.setState({
			isSelected: nextProps.isSelected,
		});
	}

	_handleSelect (e) {
		if (typeof this.props.onSelect === 'function') {
			this.props.onSelect(e);
		}
	}

	_handleRemove (e) {
		this.props.onRemove(e);
	}

	render () {
		const { width, padding, url, doShowRemove, style } = this.props;
		const { isSelected } = this.state;

		const styles = {
			imageGridItem: objectAssign({
				boxSizing: 'border-box',
				display: 'inline-block',
				padding,
				width: `${width}%`,
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
				width: '100%',
			},
		};

		let btStyle = {
			fontSize: '2em',
			backgroundColor: '#FFF',
		};

		const bt = doShowRemove ? (
			<i className="fa fa-times" onClick={this._handleRemove.bind(this)} style={btStyle} />
		) : (isSelected ? <i className="fa fa-check-circle-o" style={btStyle} /> : <i className="fa"/>);

		return (
			<div onClick={this._handleSelect.bind(this)} className="imageGridItem" style={styles.imageGridItem}>
				<div className="imageWrapper" style={styles.imageWrapper}>{bt}</div>
				{this.props.children}
			</div>
		);
	}
}
ImageItem.propTypes = {
	doShowRemove: React.PropTypes.bool,
	isSelected: React.PropTypes.bool,
	onRemove: React.PropTypes.func,
	onSelect: React.PropTypes.func,
	padding: React.PropTypes.number,
	style: React.PropTypes.object,
	url: React.PropTypes.string.isRequired,
	width: React.PropTypes.number.isRequired,
};

ImageItem.defaultProps = {
	doShowRemove: false,
	isSelected: false,
	padding: 0,
	style: {},
	url: '',
	width: 100,
};

class ImageGrid extends React.Component {
	constructor (props) {
		super(props);
		this.state = {
			images: props.images,
			selectedImages: props.selectedImages,
		};
	}
	componentWillReceiveProps (nextProps) {
		this.setState({
			images: nextProps.images,
			selectedImages: nextProps.selectedImages,
		});
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
	selectedImages: React.PropTypes.array,
};

ImageGrid.defaultProps = {
	columns: 3,
	images: [],
	padding: 10,
	selectedImages: [],
};

export { ImageGrid, ImageItem };
