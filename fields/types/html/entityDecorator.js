'use strict';

import { CompositeDecorator } from 'draft-js';
import linkDecorator from './link/linkDecorator';
import imageDecorator from './image/imageDecorator';
import React from 'react';

const decorator = new CompositeDecorator([ linkDecorator, imageDecorator
]);

export default decorator;
