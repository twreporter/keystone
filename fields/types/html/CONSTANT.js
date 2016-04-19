'use strict';

const ENTITY = {
    embeddedCode: {
        type: 'embeddedCode',
    },
    link: {
        type: 'link'
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
