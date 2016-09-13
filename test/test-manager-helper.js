/*!
 * Copyright (c) 2016 Nanchao Inc.
 * All rights reserved.
 */

'use strict';
var assert = require('assert');
var path = require('path');

var checkAvailable = require('../src/manager-helper').checkAvailable;

require('t');

describe('Test for Manager helper of Audio Device', function () {
    var devPath = path.join(__dirname, 'dev');
    var captureNamePattern = /pcmC([0-9]+)D([0-9])c/;
    var playerNamePattern = /pcmC([0-9]+)D([0-9])p/;

    it('should return pcm dev name success with valid params', function (done) {
        assert.equal(checkAvailable(devPath, captureNamePattern), '0,0');
        assert.equal(checkAvailable(devPath, playerNamePattern), '0,1');
        done();
    });

    it('should return null with invalid devPath', function (done) {
        var invalidPath = devPath + '_';
        assert.equal(checkAvailable(invalidPath, captureNamePattern), null);
        done();
    });
});

require('test').run(exports);
