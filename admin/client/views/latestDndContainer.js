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

const dateStyle = {
  width: '280px',
  paddingRight: '5px',
  alignItems: 'center'
};

const latestStyle = {
  border: '1px solid #ddd',
  borderRadius: '3px',
  paddingLeft: '10px',
  marginBottom: '.5rem',
  cursor: 'grab',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const latestControlStyle = {
  width: '500px',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center'
};

const numPostStyle = {
  width: '100px',
  paddingLeft: '10px',
  ...textStyle,
};

const latestTextStyle = {
  ...textStyle,
};

class Latest extends Component {
  render() {
    const {
      id,
      text,
      numPost,
      date,
      isDragging,
      connectDragSource,
      connectDropTarget,
      onLatestRemove
    } = this.props;

    const opacity = isDragging ? 0 : 1;
    const dateObj = new Date(date);
    const dateText = dateObj && dateObj.toString() !== 'Invalid Date' ? dateObj.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }) : '---';

    return connectDragSource(
      connectDropTarget(
        <div style={{ ...latestStyle, opacity }}>
          <div style={latestControlStyle}>
            <button type="button" className="ItemList__control ItemList__control--delete-no-focus" onClick={() => onLatestRemove(id)}><span className={'octicon octicon-circle-slash'} /></button>
            <span className={'octicon octicon-three-bars'} style={{ marginLeft: '10px', marginRight: '10px' }} />
            <p style={latestTextStyle} title={text}>{text}</p>
          </div>
          <span style={numPostStyle} title={numPost}>{numPost}</span>
          <div style={dateStyle}><p style={textStyle} title={dateText}>{dateText}</p></div>
        </div>
      )
    );
  }
}

Latest.propTypes = {
  connectDragSource: PropTypes.func.isRequired,
  connectDropTarget: PropTypes.func.isRequired,
  id: PropTypes.any.isRequired,
  index: PropTypes.number.isRequired,
  isDragging: PropTypes.bool.isRequired,
  numPost: PropTypes.number.isRequired,
  onLatestDrag: PropTypes.func.isRequired,
  onLatestRemove: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired
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

    props.onLatestDrag(dragIndex, hoverIndex);
    monitor.getItem().index = hoverIndex;
  }
};

const DndLatest = DropTarget('latest', cardTarget, (connect) => ({
  connectDropTarget: connect.dropTarget()
}))(DragSource('latest', cardSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))(Latest));

class DndLatests extends Component {
  constructor(props) {
    super(props);
    this.renderDndLatests = this.renderDndLatests.bind(this);
  }

  renderDndLatests() {
    const { latests, onLatestDrag, onLatestRemove } = this.props;

    if (!Array.isArray(latests) || latests.length <= 0) {
      return null;
    }

    return latests.map((latest, index) => {
      return latest
        ? <DndLatest
          key={`latest-${latest.id}`}
          index={index}
          id={latest.id}
          text={latest.name}
          numPost={latest.numPost}
          date={latest.newestDate}
          onLatestDrag={onLatestDrag}
          onLatestRemove={onLatestRemove}
        /> : null;
    });
  }

  render() {
    return (
      <div>{this.renderDndLatests()}</div>
    );
  }
}

const LatestDndContainer = DragDropContext(DndLatests);

export { LatestDndContainer };
