import _ from 'lodash';
import http from 'https';
import url from 'url';
// import sizeOf from 'image-size';
import ApiDataInstance from './api-data-instance';
import ENTITY from './entities';

const processor = {
    convertBlock(entityMap, block) {
        let alignment = 'center';
        let content;
        let entityRange = block.entityRanges[0];
        const entity = entityMap[entityRange.key];
        const type = entity && entity.type;
        switch (type) {
            case ENTITY.annotation.type:
                alignment = entity.data && entity.data.alignment || alignment;
                content = [ {
                    text: entity.data.text,
                    annotation: entity.data.annotation,
                    draftRawObj: entity.data.draftRawObj
                } ];
                break;
            case ENTITY.audio.type:
                alignment = entity.data && entity.data.alignment || alignment;
                content = [ _.get(entity, 'data') ];
                break;
            case ENTITY.infobox.type:
                alignment = entity.data && entity.data.alignment || alignment;
                content = [ {
                    title: entity.data.title,
                    body: entity.data.body,
                    draftRawObj: entity.data.draftRawObj
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
                content = _.get(entity, ['data', 'images'], [])
                break;
            case ENTITY.image.type:
                alignment = entity.data && entity.data.alignment || alignment;
                content = [ _.get(entity, 'data') ];
                break;
            default:
                return;
        }
        return new ApiDataInstance({id: block.key, alignment, type, content})
    },
};

export default processor;
