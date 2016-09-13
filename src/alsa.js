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

function AlsaCapture(options, _alsa) {
    EE.call(this);
    this._alsa = _alsa || require('./alsa.so');
    this._handle = this._alsa.open(
                            options.card,
                            options.channels,
                            options.rate,
                            options.bits,
                            MODES.PCM_IN);
    this._state = STATES.IDLE;
    this._read = this._read.bind(this);
    this._doCapture = false;
}
util.inherits(AlsaCapture, EE);

AlsaCapture.prototype._read = function () {
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

AlsaCapture.prototype.start = function () {
    this._doCapture = true;
    if (this._state === STATES.IDLE) {
        process.nextTick(this._read);
    }
};

AlsaCapture.prototype.stop = function () {
    this._doCapture = false;
    this._state = STATES.IDLE;
};

AlsaCapture.prototype.close = function () {
    this.stop();
    this._alsa.close(this._handle);
    this._state = STATES.CLOSE;
};

function AlsaPlayback(options, _alsa) {
    EE.call(this);
    this._alsa = _alsa || require('./alsa.so');
    this._handle = this._alsa.open(
                            options.card,
                            options.channels,
                            options.rate,
                            options.bits,
                            MODES.PCM_OUT);
    this._state = STATES.IDLE;
    this._pcmBuffers = [];
    this._lowWaterMark = 16;
    this._highWaterMark = 64;
    this._write = this._write.bind(this);
    this.offset = 0;
}
util.inherits(AlsaPlayback, EE);

AlsaPlayback.prototype.feed = function (buf) {
    if (this._pcmBuffers.length >= this._highWaterMark && this._waterMarkStatus !== 'fulled') {
        this._waterMarkStatus = 'fulled';
        this.emit('full');
    }
    this.offset += buf.length;
    if (this._state !== STATES.CLOSE) {
        this._pcmBuffers.push(util._toDuktapeBuffer(buf));
    }

    if (this._state === STATES.IDLE && this._pcmBuffers.length > 0) {
        process.nextTick(this._write);
    }
};

AlsaPlayback.prototype._write = function () {
    if (this._pcmBuffers.length <= 0) {
        this._state = STATES.IDLE;
        return;
    }

    var buffer = this._pcmBuffers.shift();
    this._state = STATES.WRITING;

    this._alsa.write(this._handle, buffer, this._write);

    if (this._pcmBuffers.length <= this._lowWaterMark && this._waterMarkStatus !== 'drained') {
        this._waterMarkStatus = 'drained';
        this.emit('drain');
    }
};

AlsaPlayback.prototype.close = function () {
    this._alsa.close(this._handle);
    this._state = STATES.CLOSE;
};

module.exports.Capture = AlsaCapture;
module.exports.Playback = AlsaPlayback;
