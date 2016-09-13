/*!
 * Copyright (c) 2016 Nanchao Inc.
 * All rights reserved.
 */
'use strict';

var fs = require('fs');

var soundCheckPath = '/sound';
var cardNamePattern = /card[0-9]+/;

function checkAvailable(devPath, pcmDevNamePattern) {
    var checkedPath = devPath + soundCheckPath;
    try {
        fs.statSync(checkedPath);
    } catch (error) {
        return null;
    }

    var cardName = null;
    var items = fs.readdirSync(checkedPath);
    for (var i = 0; i < items.length; i++) {
        if (cardNamePattern.test(items[i])) {
            cardName = items[i];
        }
    }
    if (cardName === null) {
        return null;
    }

    var soundPath = checkedPath + '/' + cardName;
    items = fs.readdirSync(soundPath);
    for (var j = 0; j < items.length; j++) {
        var result = pcmDevNamePattern.exec(items[j]);
        if (result !== null) {
            return result[1] + ',' + result[2];
        }
    }
    return null;
}

exports.checkAvailable = checkAvailable;
