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
    image: {
        type: 'image',
        imageRequiredProps: ['id', 'url', 'description', 'width', 'height']
    },
    imageDiff: {
        type: 'imageDiff'
    },
    slideshow: {
        type: 'slideshow',
        slideshowSelectionLimit: 30
    }
};


export { ENTITY };
