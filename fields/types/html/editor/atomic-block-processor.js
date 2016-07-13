import _ from 'lodash';
// import sizeOf from 'image-size';
import ApiDataInstance from './api-data-instance';
import ENTITY from './entities';

const processor = {
	convertBlock (entityMap, block) {
		let alignment = 'center';
		let content;
		let entityRange = block.entityRanges[0];
		const entity = entityMap[entityRange.key];
		const type = entity && entity.type;
		switch (type) {
			case ENTITY.annotation.type:
			case ENTITY.audio.type:
			case ENTITY.blockQuote.type:
			case ENTITY.embeddedCode.type:
			case ENTITY.image.type:
			case ENTITY.infobox.type:
			case ENTITY.slideshow.type:
			case ENTITY.imageDiff.type:
				alignment = entity.data && entity.data.alignment || alignment;
				content = _.get(entity, 'data');
				content = Array.isArray(content) ? content : [content];
				break;
			default:
				return;
		}
		return new ApiDataInstance({ id: block.key, alignment, type, content });
	},
};

export default processor;
