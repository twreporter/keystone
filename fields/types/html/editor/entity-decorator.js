'use strict';

import { CompositeDecorator } from '@twreporter/draft-js';
import React from 'react'; // eslint-disable-line no-unused-vars
import annotationDecorator from './annotation/annotation-decorator';
import linkDecorator from './link/link-decorator';
import quoteDecorator from './quote/quote-decorator';

const decorator = new CompositeDecorator([
  annotationDecorator,
  linkDecorator,
  quoteDecorator,
]);

export default decorator;
