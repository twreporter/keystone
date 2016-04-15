'use strict';

const constant = {
    slideshowSelectionLimit: 30,
    imageRequiredProps: ['id', 'url', 'description', 'width', 'height']
};

const entityType = {
    embeddedCode: 'embeddedCode',
    link: 'link',
    image: 'image',
    imageDiff: 'imageDiff',
    slideshow: 'slideshow'
};


export {  constant, entityType };
