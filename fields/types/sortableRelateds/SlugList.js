import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import { DragSource, DropTarget } from 'react-dnd';
import { Checkbox } from 'elemental';
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

const slugStyle = {
  border: '1px solid #ddd',
  borderRadius: '3px',
  paddingLeft: '10px',
  marginBottom: '.5rem',
  cursor: 'grab',
  display: 'flex',
  alignItems: 'center'
};

const slugControlStyle = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center'
};

const slugTextStyle = {
  ...textStyle,
  paddingLeft: '25px'
};

class Slug extends Component {
  render() {
    const {
      text,
      date,
      isDragging,
      connectDragSource,
      connectDropTarget,
      onPickUpSingle,
      isPickedUp
    } = this.props;

    const opacity = isDragging ? 0 : 1;
    const dateObj = new Date(date);
    const dateText = dateObj ? dateObj.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }) : 'unknown';

    return connectDragSource(
      connectDropTarget(
        <div style={{ ...slugStyle, opacity }}>
          <div style={slugControlStyle}>
            <Checkbox onChange={onPickUpSingle} checked={isPickedUp} />
            <span className={'octicon octicon-three-bars'} style={{ marginLeft: '10px' }} />
          </div>
          <p style={slugTextStyle} title={text}>{text}</p>
          <div style={dateStyle}><p style={textStyle} title={dateText}>{dateText}</p></div>
        </div>
      )
    );
  }
}

Slug.propTypes = {
  connectDragSource: PropTypes.func.isRequired,
  connectDropTarget: PropTypes.func.isRequired,
  id: PropTypes.any.isRequired,
  index: PropTypes.number.isRequired,
  isDragging: PropTypes.bool.isRequired,
  onSlugDrag: PropTypes.func.isRequired,
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

    props.onSlugDrag(dragIndex, hoverIndex);
    monitor.getItem().index = hoverIndex;
  }
};

const DndSlug = DropTarget('slug', cardTarget, (connect) => ({
  connectDropTarget: connect.dropTarget()
}))(DragSource('slug', cardSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))(Slug));

class DndSlugs extends Component {
  constructor(props) {
    super(props);
    this.onPickUpSingle = this.onPickUpSingle.bind(this);
    this.renderDndSlugs = this.renderDndSlugs.bind(this);
  }

  onPickUpSingle(slugId) {
    const { onPickUpSingle } = this.props;
    if (slugId && onPickUpSingle) {
      onPickUpSingle(slugId);
    }
  }

  renderDndSlugs() {
    const { slugs, onSlugDrag } = this.props;

    if (!Array.isArray(slugs) || slugs.length <= 0) {
      return null;
    }

    return slugs.map((slug, index) => {
      return slug
        ? <DndSlug
          key={`slug-${slug.id}`}
          index={index}
          id={slug.id}
          text={slug.slug}
          date={slug.fields ? slug.fields.publishedDate : ''}
          onPickUpSingle={() => this.onPickUpSingle(slug.id)}
          isPickedUp={slug.isPickedUpToRemove}
          onSlugDrag={onSlugDrag}
        /> : null;
    });
  }

  render() {
    return (
      <div>{this.renderDndSlugs()}</div>
    );
  }
}

const DndSlugsContainer = DragDropContext(DndSlugs);

export { DndSlugsContainer };
