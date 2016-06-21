'use strict';

const ENTITY = {
    annotation: {
        type: 'annotation'
    },
    link: {
        type: 'link'
    },
    infobox: {
        type: 'infobox'
    },
    embeddedCode: {
        type: 'embeddedCode'
    },
    audio: {
        type: 'audio',
        requiredProps: [ 'id', 'coverPhoto', 'description', 'filetype', 'title', 'url' ]
    },
    image: {
        type: 'image',
        requiredProps: ['id', 'url', 'description', 'width', 'height', 'resizedTargets']
    },
    imageDiff: {
        type: 'imageDiff'
    },
    slideshow: {
        type: 'slideshow',
        slideshowSelectionLimit: 30
    }
};


export default ENTITY;
