# Alsa Audio Driver for Ruff

This driver module provides audio device capture and playback feature for Ruff.

##Supported Engines

* Ruff: >=1.4.0 <1.5.0


## Installing
Execute following command to install

```
rap install alsa
```


##Usage

Alsa has 2 working mode, Capture mode and Playback mode. Capture mode read data from audio device, and Playback mode write data to audio device.
###Capture mode
```
var Alsa = require('alsa');
var fs = require('fs');

var pcmOptions = {
    card: '0,0',
    channels: 1,
    rate: 48000,
    bits: 16
};

var fileWriteStream = fs.createWriteStream('/tmp/audio.raw');

var capturer = new Alsa.Capture(pcmOptions);
reader.on("data", function(buffer) {
    fileWriteStream.write(buffer);
});

reader.start();

setTimeout(function() {
    reader.stop();
}, 5000);

```

###Playback mode
```
var Alsa = require('alsa');
var fs = require('fs');

var pcmOptions = {
        card: '0,0',
        channels: 1,
        rate: 48000,
        bits: 16
    };

var testfile = '/tmp/audio.raw';
var player = new Alsa.Playback(pcmOptions); 
var fileReadStream = fs.createReadStream(testfile);  

player.on("full", function () {
    fileReadStream.pause();
});

player.on( "drain", function () {
    fileReadStream.resume();
});

fileReadStream.on('data', function(data){
    player.feed(data);
});
```


##API References

###Options

```
options = {
    card, 
    channels,
    rate,
    bits
}
```
* card is the audio card name and device name, like '0,0'. Audio-manager module could specify the name automaticlly as soon as the hardware was plugged, however You can specify the name manually.
* channels is read or write audio tracks, by default, read is mono track, and write is stereo.
* rate is the sample rate, the driver supports [8000, 16000, 441000, 48000] sample rate.
* bits is the PCM audio bit depth, only supports 16bit so far.


###Methods
####Capture mode

```
Capture(options)
```
Create an Alsa Capture object.

```
start()
```
Start to read data from audio device continuously, until call stop()


```
stop()
```
Stop to read data, until call start().


```
close()
```
close audio device, and can not start anymore. For restart to read, you should create a other Alsa Capture object.

####Playback mode

```
Playback(options)
```
Create an Alsa Playback object.

```
feed(buffer)
```
feed buffer data to Alsa Writer.


```
close()
```
close audio device, and can not start anymore. For restart to write, you should create a other Alsa Playback object.


###Events

####Capture mode
```
on('data', callback);
```
hardware read audio data is asynchronous, once get enought data, will emit data event and trigger callback with audio data as an argument.


####Playback mode
```
on('drain', callback);
```
If there is no more data feed to writer for a long time, it will emit drain event once, and you should better trigger outer feed object to give more data to writer.


```
on('full', callback);
```
If you put too much data to writer, it will emit full event once, and it suggests you stop feed data to writer temporarily. However, it just a suggestion to stop, not necessary.



##Contributing

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
