use strict';

import { CompositeDecorator } from 'draft-js';
import imageDecorator from './image/imageDecorator';
import linkDecorator from './link/linkDecorator';
import React from 'react';

const decorator = new CompositeDecorator([ linkDecorator, imageDecorator
]);

export default decorator;
