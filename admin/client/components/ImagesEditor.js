'use strict';
import { shallowEqual } from 'react-pure-render';
import { DragSource, DropTarget, DragDropContext } from 'react-dnd';
import { ImageGrid, ImageItem } from './ImageGrid';
import { FormField, FormInput } from 'elemental';
import React, { PropTypes, Component } from 'react';
import objectAssign from 'object-assign';
import update from 'react/lib/update';
import HTML5Backend from 'react-dnd-html5-backend';

const itemStyle = {
    border: '1px dashed gray',
    padding: '0.5rem 1rem',
    marginBottom: '.5rem',
    backgroundColor: 'white',
    cursor: 'move',
    width: '33%'
};

const imageSource = {
  beginDrag(props) {
    return {
      id: props.id,
      originalIndex: props.findImage(props.id).index
    };
  },

  endDrag(props, monitor) {
    const { id: droppedId, originalIndex } = monitor.getItem();
    const didDrop = monitor.didDrop();

    if (!didDrop) {
      props.moveImage(droppedId, originalIndex);
    }
  }
};

const imageTarget = {
  canDrop() {
    return false;
  },

  hover(props, monitor) {
    const { id: draggedId } = monitor.getItem();
    const { id: overId } = props;

    if (draggedId !== overId) {
      const { index: overIndex } = props.findImage(overId);
      props.moveImage(draggedId, overIndex);
    }
  }
}

class DnDItem extends Component {
    render() {
        const { image, isDragging, connectDragSource, connectDropTarget } = this.props;
        const opacity = isDragging ? 0 : 1;

        return connectDragSource(connectDropTarget(
            <div style={{ ...itemStyle, opacity, display:"inline-block" }}>
                {this.props.children}
            </div>
        ));
    }
}

DnDItem.propTypes = {
    connectDragSource: PropTypes.func.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
    id: PropTypes.any.isRequired,
    moveImage: PropTypes.func.isRequired,
    findImage: PropTypes.func.isRequired
};

const ImageDnDItem = DropTarget('image', imageTarget, connect => ({
    connectDropTarget: connect.dropTarget()
}))(DragSource('image', imageSource, (connect, monitor) => ({
    isDragging: monitor.isDragging(),
    connectDragSource: connect.dragSource(),
}))(DnDItem));


const gridStyle = {
    width: '100%'
};

const containerTarget = {
    drop() {
    }
};
class DnDContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            images: props.images
        };
        this.moveImage = this._moveImage.bind(this);
        this.findImage = this._findImage.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            images: nextProps.images
        });
    }

    _handleChange (image, e) {
        image.description = e.target.value;
        this.props.onChange(image);
    }

    _moveImage (id, atIndex) {
        const { image, index } = this.findImage(id);
        this.setState(update(this.state, {
            images: {
                $splice: [
                    [index, 1],
                    [atIndex, 0, image]
                ]
            }
        }));
    }

    _findImage (id) {
        const { images } = this.state;
        const image = images.filter(i => i.id === id)[0];

        return {
            image,
            index: images.indexOf(image)
        };
    }

    _handleRemove (image) {
        this.props.onRemove(image);
    }

    _handleInputChange (image, e) {
        image.description = e.target.value;
        this.props.onChange(image);
    }

    render () {
        const { images } = this.state;
        const { columns, connectDropTarget } = this.props;
        const imageNodes = images.map((image, index) => {
            return (
                <ImageDnDItem
                    id={image.id}
                    key={image.id}
                    moveImage={this.moveImage}
                    findImage={this.findImage}
                >
                    <ImageItem
                        doShowRemove={true}
                        id={image.id}
                        key={image.id}
                        link={image.link}
                        onChange={this._handleChange.bind(this, image)}
                        onRemove={this._handleRemove.bind(this, image)}
                        padding={0}
                        url={image.url}
                        style={{border: '1px solid gainsboro'}}
                    >
                        <FormField label="" htmlFor="image-caption-input" style={{paddingTop: '5px'}}>
                            <FormInput placeholder="input caption here" defaultValue={image.description} name="image-caption-input" onChange={this._handleInputChange.bind(this, image)} />
                        </FormField>
                    </ImageItem>
                </ImageDnDItem>
            );
        });

        return connectDropTarget(
            <div className="imageGrid" style={gridStyle}>
                {imageNodes}
            </div>
        );
    }
}
DnDContainer.propTypes = {
    columns: PropTypes.number,
    connectDropTarget: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired
};
DnDContainer.defaultProps = {
    columns: 1
};

const ImageDnDContainer = DragDropContext(HTML5Backend)(DropTarget('image', containerTarget, connect => ({
    connectDropTarget: connect.dropTarget()
}))(DnDContainer));


class ImagesEditor extends Component {
    constructor(props) {
        super(props);

        this.state = {
            images: props.images
        };

    }

    componentWillReceiveProps (nextProps) {
        this.setState({
            images: nextProps.images
        });
    }

    shouldComponentUpdate (nextProps, nextState) {
        return !shallowEqual(this.state, nextState);
    }

    _handleRemove (imageToRemove) {
        let { images } = this.state;
        const filtered = images.filter((image) => image.id !== imageToRemove.id);
        this.setState({
            images: filtered
        });
        this.props.onChange(filtered);
    }

    _handleChange (imageToChange) {
        let { images } = this.state;
        const changed = images.map((image) => {
            if (image.id === imageToChange.id) {
                return imageToChange;
            }
            return image;
        });
        this.setState({
            images: changed
        });
        this.props.onChange(changed);
    }

    render () {
        const { images } = this.state;
        return (
            <ImageDnDContainer
                images={images}
                onRemove={this._handleRemove.bind(this)}
                onChange={this._handleChange.bind(this)}
            />
        );
    }
}

ImagesEditor.propTypes = {
    images: PropTypes.array,
    onChange: PropTypes.func.isRequired
};

ImagesEditor.defaultProps = {
    images: []
};

export default ImagesEditor;
