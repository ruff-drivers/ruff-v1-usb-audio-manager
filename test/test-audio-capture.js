/*!
 * Copyright (c) 2016 Nanchao Inc.
 * All rights reserved.
 */

'use strict';

var assert = require('assert');
var mock = require('ruff-mock');

var AudioCapture = require('../src/audio-capture');

var any = mock.any;
var anyMock = mock.anyMock;
var never = mock.never;
var once = mock.once;
var verify = mock.verify;
var when = mock.when;

require('t');

describe('Test for Capture Driver of Audio Device', function () {
    var mockString = 'mock object';
    var capturer = null;
    var alsaMock = null;
    var pcmOptions = {
        card: '0,0',
        channels: 1,
        rate: 48000,
        bits: 16
    };

    beforeEach(function () {
        alsaMock = anyMock();
        capturer = new AudioCapture(pcmOptions, alsaMock);
    });

    afterEach(function () {
        if (capturer) {
            capturer.close();
        }
    });

    it('should done when init with valid params', function (done) {
        capturer.start();
        verify(alsaMock, once()).open('0,0', 1, 48000, 16, 0x10000000);
        done();
    });

    it('should throw exception when init with invalid params', function (done) {
        var _alsa = anyMock();
        when(_alsa).open(any, any, any, any, any).thenThrow(new Error('error'));

        assert.throws(function () {
            var capturer = new AudioCapture(pcmOptions, _alsa);
            capturer.start();
        }, Error);
        done();
    });

    it('should emit data event when call start', function (done) {
        when(alsaMock).read(any, Function).then(function (any, callback) {
            callback(undefined, mockString);
        });

        capturer.start();
        capturer.on('data', function (buffer) {
            assert.equal(buffer, mockString);
            done();
        });
    });

    it('should not emit data event when call stopCapture', function (done) {
        when(alsaMock).read(any, Function).then(function (any, callback) {
            setTimeout(function () {
                callback(undefined, mockString);
            }, 10);
        });

        capturer.on('data', function () {
            assert(false);
        });

        capturer.start();
        capturer.stop();
        verify(alsaMock, never()).read(any, Function);
        done();
    });

    it('start and stop can call many times', function (done) {
        when(alsaMock).read(any, Function).then(function (any, callback) {
            callback(undefined, mockString);
        });
        for (var i = 0; i < 3; i++) {
            capturer.start();
            capturer.stop();
        }
        capturer.start();
        capturer.once('data', function () {
            verify(alsaMock, once()).read(any, Function);
            done();
        });
    });

    it('should not emit data event after close device', function (done) {
        when(alsaMock).read(any, Function).then(function (any, callback) {
            callback(undefined, mockString);
        });

        capturer.close();
        capturer.start();
        verify(alsaMock, never()).read(any, Function);
        done();
    });
});
