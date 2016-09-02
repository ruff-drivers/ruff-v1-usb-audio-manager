//audioCapture.js
/* jshint -W097 */
/* jshint node: true */
'use strict';

var EE = require('events');
var util = require('util');
var Alsa = require('./alsa.js');


function AudioCapture(options, _mock) {
    EE.call(this);
    this._options = {
        card : options && options.dev || options.card || '0,0',
    };
    this._recorder = null;
    this._captureMock = _mock || null;
}
util.inherits(AudioCapture, EE);


AudioCapture.prototype.start = function(options, callback) {
    this._options.rate = options && options.rate || 48000;
    this._options.channels = options && options.channel || 1;
    this._options.bit = 16;
    if (!this._recorder) {
        this._recorder = this._captureMock || new Alsa.Capture(this._options, this._mock);
    }

    var self = this;
    this._recorder.on('data', function(buffer) {
        if (callback) {
            setImmediate(function() {
                callback(buffer);
            });
        } else {
            self.emit('data', buffer);
        }
    });
    this._recorder.startCapture();
};

AudioCapture.prototype.stop = function(options) {
    if (this._recorder) {
        this._recorder.stop();
        this._recorder.close();
        this._recorder = null;
    }
};

module.exports = AudioCapture;
