'use strict';

export const ENTITY = {
  ANNOTATION: {
    type: 'ANNOTATION',
  },
  BLOCKQUOTE: {
    type: 'BLOCKQUOTE',
  },
  LINK: {
    type: 'LINK',
  },
  INFOBOX: {
    type: 'INFOBOX',
  },
  EMBEDDEDCODE: {
    type: 'EMBEDDEDCODE',
  },
  AUDIO: {
    type: 'AUDIO',
  },
  IMAGE: {
    type: 'IMAGE',
  },
  IMAGEDIFF: {
    type: 'IMAGEDIFF',
  },
  IMAGELINK: {
    type: 'IMAGELINK',
  },
  SLIDESHOW: {
    type: 'SLIDESHOW',
    slideshowSelectionLimit: 50,
  },
  YOUTUBE: {
    type: 'YOUTUBE',
  },
};

export const ENTITY_SIMPLE = {
  ANNOTATION: {
    type: 'ANNOTATION',
  },
  LINK: {
    type: 'LINK',
  },
  IMAGE: {
    type: 'IMAGE',
  },
  IMAGELINK: {
    type: 'IMAGELINK',
  },
};

export const ENTITY_EMBEDEDONLY = {
  EMBEDDEDCODE: {
    type: 'EMBEDDEDCODE',
  },
};


export default ENTITY;
