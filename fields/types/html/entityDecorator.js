'use strict';

import { CompositeDecorator } from 'draft-js';
import linkDecorator from './linkDecorator';
import React from 'react';

const decorator = new CompositeDecorator([{
    strategy: linkDecorator.strategy,
    component: linkDecorator.component
}]);

export default decorator;
