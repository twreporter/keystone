import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import { DragSource, DropTarget, DragDropContext } from 'react-dnd';
import { Checkbox } from 'elemental';
import ItemTypes from './ItemTypes';

import update from 'react/lib/update';
import HTML5Backend from 'react-dnd-html5-backend';

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

    // Determine rectangle on screen
    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();

    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

    // Determine mouse position
    const clientOffset = monitor.getClientOffset();

    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;

    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%

    // Dragging downwards
    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
      return;
    }

    // Dragging upwards
    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      return;
    }

    // Time to actually perform the action
    props.moveSlug(dragIndex, hoverIndex);

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex;
  }
};

const SLUGS = [
  {
    id: 1,
    isSelected: false,
    text: 'migrant-workers-death-in-taiwan',
    date: '2021/12/25 12:25'
  },
  {
    id: 2,
    isSelected: false,
    text: 'child-health-care-taiwan',
    date: '2021/11/25 12:25'
  },
  {
    id: 3,
    isSelected: false,
    text: 'fpc-sixth-naphtha-cracker-20-years',
    date: '2021/3/25 12:25'
  },
  {
    id: 4,
    isSelected: false,
    text: '2017-taipei-golden-horse-film-festival',
    date: '2021/09/25 12:25'
  },
  {
    id: 5,
    isSelected: false,
    text: 'transfer-of-sovereignty-over-hong-kong-20years',
    date: '2021/8/25 12:25'
  },
  {
    id: 6,
    isSelected: false,
    text: '0206earthquake',
    date: '2021/7/25 12:25'
  }
];

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
  moveSlug: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired
};

const DndSlug = DropTarget(ItemTypes.SLUG, cardTarget, (connect) => ({
  connectDropTarget: connect.dropTarget()
}))(DragSource(ItemTypes.SLUG, cardSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))(Slug));

class SlugListItems extends Component {
  constructor(props) {
    super(props);
    this.moveSlug = this.moveSlug.bind(this);
    this.updateCheckAllStatus = this.updateCheckAllStatus.bind(this);
    this.onSlugSelect = this.onSlugSelect.bind(this);
    this.onSlugRemoveByIndex = this.onSlugRemoveByIndex.bind(this);

    this.onSlugRemoveSelected = this.onSlugRemoveSelected.bind(this);
    this.onSelectAll = this.onSelectAll.bind(this);
    this.onSlugSort = this.onSlugSort.bind(this);
    this.state = {
      slugs: SLUGS,
      isSelectAll: 'NONE'
    };
  }

  moveSlug(dragIndex, hoverIndex) {
    const { slugs } = this.state;
    const dragSlug = slugs[dragIndex];

    this.setState(
      update(this.state, {
        slugs: {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragSlug]
          ]
        }
      })
    );
  }

  updateCheckAllStatus() {
    const { slugs } = this.state;
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
    const { slugs } = this.state;
    slugs[index].isSelected = !slugs[index].isSelected;

    this.setState(
      {
        slugs: slugs
      },
      this.updateCheckAllStatus
    );
  }

  onSlugRemoveByIndex(index) {
    const { slugs } = this.state;
    slugs.splice(index, 1);
    this.setState(
      {
        slugs: slugs
      },
      this.updateCheckAllStatus
    );
  }

  onSelectAll() {
    const { slugs, isSelectAll } = this.state;
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
    const { slugs } = this.state;
    this.setState(
      {
        slugs: slugs.filter((slug) => slug && !slug.isSelected)
      },
      this.updateCheckAllStatus
    );
  }

  onSlugSort(isAscending) {
    const { slugs } = this.state;
    this.setState({
      slugs: slugs.sort(function(slugA, slugB) {
        const dateDiff = new Date(slugB.date) - new Date(slugA.date);
        return (isAscending ? 1 : -1) * dateDiff;
      })
    });
  }

  render() {
    const { slugs, isSelectAll } = this.state;
    const slugStyle = {
      width: 600
    };

    return (
      <div style={slugStyle}>
        <SlugListHeader
          isSelectAll={isSelectAll}
          handleSelectAll={this.onSelectAll}
          handleRemoveSelected={this.onSlugRemoveSelected}
          handleSort={this.onSlugSort}
        />
        {slugs.map((slug, index) => {
          return (
            <DndSlug
              key={slug.id}
              index={index}
              id={slug.id}
              text={slug.text}
              date={slug.date}
              onSelect={() => this.onSlugSelect(index)}
              onRemove={() => this.onSlugRemoveByIndex(index)}
              isSelected={slug.isSelected}
              moveSlug={this.moveSlug}
            />
          );
        })}
      </div>
    );
  }
}

const SlugListItemsDnDContainer = DragDropContext(HTML5Backend)(SlugListItems);

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

    const { isSelectAll } = this.props;

    return (
      <div style={style}>
        <div style={slugControlStyle}>
          <Checkbox
            onChange={this.onSelectAll}
            checked={isSelectAll === 'ALL'}
            indeterminate={isSelectAll === 'INDETERMINATE'}
          />
          <button onClick={this.onRemoveSelected}><span className={'octicon octicon-trashcan'} /></button>
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

class SlugSelectionComponent extends Component {
  render() {
    return (
      <div>
        <SlugListItemsDnDContainer />
      </div>
    );
  }
}

export default SlugSelectionComponent;
