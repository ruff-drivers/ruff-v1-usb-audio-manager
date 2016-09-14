/*!
 * Copyright (c) 2016 Nanchao Inc.
 * All rights reserved.
 */
'use strict';

var fs = require('fs');
var path = require('path');
var pattern = /^test[-].*[.]js$/;

fs.readdirSync(__dirname).forEach(function (element) {
    if (pattern.test(element) && element !== __filename) {
        require(path.join(__dirname, element));
    }
});
