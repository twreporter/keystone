'use strict';

import {List, Repeat} from 'immutable';
import {
  BlockMapBuilder,
  CharacterMetadata,
  ContentBlock,
  EditorState,
  Entity,
  Modifier,
  genKey,
} from 'draft-js';
import {pick} from 'lodash';
import CONSTANT from '../../CONSTANT';

export default (editorState, images) => {
  var contentState = editorState.getCurrentContent();
  var selectionState = editorState.getSelection();

  var afterRemoval = Modifier.removeRange(
    contentState,
    selectionState,
    'backward'
  );

  var targetSelection = afterRemoval.getSelectionAfter();
  var afterSplit = Modifier.splitBlock(afterRemoval, targetSelection);
  var insertionTarget = afterSplit.getSelectionAfter();

  var asMedia = Modifier.setBlockType(afterSplit, insertionTarget, 'media');

  var entityKey = Entity.create(
    CONSTANT.slideshow,
    'IMMUTABLE',
    {
        images: images.map((image) => {
            return pick(image, CONSTANT.imageRequiredProps)
        }),
        type: CONSTANT.slideshow
    }
  );

  var charData = CharacterMetadata.create({entity: entityKey});

  var fragmentArray = [
    new ContentBlock({
      key: genKey(),
      type: 'media',
      text: ' ',
      characterList: List(Repeat(charData, 1)),
    }),
    new ContentBlock({
      key: genKey(),
      type: 'unstyled',
      text: '',
      characterList: List(),
    }),
  ];

  var fragment = BlockMapBuilder.createFromArray(fragmentArray);

  var withMedia = Modifier.replaceWithFragment(
    asMedia,
    insertionTarget,
    fragment
  );

  var newContent = withMedia.merge({
    selectionBefore: selectionState,
    selectionAfter: withMedia.getSelectionAfter().set('hasFocus', true),
  });

  return EditorState.push(editorState, newContent, 'insert-fragment');
}
