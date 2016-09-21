# USB Audio Manager for Ruff

This module provides usb audio device capture and playback feature for Ruff.

## Supported Engines

* Ruff: >=1.5.0 <1.6.0


## Installation

Run the following command to install module:

```
rap install ruff-v1-usb-audio-manager
```

## Usage

### Installing a manager

Audio driver has 2 working modes: Capture and Playback. Capture mode reads data from audio device, and Playback mode writes data into audio device. The mode to use is based on your application.

Audio driver is based on [USB Manager](https://rap.ruff.io/raps/usb-manager). You need to install the corresponding manager to USB before your usage.

```
var audioManager = require('ruff-v1-usb-audio-manager');

var capturerManager = new audioManager.CapturerManager();
var playerManager = new audioManager.PlayerManager();

$('#usb').install(capturerManager, playerManager);
```

### Capture mode

With Capture mode, the manager will create a capturer when an USB audio device is mounted. The following example shows how to record 5 seconds voice into a file.

```
var sampleFile = '/tmp/test.mono.pcm';

capturerManager.on('mount', function (capturer) {
    $('#button-k2').on('push', function () {
        var fd = fs.openSync(sampleFile, 'w');
        var offset = 0;

        capturer.on('data', function (buffer) {
            fs.writeSync(fd, buffer, 0, buffer.length, offset);
            offset += buffer.length;
        });

        capturer.start({
            rate: 44100,
            channels: 1,
            bits: 16
        });

        setTimeout(function () {
            capturer.stop();
            fs.closeSync(fd);
            console.log('capture finished');
        }, 5000);
    });
});

```

### Playback mode

With Playback mode, the manager will create a player when an USB audio device is mounted. The following example shows how to play the voice from a file.

```
playerManager.on('mount', function (player) {
    $('#button-k3').on('push', function () {
        console.log('button-k3 push');

        var fileReadStream = fs.createReadStream(sampleFile, { highWaterMark: 1024 * 2 });
        player.on('full', function () {
            fileReadStream.pause();
        });

        player.on('drain', function () {
            fileReadStream.resume();
        });


        fileReadStream.on('data', function (data) {
            player.feed(data);
        });

        fileReadStream.on('close', function () {
            player.close();
        });

        player.start({
            rate: 44100,
            channels: 1,
            bits: 16
        });
    });
});
```

## API Reference

### Options

The typical options example should like this:

```
options = {
    card : '0,0',
    channels : 2,
    rate : 44100,
    bits : 16
}

```
* **card** is the audio card name and device name, like '0,0'. Audio-Manager module could specify the name automaticlly as soon as the hardware was plugged, however You can specify the name manually.
* **channels** is read or write audio tracks, by default, read is mono track, and write is stereo.
* **rate** is the sample rate, the driver supports [8000, 16000, 441000, 48000] sample rate.
* **bits** is the PCM audio bit depth, only supports 16bit so far.

Options is the user media parameters, for example, your play voice is 44100Hz, 2channels, 16bits wav file, then options should be seted as it. If audio hardware not support the media parameters, it would throw an exception.

### Capture mode

#### Methods

#### `Capturer(options)`
Create a capturer object.

#### `start(options)`
Start to read data from audio device continuously, until call stop()

#### `stop()`
Stop to capture data, until call start().

#### `close()`
close audio device, and can not start anymore. For restart to read, you should create a other Capture object.

####Events
#### `data`

Hardware read audio data is asynchronous, once get enought data, will emit data event and trigger callback with audio data as an argument.

### Playback mode
#### Methods

#### `Playback(options)`
Create a player object.


#### `feed(buffer)`
feed buffer data to player object.

#### `close()`

Close audio device, and can not start anymore. For restart to write, you should create a other player object.

#### Events
#### `drain`

If there is no more data feed to player for a long time, it will emit drain event once, and you should better trigger outer feed object to give more data to writer.


#### `full`

If you put too much data to player, it will emit full event once, and it suggests you stop feed data to player temporarily. However, it just a suggestion to stop, not necessary.

## Contributing

Contributions to this project are warmly welcome. But before you open a pull request, please make sure your changes are passing code linting and tests.

You will need the latest Ruff SDK to install rap dependencies and then to run tests.

###Installing Dependencies

rap install

###Running Tests

ruff test

##License

The MIT License (MIT)

Copyright (c) 2016 Nanchao Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
