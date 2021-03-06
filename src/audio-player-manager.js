/*!
 * Copyright (c) 2016 Nanchao Inc.
 * All rights reserved.
 */
'use strict';

var usbDevice = require('usb-manager');
var checkAvailable = require('./manager-helper').checkAvailable;
var AudioPlayer = require('./audio-player');

var DRIVER_NAME = 'snd_usb_audio';
var playerNamePattern = /pcmC([0-9]+)D([0-9])p/;

module.exports = usbDevice({
    attach: function (callback, context) {
        try {
            this.kernelModule = this.kernelModule || (context && context.kernelModule) || require('kernel-module');
            this.kernelModule.install(DRIVER_NAME);
            callback && callback();
        } catch (error) {
            callback && callback(error);
        }
    },
    detach: function (callback) {
        try {
            this.kernelModule.remove(DRIVER_NAME);
            callback && callback();
        } catch (error) {
            callback && callback(error);
        }
    },
    createDevice: function (devPath, options) {
        var devInfo = checkAvailable(devPath, playerNamePattern);
        if (devInfo !== null) {
            return options.audioDevice || new AudioPlayer({
                dev: devInfo
            });
        }
        return null;
    }
});
