import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
// import classnames from 'classnames';
import { Checkbox } from 'elemental';
import ItemTypes from './ItemTypes'; // TODO: remove this
import { DragSource, DropTarget, DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

/*
class SlugListHeader extends Component {
  constructor(props) {
    super(props);
    this.onSelectAll = this.onSelectAll.bind(this);
    this.onRemoveSelected = this.onRemoveSelected.bind(this);
    this.onSlugSort = this.onSlugSort.bind(this);
    this.state = {
      sort: 'ascending'
    };
  }

  onSelectAll() {
    const { handleSelectAll } = this.props;
    handleSelectAll();
  }

  onRemoveSelected() {
    const { handleRemoveSelected } = this.props;
    handleRemoveSelected();
  }

  onSlugSort() {
    const { sort } = this.state;
    this.setState({ sort: sort === 'ascending' ? 'descending' : 'ascending' });
    const { handleSort } = this.props;
    handleSort(sort === 'ascending');
  }

  render() {
    const { sort } = this.state;
    const style = {
      padding: '10px',
      display: 'flex'
    };

    const slugControlStyle = {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center'
    };

    const slugTextStyle = {
      paddingLeft: '10px',
      paddingRight: '10px',
      lineBreak: 'anywhere',
      textOverflow: 'ellipsis'
    };

    const dateStyle = {
      display: 'flex'
    };

    const caretUpStyle = {
      borderBottom: '10px solid #000000',
      borderLeft: '6px solid rgba(0, 0, 0, 0)',
      borderRight: '6px solid rgba(0, 0, 0, 0)',
      content: '',
      display: 'inline-block',
      height: '0',
      verticalAlign: 'top',
      width: '0'
    };

    const caretDownStyle = {
      borderTop: '10px solid #000000',
      borderLeft: '6px solid rgba(0, 0, 0, 0)',
      borderRight: '6px solid rgba(0, 0, 0, 0)',
      content: '',
      display: 'inline-block',
      height: '0',
      verticalAlign: 'top',
      width: '0'
    };

    const className = classnames('ItemList__control ItemList__control--delete', {
      'is-active': true,
    });

    const { isSelectAll } = this.props;

    return (
      <div style={style}>
        <div style={slugControlStyle}>
          <Checkbox
            onChange={this.onSelectAll}
            checked={isSelectAll === 'ALL'}
            indeterminate={isSelectAll === 'INDETERMINATE'}
          />
          <button type="button" className={className} onClick={this.onRemoveSelected}><span className={'octicon octicon-trashcan'} /></button>
        </div>
        <p style={slugTextStyle}>{'文章Slug'}</p>
        <div style={dateStyle}>
          <p>{'發布日期'}</p>
          <button onClick={this.onSlugSort}>
            <span
              style={sort === 'ascending' ? caretUpStyle : caretDownStyle}
            ></span>
          </button>
        </div>
      </div>
    );
  }
}
*/

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
      display: 'flex'
    };

    const slugControlStyle = {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center'
    };

    const slugTextStyle = {
      paddingLeft: '10px',
      paddingRight: '10px',
      lineBreak: 'anywhere',
      textOverflow: 'ellipsis'
    };

    const opacity = isDragging ? 0 : 1;

    return connectDragSource(
      connectDropTarget(
        <div style={{ ...slugStyle, opacity }}>
          <div style={slugControlStyle}>
            <Checkbox onChange={onSelect} checked={isSelected} />
            <span className={'octicon octicon-three-bars'} />
          </div>
          <p style={slugTextStyle}>{text}</p>
          <p>{date}</p>
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

const DndSlug = DropTarget(ItemTypes.SLUG, cardTarget, (connect) => ({
  connectDropTarget: connect.dropTarget()
}))(DragSource(ItemTypes.SLUG, cardSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))(Slug));

class DndSlugs extends Component {
  constructor(props) {
    super(props);
    this.updateCheckAllStatus = this.updateCheckAllStatus.bind(this);
    this.onSlugSelect = this.onSlugSelect.bind(this);
    this.onSlugRemoveByIndex = this.onSlugRemoveByIndex.bind(this);

    this.onSlugRemoveSelected = this.onSlugRemoveSelected.bind(this);
    this.onSelectAll = this.onSelectAll.bind(this);
    this.onSlugSort = this.onSlugSort.bind(this);
    this.renderDndSlugs = this.renderDndSlugs.bind(this);
    this.state = {
      isSelectAll: 'NONE'
    };
  }

  updateCheckAllStatus() {
    const { slugs } = this.props;
    let numSelected = 0;
    slugs.forEach((slug) => {
      if (slug && slug.isSelected) {
        numSelected++;
      }
    });

    let selectionStat = 'INDETERMINATE';
    if (numSelected === 0) {
      selectionStat = 'NONE';
    } else if (numSelected === slugs.length) {
      selectionStat = 'ALL';
    }

    this.setState({
      isSelectAll: selectionStat
    });
  }

  onSlugSelect(index) {
    const { slugs } = this.props;
    slugs[index].isSelected = !slugs[index].isSelected;

    this.setState(
      {
        slugs: slugs
      },
      this.updateCheckAllStatus
    );
  }

  onSlugRemoveByIndex(index) {
    const { slugs } = this.props;
    slugs.splice(index, 1);
    this.setState(
      {
        slugs: slugs
      },
      this.updateCheckAllStatus
    );
  }

  onSelectAll() {
    const { slugs } = this.props;
    const { isSelectAll } = this.state;
    let selectionStat;
    if (isSelectAll === 'NONE') {
      selectionStat = 'ALL';
    } else if (isSelectAll === 'ALL' || isSelectAll === 'INDETERMINATE') {
      selectionStat = 'NONE';
    }

    this.setState({
      slugs: slugs.map((slug) => {
        slug.isSelected = selectionStat === 'ALL';
        return slug;
      }),
      isSelectAll: selectionStat
    });
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

  onSlugSort(isAscending) {
    const { slugs } = this.props;
    this.setState({
      slugs: slugs.sort(function(slugA, slugB) {
        const dateDiff = new Date(slugB.date) - new Date(slugA.date);
        return (isAscending ? 1 : -1) * dateDiff;
      })
    });
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
          onSelect={() => this.onSlugSelect(index)}
          onRemove={() => this.onSlugRemoveByIndex(index)}
          isSelected={slug.isSelected}
          onSlugDrag={onSlugDrag}
        /> : null;
    });
  }

  render() {
    const slugStyle = {
      width: 600
    };

    return (
      <div style={slugStyle}>{this.renderDndSlugs()}</div>
    );
  }
}

const DndSlugsContainer = DragDropContext(HTML5Backend)(DndSlugs);

class SlugSelectionComponent extends Component {
  render() {
    const { slugs, onSlugDrag } = this.props;
    return (
      <div>
        {/* <SlugListHeader
          isSelectAll={isSelectAll}
          handleSelectAll={this.onSelectAll}
          handleRemoveSelected={this.onSlugRemoveSelected}
          handleSort={this.onSlugSort}
        /> */}
        <DndSlugsContainer slugs={slugs} onSlugDrag={onSlugDrag} />
      </div>
    );
  }
}

export default SlugSelectionComponent;
