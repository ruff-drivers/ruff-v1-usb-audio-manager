'use strict';

var EE = require('events');
var util = require('util');
var Playback = require('./alsa.js').Playback;
var fs = require('fs');


function AudioPlayer(options) {
    EE.call(this);
    this._options = {
        card: options && options.dev || '0,0',
        bit: 16
    };
    this._decoder = options.decoder;
    this._player = null;
}
util.inherits(AudioPlayer, EE);

AudioPlayer.prototype.setDecoder = function (decoder) {
    this._decoder = decoder;
};

AudioPlayer.prototype.play = function (path) {
    var self = this;
    if (this._playing) {
        this.stop();
    }

    this._playing = true;
    this._stream = fs.createReadStream(path, {
        highWaterMark: 2 * 1024
    });

    this._stream.on('data', function (data) {
        self._decoder.decode(data);
    });

    this._decoder.on('format', function (format) {
        self._alsa = new Playback({
            card: format.card,
            channels: format.channels,
            rate: format.rate,
            bits: format.bits
        });

        self._alsa.on('full', function () {
            self._stream.pause();
        });

        self._alsa.on('drain', function () {
            self._stream.resume();
        });

        self._decoder.on('data', function (data) {
            self._alsa.feed(data);
        });
    });
};

AudioPlayer.prototype.pause = function () {
    if (this._stream) {
        this._stream.pause();
    }

    this._playing = false;
};

AudioPlayer.prototype.resume = function () {
    if (this._stream) {
        this._stream.resume();
        this._playing = true;
    }
};

AudioPlayer.prototype.stop = function () {
    this._stream = null;
    this._playing = false;
};

module.exports = AudioPlayer;
