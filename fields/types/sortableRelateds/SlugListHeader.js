import React, { Component } from 'react';
import { Checkbox } from 'elemental';

import { PickUp } from './SlugSortComponent';

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

const SortOrder = Object.freeze({ ASCENDING: 1, DESCENDING: 2 });

class SlugListHeader extends Component {
  constructor(props) {
    super(props);
    this.onPickUpAll = this.onPickUpAll.bind(this);
    this.onPickedUpRemove = this.onPickedUpRemove.bind(this);
    this.onSort = this.onSort.bind(this);
    this.state = { sortOrder: SortOrder.ASCENDING };
  }

  onPickUpAll() {
    const { onPickUpAll } = this.props;
    if (onPickUpAll) {
      onPickUpAll();
    }
  }

  onPickedUpRemove() {
    const { onPickedUpRemove } = this.props;
    if (onPickedUpRemove) {
      onPickedUpRemove();
    }
  }

  onSort() {
    const { sortOrder } = this.state;
    const { onSort } = this.props;
    const isAscending = sortOrder === SortOrder.ASCENDING;
    this.setState({ sortOrder: isAscending ? SortOrder.DESCENDING : SortOrder.ASCENDING }, () => onSort(isAscending));
  }

  render() {
    const { sortOrder } = this.state;
    const { disabled, pickUpStatus } = this.props;
    return (
      <div style={style}>
        <div style={slugControlStyle}>
          <Checkbox
            disabled={disabled}
            onChange={this.onPickUpAll}
            checked={pickUpStatus === PickUp.ALL}
            indeterminate={pickUpStatus === PickUp.INDETERMINATE}
          />
          <button type="button" className="ItemList__control ItemList__control--delete-no-focus" disabled={disabled} onClick={this.onPickedUpRemove}><span className={'octicon octicon-trashcan'} /></button>
        </div>
        <p style={slugTextStyle}>{'文章Slug'}</p>
        <div style={dateStyle}>
          {'發布日期'}
          <button type="button" className="ItemList__control--sort-date" disabled={disabled} onClick={this.onSort}>
            <span
              style={sortOrder === SortOrder.ASCENDING ? caretDownStyle : caretUpStyle}
            ></span>
          </button>
        </div>
      </div>
    );
  }
}

export { SlugListHeader };
