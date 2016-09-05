// audioPlayer.js
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
     PCM_OUT : 0x00000000,
     PCM_IN : 0x10000000
};

function AudioPlayer(options, _alsa) {
    EE.call( this );
    this._alsa = _alsa || require('./alsa.so');
    this._handle = null;
    this._card = options && options.dev || '0,0';
    this._options = options;
    this._lowWaterMark = 16; // each frame
    this._highWaterMark = 64; // each frame
    this._write = this._write.bind(this);
    this.offset = 0;
}
util.inherits(AudioPlayer, EE);



AudioPlayer.prototype.start = function(options) {
    if(!this._handle){
        var _options = options || this._options;
        this._handle = this._alsa.open(
                        this._card,
                        _options.channels,
                        _options.rate,
                        _options.bits,
                        MODES.PCM_OUT);
        this._state = STATES.IDLE;
        this._pcmBuffers = [];
    }
};


AudioPlayer.prototype.feed = function (buf) {
    if (this._pcmBuffers.length >= this._highWaterMark
        && this._waterMarkStatus !== 'fulled') {
        this._waterMarkStatus = 'fulled';
        this.emit("full");
    }
    this.offset += buf.length;
    if (this._state !== STATES.CLOSE) {
        this._pcmBuffers.push(util._toDuktapeBuffer(buf));
    }

    if (this._state === STATES.IDLE && this._pcmBuffers.length > 0) {
        process.nextTick(this._write);
    }
};

AudioPlayer.prototype._write = function() {
    if ( this._pcmBuffers.length <= 0 ) {
        this._state = STATES.IDLE;
        return;
    }

    var buffer = this._pcmBuffers.shift();
    this._state = STATES.WRITING;
    var self = this;

    //this._alsa.write( this._handle, buffer, this._write );

    this._alsa.write(this._handle, buffer, function() {
        self._write();
    });


    if ( this._pcmBuffers.length <= this._lowWaterMark
        && this._waterMarkStatus != 'drained'
    ) {
        this._waterMarkStatus = 'drained';
        this.emit("drain");
    }
};

AudioPlayer.prototype.close = function() {
    this._alsa.close(this._handle);
    this._state = STATES.CLOSE;
    this._handle = null;
};

module.exports = AudioPlayer;
