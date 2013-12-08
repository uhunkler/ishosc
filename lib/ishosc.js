/*
 * ishosc
 * https://github.com/urshunkler2/ishosc
 *
 * Copyright (c) 2013 Urs Hunkler
 * Licensed under the MIT license.
*/

"use strict";
var app, applescript, argv, as, client, config, debug, express, io, optimist, osc, oscServer, path, printhelp, server;

path = require("path");

optimist = require("optimist");

config = require("../config.js");

debug = 0;

argv = optimist.usage("Open your browser to remote control Brad Frost's ish.\nUsage: $0").describe({
  p: "Set the node.js web server port",
  s: "Set the OSC server port",
  i: "Set the OSC server IP",
  c: "Set the OSC client port",
  j: "Set the OSC client IP",
  u: "The URL for the initally opened web page",
  b: "Set the browser to open and run ish. (OS X only, Safari or \"Google Chrome\")",
  x: "Set the browser window width (OS X only, Safari or \"Google Chrome\")",
  y: "Set the browser window height (OS X only, Safari or \"Google Chrome\")",
  d: "1 - Show debug messages",
  h: "This help"
})["default"](config).argv;

if (argv.d) {
  debug = 1;
}

printhelp = function(info) {
  var pattern;
  pattern = /\s*\[/g;
  return console.log(info.replace(pattern, "\n      ["));
};

if (argv.h) {
  optimist.showHelp(printhelp);
  return true;
}

express = require("express");

app = express();

server = require("http").createServer(app);

io = require("socket.io").listen(server);

osc = require("node-osc");

if (!(argv.b === "Google Chrome" || argv.b === "Safari")) {
  argv.b = "Google Chrome";
}

if (argv.b) {
  applescript = require("applescript");
  console.log("   info  - open browser " + argv.b);
  if (argv.b === "Safari") {
    as = "tell application \"Safari\"\n    activate\n    if not (exists (document 1)) then\n        tell application \"System Events\" to tell process \"Safari\" to click menu item \"New Window\" of menu \"File\" of menu bar 1\n    end if\n    set bounds of window 1 to {0, 22, " + argv.x + ", " + argv.y + "}\n    set the URL of document 1 to \"http://localhost:" + argv.p + "\"\n    \"   info  - Safari opened with window bounds: {0, 22, " + argv.x + ", " + argv.y + "}\"\nend tell";
  } else if (argv.b === "Google Chrome") {
    as = "tell application \"Google Chrome\"\n    activate\n    -- set _windows to get windows\n    -- if length of _windows is 0 then make new window\n    if not (exists (window 1)) then make new window\n    set bounds of window 1 to {0, 22, " + argv.x + ", " + argv.y + "}\n    set the URL of active tab of window 1 to \"http://localhost:" + argv.p + "\"\n    \"   info  - Google Chrome opened with window bounds: {0, 22, " + argv.x + ", " + argv.y + "}\"\nend tell";
  }
  if (as != null) {
    applescript.execString(as, function(err, rtn) {
      if (err != null) {
        throw err;
      } else {
        return console.log(rtn);
      }
    });
  }
}

console.log("   info  - server listening on http://localhost:" + argv.p);

server.listen(argv.p);

app.use(app.router);

app.use("/", express["static"](path.join(__dirname, "../ish")));

app.use("/ish/css", express["static"](path.join(__dirname, "../ish/css")));

app.use("/ish/js", express["static"](path.join(__dirname, "../ish/js")));

oscServer = new osc.Server(argv.s, argv.i);

client = new osc.Client(argv.j, argv.c);

if (!debug) {
  io.set("log level", 1);
}

io.sockets.on("connection", function(socket) {
  socket.on("sendWidth", function(data) {
    var em, normVal, px, show, val;
    px = data + "px";
    em = (data / 16) + "em";
    show = px + ", " + em;
    normVal = data / argv.x;
    val = Math.floor(normVal * 100) + "%";
    client.send("/1/hfader", normVal);
    client.send("/1/hfadervalue", val);
    client.send("/1/value", "" + show);
    client.send("/2/hfader", normVal);
    client.send("/2/value", "" + show);
    client.send("/2/hfadervalue", val);
    client.send("/3/hfader", normVal);
    client.send("/3/value", "" + show);
    client.send("/3/rotary", normVal);
    return client.send("/3/rotaryvalue", val);
  });
  if (argv.u && argv.u.indexOf("http://") === 0) {
    socket.emit("jsCmd", {
      cmd: "set-url",
      val: argv.u
    });
  }
  socket.emit("jsCmd", {
    cmd: "size-l",
    val: 0
  });
  oscServer.on("message", function(msg) {
    var val, widthVal;
    if (debug) {
      console.log("TUIO message:", msg);
    }
    /*
     * Parse the OSC message and send the related command
     * to the browser
    */

    if (Array.isArray(msg) && msg.length > 0 && msg[1]) {
      switch (msg[0]) {
        case "/1/small":
          return socket.emit("jsCmd", {
            cmd: "size-s",
            val: 0
          });
        case "/1/medium":
          return socket.emit("jsCmd", {
            cmd: "size-m",
            val: 0
          });
        case "/1/large":
          return socket.emit("jsCmd", {
            cmd: "size-l",
            val: 0
          });
        case "/1/hay":
          return socket.emit("jsCmd", {
            cmd: "size-hay",
            val: 0
          });
        case "/1/random":
          return socket.emit("jsCmd", {
            cmd: "size-random",
            val: 0
          });
        case "/1/disco":
          return socket.emit("jsCmd", {
            cmd: "size-disco",
            val: 0
          });
        case "/1/hfader":
        case "/2/hfader":
        case "/3/hfader":
        case "/3/rotary":
          val = Math.floor(msg[1] * 100) + "%";
          widthVal = Math.floor(argv.x * msg[1]);
          socket.emit("jsCmd", {
            cmd: "size-viewport",
            val: widthVal
          });
          client.send("/1/hfadervalue", val);
          client.send("/2/hfadervalue", val);
          client.send("/3/rotary", msg[1]);
          return client.send("/3/rotaryvalue", val);
        case "/2/plus5em":
          return socket.emit("jsCmd", {
            cmd: "size-plus5em",
            val: 0
          });
        case "/2/plus1em":
          return socket.emit("jsCmd", {
            cmd: "size-plus1em",
            val: 0
          });
        case "/2/plus1px":
          return socket.emit("jsCmd", {
            cmd: "size-plus1px",
            val: 0
          });
        case "/2/minus1px":
          return socket.emit("jsCmd", {
            cmd: "size-minus1px",
            val: 0
          });
        case "/2/minus1em":
          return socket.emit("jsCmd", {
            cmd: "size-minus1em",
            val: 0
          });
        case "/2/minus5em":
          return socket.emit("jsCmd", {
            cmd: "size-minus5em",
            val: 0
          });
      }
    }
  });
  return true;
});

exports.ishosc = function() {
  return this;
};
