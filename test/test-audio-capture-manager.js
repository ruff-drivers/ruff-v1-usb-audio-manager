/*!
 * Copyright (c) 2016 Nanchao Inc.
 * All rights reserved.
 */

'use strict';
var assert = require('assert');
var mock = require('ruff-mock');
var path = require('path');

var CaptureManager = require('../src/audio-capture-manager');

var any = mock.any;
var anyMock = mock.anyMock;
var once = mock.once;
var verify = mock.verify;

require('t');

describe('Test for Capture Driver of Audio Device', function () {
    var manager;
    var context = {};
    beforeEach(function () {
        context.kernelModule = anyMock();
        manager = new CaptureManager();
    });

    it('should trigger install method when call attach', function (done) {
        manager.attach(undefined, context);
        verify(context.kernelModule, once()).install(any);
        done();
    });

    it('should trigger remove method when call detach', function (done) {
        manager.attach(undefined, context);
        manager.detach(undefined, context);
        verify(context.kernelModule, once()).remove(any);
        done();
    });

    it('should get AudioCapture object when call createDevice', function (done) {
        var audioDevice = anyMock();
        var devPath = path.join(__dirname, 'dev');
        manager = new CaptureManager({ audioDevice: audioDevice });
        manager.on('mount', function (capturer) {
            assert.deepEqual(capturer, audioDevice);
            done();
        });
        manager.mountDevice(devPath);
    });

    it('should not emit mount event when give invalid devPath', function (done) {
        var audioDevice = anyMock();
        var devPath = path.join(__dirname, 'dev_');
        manager = new CaptureManager({ audioDevice: audioDevice });
        manager.on('mount', function () {
            assert(false);
        });
        manager.mountDevice(devPath);
        setTimeout(done, 100);
    });
});
