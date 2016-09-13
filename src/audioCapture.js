'use strict';

var EE = require('events');
var util = require('util');

var STATES = {
    IDLE: 0,
    WRITING: 1,
    READING: 2,
    CLOSE: 3
};

var MODES = {
    PCM_OUT: 0x00000000,
    PCM_IN: 0x10000000
};

function AudioCapture(options, _alsa) {
    EE.call(this);
    this._alsa = _alsa || require('./alsa.so');
    this._card = options && options.dev || '0,0';
    this._options = options;
    this._handle = null;
    this._state = STATES.IDLE;
    this._read = this._read.bind(this);
    this._doCapture = false;
}
util.inherits(AudioCapture, EE); // alsa 继承了EE，alsa就有emit

AudioCapture.prototype._read = function () {
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

AudioCapture.prototype.start = function (options) {
    if (!this._handle) {
        var _options = options || this._options;
        this._handle = this._alsa.open(
                        this._card,
                        _options.channels,
                        _options.rate,
                        _options.bits,
                        MODES.PCM_IN);
    }

    this._doCapture = true;
    if (this._state === STATES.IDLE) {
        process.nextTick(this._read);
    }
};

AudioCapture.prototype.stop = function () {
    this._doCapture = false;
    this._state = STATES.IDLE;
};

AudioCapture.prototype.close = function () {
    this.stop();
    this._alsa.close(this._handle);
    this._state = STATES.CLOSE;
    this._handle = null;
};

module.exports = AudioCapture;
