import React, { Component, PropTypes } from 'react';

import { SlugListHeader } from './SlugListHeader';
import { DndSlugsContainer } from './SlugList';

const PickUp = Object.freeze({ NONE: 'NONE', INDETERMINATE: 'INDETERMINATE', ALL: 'ALL' });

class SlugSortComponent extends Component {
  render() {
    const { slugs, pickUpStatus, onPickUpSingle, onPickUpAll, onPickedUpRemove, onSort, onSlugDrag } = this.props;
    return (
      <div>
        <SlugListHeader
          disabled={!(Array.isArray(slugs) && slugs.length > 0)}
          pickUpStatus={pickUpStatus}
          onPickUpAll={onPickUpAll}
          onPickedUpRemove={onPickedUpRemove}
          onSort={onSort}
        />
        <DndSlugsContainer slugs={slugs} onSlugDrag={onSlugDrag} onPickUpSingle={onPickUpSingle} />
      </div>
    );
  }
}

SlugSortComponent.propTypes = {
  onPickUpAll: PropTypes.func.isRequired,
  onPickUpSingle: PropTypes.func.isRequired,
  onPickedUpRemove: PropTypes.func.isRequired,
  onSlugDrag: PropTypes.func.isRequired,
  onSort: PropTypes.func.isRequired,
  pickUpStatus: PropTypes.string.isRequired,
  slugs: PropTypes.array.isRequired,
};

export { PickUp, SlugSortComponent };
