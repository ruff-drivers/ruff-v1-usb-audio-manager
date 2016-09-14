/*!
 * Copyright (c) 2016 Nanchao Inc.
 * All rights reserved.
 */
'use strict';

var fs = require('fs');

var soundCheckPath = '/sound';
var cardDirPattern = /card[0-9]+/;

function getCardDir(checkedPath, cardDirPattern) {
    var items = fs.readdirSync(checkedPath);
    for (var i = 0; i < items.length; i++) {
        if (cardDirPattern.test(items[i])) {
            return items[i];
        }
    }
    return null;
}

function getCardName(checkedPath, cardDir, devNamePattern) {
    var soundPath = checkedPath + '/' + cardDir;
    var items = fs.readdirSync(soundPath);
    for (var i = 0; i < items.length; i++) {
        var result = devNamePattern.exec(items[i]);
        if (result !== null) {
            return result[1] + ',' + result[2];
        }
    }
    return null;
}

function checkAvailable(devPath, pcmDevNamePattern) {
    var checkedPath = devPath + soundCheckPath;
    try {
        fs.statSync(checkedPath);
    } catch (error) {
        return null;
    }

    var cardDir = getCardDir(checkedPath, cardDirPattern);
    if (cardDir === null) {
        return null;
    }
    return getCardName(checkedPath, cardDir, pcmDevNamePattern);
}

exports.checkAvailable = checkAvailable;
