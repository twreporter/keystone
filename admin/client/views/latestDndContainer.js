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
  width: '260px',
  paddingRight: '5px',
  flex: '1',
  display: 'flex',
  justifyContent: 'flex-end'
};

const latestStyle = {
  border: '1px solid #ddd',
  borderRadius: '3px',
  paddingLeft: '10px',
  marginBottom: '.5rem',
  cursor: 'grab',
  display: 'flex',
  alignItems: 'center'
};

const latestControlStyle = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center'
};

const latestTextStyle = {
  ...textStyle,
  paddingLeft: '25px'
};

class Latest extends Component {
  render() {
    const {
      text,
      numPost,
      date,
      isDragging,
      connectDragSource,
      connectDropTarget,
    } = this.props;

    const opacity = isDragging ? 0 : 1;
    const dateObj = new Date(date);
    const dateText = dateObj && dateObj.toString() !== 'Invalid Date' ? dateObj.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }) : '---';

    return connectDragSource(
      connectDropTarget(
        <div style={{ ...latestStyle, opacity }}>
          <div style={latestControlStyle}>
            <button type="button" className="ItemList__control ItemList__control--delete-no-focus" onClick={() => {}}><span className={'octicon octicon-circle-slash'} /></button>
            <span className={'octicon octicon-three-bars'} style={{ marginLeft: '10px' }} />
          </div>
          <p style={latestTextStyle} title={text}>{text}</p>
          <p style={latestTextStyle} title={numPost}>{numPost}</p>
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
    const { latests, onLatestDrag } = this.props;

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
