'use strict';

import { CompositeDecorator } from 'draft-js';
import linkDecorator from './link/linkDecorator';
import React from 'react';

const decorator = new CompositeDecorator([ linkDecorator]);

export default decorator;
