import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import { DragSource, DropTarget } from 'react-dnd';
import DragDropContext from '../../../lib/DragDropContext';

const textStyle = {
  margin: '0',
  paddingRight: '10px',
  lineBreak: 'anywhere',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
};

const itemStyle = {
  border: '1px solid #ddd',
  borderRadius: '3px',
  paddingLeft: '10px',
  marginBottom: '.5rem',
  cursor: 'grab',
  display: 'flex',
  alignItems: 'center',
  paddingTop: '8px',
  paddingBottom: '8px',
};

const itemControlStyle = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center'
};

const itemTextStyle = {
  ...textStyle,
  paddingLeft: '25px'
};

class SortItem extends Component {
  render() {
    const {
      text,
      isDragging,
      connectDragSource,
      connectDropTarget,
    } = this.props;

    const opacity = isDragging ? 0 : 1;

    return connectDragSource(
      connectDropTarget(
        <div style={{ ...itemStyle, opacity }}>
          <div style={itemControlStyle}>
            <span className={'octicon octicon-three-bars'} style={{ marginLeft: '10px' }} />
          </div>
          <p style={itemTextStyle} title={text}>{text}</p>
        </div>
      )
    );
  }
}

SortItem.propTypes = {
  connectDragSource: PropTypes.func.isRequired,
  connectDropTarget: PropTypes.func.isRequired,
  isDragging: PropTypes.bool.isRequired,
  text: PropTypes.string.isRequired,
};

const cardSource = {
  beginDrag(props) {
    return {
      id: props.id,
      index: props.index
    };
  }
};

const cardTarget = {
  hover(props, monitor, component) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }

    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
    const clientOffset = monitor.getClientOffset();
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;

    // Dragging downwards
    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
      return;
    }

    // Dragging upwards
    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      return;
    }

    props.onDrag(dragIndex, hoverIndex);
    monitor.getItem().index = hoverIndex;
  }
};

const DndItem = DropTarget('name', cardTarget, (connect) => ({
  connectDropTarget: connect.dropTarget()
}))(DragSource('name', cardSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))(SortItem));

class DndItems extends Component {
  constructor(props) {
    super(props);
    this.renderDndItems = this.renderDndItems.bind(this);
  }

  renderDndItems() {
    const { items, onDrag } = this.props;

    if (!Array.isArray(items) || items.length <= 0) {
      return null;
    }

    return items.map((item, index) => {
      if (!item) {
        return null;
      }
      return (<DndItem
        key={`dnd-item-${item.id}`}
        index={index}
        id={item.id}
        text={item.name}
        onDrag={onDrag}
      />);
    });
  }

  render() {
    return (
      <div>{this.renderDndItems()}</div>
    );
  }
}

const SortableList = DragDropContext(DndItems);

const headerStyle = {
  marginTop: '4px',
  marginBottom: '4px',
  paddingLeft: '57px',
};

class SortableHeader extends Component {
  render() {
    const { title } = this.props;

    return (
      <div style={{ ...headerStyle }}>
        <div>{title}</div>
      </div>
    );
  }
}

export { SortableList, SortableHeader };
