import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import classnames from 'classnames';
import { DragSource, DropTarget, DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { Checkbox } from 'elemental';

const SortOrder = Object.freeze({ ASCENDING: 1, DESCENDING: 2 });
const Selection = Object.freeze({ NONE: 'NONE', INDETERMINATE: 'INDETERMINATE', ALL: 'ALL' });

const textStyle = {
  margin: '0',
  paddingRight: '10px',
  lineBreak: 'anywhere',
  textOverflow: 'ellipsis'
};

const dateStyle = {
  paddingRight: '5px',
  flex: '1',
  display: 'flex',
  justifyContent: 'flex-end'
};

class SlugListHeader extends Component {
  constructor(props) {
    super(props);
    this.onSelectAll = this.onSelectAll.bind(this);
    this.onSelectedSlugRemove = this.onSelectedSlugRemove.bind(this);
    this.onSlugSort = this.onSlugSort.bind(this);
    this.state = {
      sort: SortOrder.ASCENDING
    };
  }

  onSelectAll() {
    const { onSelectAll } = this.props;
    if (onSelectAll) {
      onSelectAll();
    }
  }

  onSelectedSlugRemove() {
    const { onSelectedSlugRemove } = this.props;
    if (onSelectedSlugRemove) {
      onSelectedSlugRemove();
    }
  }

  // TODO: error handling, check correctness ***
  onSlugSort() {
    const { sort } = this.state;
    const { onSlugSort } = this.props;
    this.setState({ sort: sort === SortOrder.ASCENDING ? SortOrder.DESCENDING : SortOrder.ASCENDING }, () => onSlugSort(sort === SortOrder.ASCENDING));
  }

  render() {
    const style = {
      padding: '10px',
      display: 'flex',
      alignItems: 'center'
    };

    const slugControlStyle = {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center'
    };

    const sortBtnStyle = {
      border: 'none',
      backgroundColor: 'Transparent'
    };

    const slugTextStyle = {
      ...textStyle,
      paddingLeft: '25px'
    };

    const caretStyle = {
      borderLeft: '6px solid rgba(0, 0, 0, 0)',
      borderRight: '6px solid rgba(0, 0, 0, 0)',
      content: '',
      display: 'inline-block',
      height: '0',
      verticalAlign: 'middle',
      width: '0'
    };

    const caretUpStyle = {
      ...caretStyle,
      borderBottom: '10px solid #000000'
    };

    const caretDownStyle = {
      ...caretStyle,
      borderTop: '10px solid #000000'
    };

    // TODO: fix transh can click issue
    const className = classnames('ItemList__control ItemList__control--delete', {
      'is-active': true,
    });

    const { sort } = this.state;
    const { selection } = this.props;

    return (
      <div style={style}>
        <div style={slugControlStyle}>
          <Checkbox
            onChange={this.onSelectAll}
            checked={selection === Selection.ALL}
            indeterminate={selection === Selection.INDETERMINATE}
          />
          <button type="button" className={className} onClick={this.onSelectedSlugRemove}><span className={'octicon octicon-trashcan'} /></button>
        </div>
        <p style={slugTextStyle}>{'文章Slug'}</p>
        <div style={dateStyle}>
          {'發布日期'}
          <button type="button" style={sortBtnStyle} onClick={this.onSlugSort}>
            <span
              style={sort === SortOrder.ASCENDING ? caretDownStyle : caretUpStyle}
            ></span>
          </button>
        </div>
      </div>
    );
  }
}

class Slug extends Component {
  render() {
    const {
      text,
      date,
      isDragging,
      connectDragSource,
      connectDropTarget,
      onSelect,
      isSelected
    } = this.props;

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

    const opacity = isDragging ? 0 : 1;
    const dateObj = new Date(date);
    const dateText = dateObj ? dateObj.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }) : 'unknown';

    return connectDragSource(
      connectDropTarget(
        <div style={{ ...slugStyle, opacity }}>
          <div style={slugControlStyle}>
            <Checkbox onChange={onSelect} checked={isSelected} />
            <span className={'octicon octicon-three-bars'} style={{ marginLeft: '10px' }} />
          </div>
          <p style={slugTextStyle}>{text}</p>
          <div style={dateStyle}><p style={textStyle}>{dateText}</p></div>
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
    this.onSlugSelect = this.onSlugSelect.bind(this);
    this.onSlugRemoveSelected = this.onSlugRemoveSelected.bind(this);
    this.renderDndSlugs = this.renderDndSlugs.bind(this);
  }

  onSlugSelect(slugId) {
    const { onSlugSelect } = this.props;
    if (slugId && onSlugSelect) {
      onSlugSelect(slugId);
    }
  }

  onSlugRemoveSelected() {
    const { slugs } = this.props;
    this.setState(
      {
        slugs: slugs.filter((slug) => slug && !slug.isSelected)
      },
      this.updateCheckAllStatus
    );
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
          onSelect={() => this.onSlugSelect(slug.id)}
          isSelected={slug.isSlugSelected}
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

const DndSlugsContainer = DragDropContext(HTML5Backend)(DndSlugs);

class SlugSelectionComponent extends Component {
  render() {
    const { slugs, selection, onSelectAll, onSelectedSlugRemove, onSlugSort, onSlugDrag, onSlugSelect } = this.props;
    return (
      <div>
        <SlugListHeader
          selection={selection}
          onSelectAll={onSelectAll}
          onSelectedSlugRemove={onSelectedSlugRemove}
          onSlugSort={onSlugSort}
        />
        <DndSlugsContainer slugs={slugs} onSlugDrag={onSlugDrag} onSlugSelect={onSlugSelect} />
      </div>
    );
  }
}

SlugSelectionComponent.propTypes = {
  onSelectAll: PropTypes.func.isRequired,
  onSelectedSlugRemove: PropTypes.func.isRequired,
  onSlugDrag: PropTypes.func.isRequired,
  onSlugSelect: PropTypes.func.isRequired,
  onSlugSort: PropTypes.func.isRequired,
  selection: PropTypes.string.isRequired,
  slugs: PropTypes.array.isRequired
};

export { Selection, SlugSelectionComponent };
