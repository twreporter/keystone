'use strict';

const ENTITY = {
	annotation: {
		type: 'ANNOTATION',
	},
	blockQuote: {
		type: 'BLOCKQUOTE',
	},
	link: {
		type: 'LINK',
	},
	infobox: {
		type: 'INFOBOX',
	},
	embeddedCode: {
		type: 'EMBEDDED',
	},
	audio: {
		type: 'AUDIO',
	},
	image: {
		type: 'IMAGE',
	},
	imageDiff: {
		type: 'IMAGEDIFF',
	},
	slideshow: {
		type: 'SLIDESHOW',
		slideshowSelectionLimit: 30,
	},
	youtube: {
		type: 'YOUTUBE',
	},
};


export default ENTITY;
