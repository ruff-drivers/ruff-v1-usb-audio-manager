// audioManager.js
'use strict';

var audioCaptureManager = require('./audio-capture-manager');
var audioPlayerManager = require('./audio-player-manager');


module.exports.CaptureManager = audioCaptureManager;
module.exports.PlayerManager = audioPlayerManager;
