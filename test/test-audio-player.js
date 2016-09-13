/*!
 * Copyright (c) 2016 Nanchao Inc.
 * All rights reserved.
 */

'use strict';
var assert = require('assert');
var mock = require('ruff-mock');

var AudioPlayer = require('../src/audio-player');

var any = mock.any;
var anyMock = mock.anyMock;
var atLeast = mock.atLeast;
var never = mock.never;
var verify = mock.verify;
var when = mock.when;

require('t');

describe('Test for Playback Driver of Audio Device', function () {
    var alsa;
    var buffer;
    var player;

    beforeEach(function () {
        alsa = anyMock();
        buffer = new Buffer('mock object');
        player = new AudioPlayer({
            card: '0,0',
            channels: 1,
            rate: 48000,
            bits: 16
        }, alsa);

        when(alsa).open(any, any, any, any, any).thenReturn(true);
        when(alsa).write(any, any, Function).then(function (any, buffer, callback) {
            callback(undefined);
        });

        player.start();
    });

    afterEach(function () {
        if (player) {
            player.close();
        }
    });

    it('should emit fulled event when feed many data', function (done) {
        player.once('full', function () {
            process.nextTick(function () {
                verify(alsa, atLeast(1)).write(any, any, Function);
                done();
            });
        });

        for (var i = 0; i < player._highWaterMark * 2; i++) {
            player.feed(buffer);
        }
    });

    it('should emit drain event one time when feed less data', function (done) {
        player.on('drain', function () {
            process.nextTick(function () {
                verify(alsa, atLeast(1)).write(any, any, Function);
                done();
            });
        });

        for (var i = 0; i < 2; i++) {
            player.feed(buffer);
        }
    });

    it('closed would never emmit any event', function (done) {
        player.on('full', function () {
            assert(false);
        });
        player.on('drain', function () {
            assert(false);
        });
        player.close();

        var i;
        for (i = 0; i < 2; i++) {
            player.feed(buffer);
        }
        for (i = 0; i < player._highWaterMark * 2; i++) {
            player.feed(buffer);
        }
        verify(alsa, never()).write(any, Function);
        done();
    });
});

require('test').run(exports);
