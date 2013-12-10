# ishosc
Drive Brad Frost's [ish.](http://bradfrostweb.com/demo/ish/) with a "remote control". Some background: the ish. interface elements are mapped to OSC messages which are sent and received by an OSC app. The message handling is done by a local web server via socket.io (browser/server communication).

## Getting Started
### Installing via GitHub
Install the git repository. Install the related node modules with `npm install`.

## Documentation
This repository contains a modified ish. 2 version. I removed the PHP dependencies and replaced the functionality with JavaScript and added the socket.io module and some JavaScript for the message sending between ish. and the background web server.

### Start ishosc
To start the tool from the command line you may "change directory" into the `ishosc` folder and type `node ./lib/ishosc.js`. With this command you start a local node web server with socket.io and the OSC server. You may then open the URL "http://localhost:8080" in your browser to start ish.

### The OSC server and client
The OSC interface needs the **OSC server** IP and port and the **OSC client** IP and port information. These values can be set as command line parameters or in the config file. You may edit `config.js` or `src/config.coffee` to set the parameters. If you  work with CoffeeScript you may compile the src with the command line command `grunt coffee`.

#### The config parameters / command line parameters
The `-h` command line parameter will show the following description and default values:

````
Open your browser to remote control Brad Frost's ish.
Usage: node ./lib/ishosc.js

Options:
  -p  Set the node.js web server port
      [default: 8080]
  -s  Set the OSC server port
      [default: 8000]
  -i  Set the OSC server IP
      [default: "123.001.001.002"]
  -c  Set the OSC client port
      [default: 8001]
  -j  Set the OSC client IP
      [default: "123.001.001.003"]
  -u  The URL for the initially opened web page
      [default: "http://bradfrostweb.com/blog/post/ish-2-0/"]
  -b  Set the browser to open and run ish. (OS X only, Safari or "Google Chrome")
      [default: ""]
  -x  Set the browser window width (OS X only, Safari or "Google Chrome")
      [default: 1920]
  -y  Set the browser window height (OS X only, Safari or "Google Chrome")
      [default: 1076]
  -d  1 - Show debug messages
      [default: 0]
  -h  This help
````

### An OSC client
To remote control ish. you use an OSC client - you may use any OSC client. The client must send the OSC messages the ishosc server is listening to. Part of this repository is the `touchOSC/ish2.touchosc` layout file with the control elements for the "TouchOSC" app for iOS and Android from [hexler.net](http://hexler.net). To install the layout file you need the free [TouchOSC Editor](http://hexler.net/software/touchosc#downloads) for Mac OS X, Windows or Linux. You may download the TouchOSC Editor, open the `ish2.touchosc` layout in the editor and send it to TouchOSC on your device.

If you want to create your own **OSC client** you may check the messages the **OSC server** listens to in the file `src/ishosc.coffee`.

#### The TouchOSC layout
The TouchOSC layout offers 3 pages

The **first** page with buttons to trigger the **S**mall-ish, **M**edium-ish, **L**arge-ish, **Random**, **Disco** and **Hay** ish. buttons.

![OSC page 1](https://raw.github.com/uhunkler/ishosc/master/documentation/images/OSCpage1.png)

The **second** page with buttons to fine tune the ish. viewport width in three step sizes: 1px plus and minus, 1em plus and minus, 5em plus and minus. Similar to the use of the curser arrows in the px and em field in ish.

![OSC page 2](https://raw.github.com/uhunkler/ishosc/master/documentation/images/OSCpage2.png)

The **third** page offers a big round control to modify the ish. viewport width with your thumb or fingers.

![OSC page 3](https://raw.github.com/uhunkler/ishosc/master/documentation/images/OSCpage3.png)

All three pages offer a display to show the actual ish. viewport  width in px and em.

The first two pages map ish. controls, the round control on the third page offers a different way to interact with ish.

### Comfort settings for OS X
For the Mac I added AppleScripts to open Safari or Google Chrome, set the browser window to full screen width and open ish. automatically displaying a preset web page. This way you just start ishosc and get the browser running ish. and your selected web page ready to work with. I start ishosc for example with an [Alfred](http://www.alfredapp.com) workflow by typing "ishosc" into the Alfred dialog and can start to use ish. remotely from my mobile device on the web page I am working with - fast and convenient.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Lint your code using [Grunt](http://gruntjs.com/).

## Release History
Initial release - version 0.1.0.

## License
Copyright (c) 2013 Urs Hunkler
Licensed under the MIT license.
