'use strict';

import { Entity } from 'draft-js';
import {pick} from 'lodash';
import CONSTANT from '../../CONSTANT';

export default (editorState, blockKey, image) => {
  const content = editorState.getCurrentContent();
  const block = content.getBlockForKey(blockKey);
  const entityKey = block.getEntityAt(0);
  Entity.mergeData(entityKey, pick(image, CONSTANT.imageRequiredProps));
  return editorState;
}
