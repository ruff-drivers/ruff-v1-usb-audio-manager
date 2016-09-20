/*!
 * Copyright (c) 2016 Nanchao Inc.
 * All rights reserved.
 */

'use strict';

var EE = require('events');
var util = require('util');

var STATES = {
    IDLE: 0,
    READING: 2,
    CLOSE: 3
};

var PCM_IN_MODE = 0x10000000;

function AudioCapturer(options, _alsa) {
    EE.call(this);
    this._alsa = _alsa || require('./alsa.so');
    this._card = options && options.dev || '0,0';
    this._options = options;
    this._handle = null;
    this._state = STATES.IDLE;
    this._read = this._read.bind(this);
    this._doCapture = false;
}
util.inherits(AudioCapturer, EE);

AudioCapturer.prototype._read = function () {
    if (this._doCapture === false) {
        return;
    }
    this._state = STATES.READING;
    var that = this;
    this._alsa.read(this._handle, function (err, buffer) {
        if (err) {
            throw new Error('read buffer error');
        }

        if (that._doCapture) {
            that.emit('data', new Buffer(buffer));
            process.nextTick(that._read);
        }
    });
};

AudioCapturer.prototype.start = function (options) {
    if (!this._handle) {
        var _options = options || this._options;
        this._handle = this._alsa.open(
                        this._card,
                        _options.channels,
                        _options.rate,
                        _options.bits,
                        PCM_IN_MODE);
    }

    this._doCapture = true;
    if (this._state === STATES.IDLE) {
        process.nextTick(this._read);
    }
};

AudioCapturer.prototype.stop = function () {
    this._doCapture = false;
    this._state = STATES.IDLE;
};

AudioCapturer.prototype.close = function () {
    this.stop();
    this._alsa.close(this._handle);
    this._state = STATES.CLOSE;
    this._handle = null;
};

module.exports = AudioCapturer;
