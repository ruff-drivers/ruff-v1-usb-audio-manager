// test_alsa_reader.js
/* jshint -W097 */
/* jshint node: true */
'use strict';
var Alsa = require('../js/alsa.js');
var assert = require('assert');
var ruffMock = require('ruff-mock');
var anyMock = ruffMock.anyMock;
var when = ruffMock.when;
var any = ruffMock.any;
var times = ruffMock.times;
var atLeast = ruffMock.atLeast;
var once = ruffMock.once;
var verify = ruffMock.verify;
var never = ruffMock.never;
var spy = ruffMock.spy;
require('t');


var mockString = 'mock object';

describe('Test for Capture Driver of Audio Device', function () {

    var capturer = null;
    var alsaMock = null;
    var pcmOptions = {
            card: '0,0',
            channels: 1,
            rate: 48000,
            bits: 16
        };

    beforeEach(function(){
        // var alsaMock = ruffMock(mockTarget, true);
        alsaMock = anyMock();
        capturer = new Alsa.Capture(pcmOptions, alsaMock);
    });

    afterEach(function(){
        if(capturer){
            capturer.close();
        }
    });


    it('should done when init with valid params', function(done) {
        var _alsa = anyMock();
        var capturer = new Alsa.Capture(pcmOptions, _alsa);        
        verify(_alsa, once()).open('0,0', 1, 48000, 16, 0x10000000);
        done();
    });


    it('should throw exception when init with invalid params', function(done) {
        var _alsa = anyMock();
        when(_alsa).open(any, any, any, any, any).thenThrow(new Error('error'));
        
        assert.throws(function() {
            var capturer = new Alsa.Capture(pcmOptions, _alsa);
        }, Error);
        done();
    });


    it('should emit data event when call start', function (done) {
        when(alsaMock).read(any, Function).then(function(any, callback){
            callback(undefined, mockString);
        });

        capturer.start();
        capturer.on("data", function(buffer) {
            assert.equal(buffer, mockString);
            done();
        });
    });


    it('should not emit data event when call stopCapture', function (done) {

        when(alsaMock).read(any, Function).then(function(any, callback){
            console.log('then arguments:', arguments);
            setTimeout(function(){
                callback(undefined, mockString);
            }, 10);
        });

        capturer.on("data", function(buffer) {
            assert(false);
        });

        capturer.start();
        capturer.stop();
        verify(alsaMock, never()).read(any, Function);
        done();
    });

    it('start and stop can call many times', function(done) {

        when(alsaMock).read(any, Function).then(function(any, callback) {
            callback(undefined, mockString);
        });
        for (var i = 0; i < 3; i++) {
            capturer.start();
            capturer.stop();
        }
        capturer.start();
        capturer.once("data", function(buffer) {
            verify(alsaMock, once()).read(any, Function);
            done();
        });
    });


    it('should not emit data event after close device', function (done) {
        
        when(alsaMock).read(any, Function).then(function(any, callback) {
            callback(undefined, mockString);
        });

        capturer.close();
        capturer.start();
        verify(alsaMock, never()).read(any, Function);
        done();
    });
});



describe('Test for Playback Driver of Audio Device', function () {

    var player = null;
    var alsaMock = null;
    var pcmOptions = {
            card: '0,0',
            channels: 1,
            rate: 48000,
            bits: 16
        };
    var buffer = null;

    beforeEach(function(){
        alsaMock = anyMock();
        buffer = new Buffer(mockString);
        player = new Alsa.Playback(pcmOptions, alsaMock);
    });

    afterEach(function(){
        if(player){
            player.close();
        }
    });

    it('should emit fulled event when feed many data', function(done) {
        player.once("full", function(buffer) {
            verify(alsaMock, atLeast(0)).write(any, any, Function);
            done();
        });

        when(alsaMock).write(any, any, Function).then(function(any, buffer, callback) {
            callback(undefined);
        });

        for (var i = 0; i < player._highWaterMark * 2; i++) {
            player.feed(buffer);
        }
    });

    it('should emit drain event one time when feed less data', function (done) {
        player.on("drain", function(buffer) {
            verify(alsaMock, atLeast(0)).write(any, buffer, Function);
            done();
        });

        when(alsaMock).write(any, any, Function).then(function(any, buffer, callback) {
            callback(undefined);
        });
        
        for (var i = 0; i < 2; i++) {
            player.feed(buffer);
        }
    });

    it('closed would never emmit any event', function (done) {
        player.on("full", function(buffer) {
            assert(false);
        });
        player.on("drain", function(buffer) {
            assert(false);
        });
        when(alsaMock).write(any, any, Function).then(function(any, buffer, callback) {
            callback(undefined);
        });

        player.close();

        for (var i = 0; i < 10; i++) {
            player.feed(buffer);
        }
        for (var i = 0; i < player._highWaterMark * 2; i++) {
            player.feed(buffer);
        }
        verify(alsaMock, never()).write(any, Function);
        done();
    });

});

require('test').run(exports);
