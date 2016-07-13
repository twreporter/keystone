'use strict';

import { CompositeDecorator } from 'draft-js';
import linkDecorator from './link/link-decorator';
import quoteDecorator from './quote/quote-decorator';
import React from 'react'; // eslint-disable-line no-unused-vars

const decorator = new CompositeDecorator([linkDecorator, quoteDecorator]);

export default decorator;
