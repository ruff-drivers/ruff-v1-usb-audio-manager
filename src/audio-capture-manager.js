//audio-capture-manager.js

'use strict';

var kernelModule = require('kernel-module');
var usbDevice = require('device-manager');
var fs = require('fs');
var Dir = require('_file').Dir;

var Audio = require('./audioCapture');
var DEV_PATH = '/dev/snd/';

var DRIVER_NAME = 'snd_usb_audio'
var SOUND_CHECK_PATH = '/sound';
var cardNameRegExp = /card[0-9]+/;
var pcmDevNameRegExp = /pcmC([0-9]+)D([0-9])c/;


function checkAvailable(devPath) {
    var checkedPath = devPath + SOUND_CHECK_PATH;
    try {
        fs.statSync(checkedPath);
        var dir = new Dir(checkedPath);
        var items = dir.listSync(checkedPath);
        var cardname = null;
        var pcmDevName = null;
        for (var i = 0; i < items.length; i++) {
            if (cardNameRegExp.exec(items[i].name) !== null) {
                cardname = items[i].name;
                break;
            }
        }
        var soundPath = checkedPath + '/' + cardname;
        dir = new Dir(soundPath);
        items = dir.listSync(soundPath);
        for (i = 0; i < items.length; i++) {
            var result = pcmDevNameRegExp.exec(items[i].name);
            if (result !== null) {
                pcmDevName = result[1] + ',' + result[2];
                break;
            }
        }
        return pcmDevName;
    } catch (error) {
        return null;
    }
}

var prototype = {
    attach: function (callback) {
        try {
            kernelModule.install(DRIVER_NAME);
            callback && callback();
        } catch (error) {
            callback && callback(error);
        }
    },
    detach: function (callback) {
        try {
            kernelModule.remove(DRIVER_NAME);
            callback && callback();
        } catch (error) {
            callback && callback(error);
        }
    },
    createDevice: function (devPath) {
        var devInfo = checkAvailable(devPath);
        if (devInfo !== null) {
            return Alsa.Capture({
                dev: devInfo
            });
        }

        return null;
    }
};

module.exports = usbDevice(prototype);
