import _ from 'lodash';
import http from 'https';
import url from 'url';
// import sizeOf from 'image-size';
import ApiDataInstance from './ApiDataInstance';
import { ENTITY } from './CONSTANT';

/*
function getImageSize(imageUrl) {
    return new Promise((resolve, reject) => {
        imageUrl = url.parse(imageUrl);
        https.get(options, (response) => {
            let chuncks = [];
            response.on('data', (chunk) => {
                chunks.push(chunk);
            })
            .on('end', () => {
                let buffer = Buffer.concat(chunks);
                // resolve(sizeOf(buffer));
                resolve({});
            })
            .on('error', (err) => {
                reject(err);
            });
        });
    });
    }
    */

function getResizedImageUrls(imageObj) {
    let desktop = '';
    let mobile = '';
    let tablet = '';
    let original = '';
    if (imageObj){
        desktop = _.get(imageObj, [ 'resizedTargets', 'desktop', 'url' ], imageObj.url);
        mobile = _.get(imageObj, [ 'resizedTargets', 'mobile', 'url' ], imageObj.url);
        tablet = _.get(imageObj, [ 'resizedTargets', 'tablet', 'url' ], imageObj.url);
        original =  _.get(imageObj, [ 'url' ]);
    }
    return {
        desktop,
        mobile,
        tablet,
        original
    };
}

const processor = {
    convertBlock(entityMap, block) {
        let alignment = 'center';
        let content;
        let entityRange = block.entityRanges[0];
        const entity = entityMap[entityRange.key];
        const type = entity && entity.type;
        switch (type) {
            case ENTITY.infobox.type:
                alignment = entity.data && entity.data.alignment || alignment;
                content = [ {
                    title: entity.data.title,
                    body: entity.data.body
                }];
                break;
            case ENTITY.embeddedCode.type:
                alignment = entity.data && entity.data.alignment || alignment;
                content = [ {
                    caption: entity.data.caption,
                    embeddedCode: entity.data.embeddedCode
                }];
                break;
            case ENTITY.slideshow.type:
            case ENTITY.imageDiff.type:
                alignment = entity.data && entity.data.alignment || alignment;
                content = this.convertImagesBlock(entity);
                break;
            case ENTITY.image.type:
                alignment = entity.data && entity.data.alignment || alignment;
                content = [this.convertImageBlock(entity)];
                break;
            default:
                return;
        }
        return new ApiDataInstance({alignment, type, content})
    },

    convertImageBlock(entity) {
        let image = entity.data || {};
        let rtn = {};
        let urls = getResizedImageUrls(image);
        Object.keys(urls).forEach((device) => {
            rtn[device] = _.merge({url: urls[device]}, _.pick(image, ['id', 'description']));
        });
        return rtn;
    },

    convertImagesBlock(entity) {
        let images = Array.isArray(entity.data.images) ? entity.data.images : [];
        return this._convertImagesBlock(images);
    },

    _convertImagesBlock(images) {
        return images.map((image) => {
            let imageSet = {};
            let urls = getResizedImageUrls(image);
            Object.keys(urls).forEach((device) => {
                imageSet[device] = _.merge({url: urls[device]}, _.pick(image, ['id', 'description']));
            });
            return imageSet;
        });
    }
};

export default processor;
