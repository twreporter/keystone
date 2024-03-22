import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import { DragSource, DropTarget } from 'react-dnd';
import DragDropContext from '../../../lib/DragDropContext';

const textContainerStyle = {
  display: 'flex',
  width: 'calc(100% - 48px)',
  marginLeft: '10px',
  marginRight: '10px',
};

const textStyle = {
  margin: '0',
  lineBreak: 'anywhere',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  flex: 1,
};

const buttonStyle = {
  width: '24px',
  height: '16px',
};

const dateStyle = {
  width: '160px',
  paddingRight: '5px',
  alignItems: 'center'
};

const containerStyle = {
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

const controlStyle = {
  width: 'calc(100% - 160px)',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center'
};

class ReviewDndItem extends Component {
  render() {
    const {
      id,
      title,
      text,
      date,
      isDragging,
      connectDragSource,
      connectDropTarget,
      onRemove
    } = this.props;

    const opacity = isDragging ? 0 : 1;
    const dateObj = new Date(date);
    const dateText = dateObj && dateObj.toString() !== 'Invalid Date' ? dateObj.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' }) : '---';

    return connectDragSource(
      connectDropTarget(
        <div style={{ ...containerStyle, opacity }}>
          <div style={controlStyle}>
            <button type="button" className="ItemList__control ItemList__control--delete-no-focus" onClick={() => onRemove(id)}><span className={'octicon octicon-circle-slash'} style={buttonStyle} /></button>
            <span className={'octicon octicon-three-bars'} style={{ marginLeft: '10px' }} />
            <span style={textContainerStyle}>
              <p style={{ ...textStyle, flex: 2, paddingRight: '10px' }}>{title}</p>
              <p style={textStyle}>{text}</p>
            </span>
          </div>
          <div style={dateStyle}><p style={textStyle} title={dateText}>{dateText}</p></div>
        </div>
      )
    );
  }
}

ReviewDndItem.propTypes = {
  connectDragSource: PropTypes.func.isRequired,
  connectDropTarget: PropTypes.func.isRequired,
  id: PropTypes.any.isRequired,
  index: PropTypes.number.isRequired,
  isDragging: PropTypes.bool.isRequired,
  onDrag: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
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

const DndReview = DropTarget('review', cardTarget, (connect) => ({
  connectDropTarget: connect.dropTarget()
}))(DragSource('review', cardSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))(ReviewDndItem));

class DndReviews extends Component {
  constructor(props) {
    super(props);
    this.renderDndItems = this.renderDndItems.bind(this);
  }

  renderDndItems() {
    const { reviews, onDrag, onRemove } = this.props;

    if (!Array.isArray(reviews) || reviews.length <= 0) {
      return null;
    }

    return reviews.map((review, index) => {
      const itemId = review.id || review.post_id;
      return review
        ? <DndReview
          key={`review-${itemId}`}
          index={index}
          id={itemId}
          title={review.title}
          text={review.reviewWord}
          date={review.publishedDate}
          onDrag={onDrag}
          onRemove={onRemove}
        /> : null;
    });
  }

  render() {
    return (
      <div>{this.renderDndItems()}</div>
    );
  }
}

const ReviewDndContainer = DragDropContext(DndReviews);

export default ReviewDndContainer;
