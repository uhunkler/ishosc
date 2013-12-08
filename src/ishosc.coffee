###
 * ishosc
 * https://github.com/urshunkler2/ishosc
 *
 * Copyright (c) 2013 Urs Hunkler
 * Licensed under the MIT license.
###

"use strict";

# Load the basic modules for command line handling
path = require("path")
optimist = require("optimist")
config = require("../config.js")
debug = 0

# set up the command line hanling
argv = optimist
  .usage("Open your browser to remote control Brad Frost's ish.\nUsage: $0")
  .describe({
    p: "Set the node.js web server port"
    s: "Set the OSC server port"
    i: "Set the OSC server IP"
    c: "Set the OSC client port"
    j: "Set the OSC client IP"
    u: "The URL for the initally opened web page"
    b: "Set the browser to open and run ish. (OS X only, Safari or \"Google Chrome\")"
    x: "Set the browser window width (OS X only, Safari or \"Google Chrome\")"
    y: "Set the browser window height (OS X only, Safari or \"Google Chrome\")"
    d: "1 - Show debug messages"
    h: "This help"
    })
    .default(config)
    .argv

# Set the debug state
debug = 1 if argv.d

# Change the optimist description output to display the [default: value] information
# in the line below the setting explanation
printhelp = (info) ->
  pattern = /\s*\[/g
  console.log info.replace(pattern, "\n      [")

# Print the description when arg "-h" is given
if argv.h
  optimist.showHelp(printhelp)
  return true

# Initialize the web server and socket.io for the browser communication
express = require("express")
app = express()
server = require("http").createServer(app)
io = require("socket.io").listen(server)

# Initialize the OSC server
osc = require("node-osc")

# Open the given browser when arg -b "browsername" is given
# via AppleScript
unless argv.b is "Google Chrome" or argv.b is "Safari"
  argv.b = "Google Chrome"

if argv.b
  applescript = require("applescript")
  console.log "   info  - open browser " + argv.b

  # The AppleScript to open and initatize Safari
  if argv.b is "Safari"
    as = """
    tell application "Safari"
        activate
        if not (exists (document 1)) then
            tell application "System Events" to tell process "Safari" to click menu item "New Window" of menu "File" of menu bar 1
        end if
        set bounds of window 1 to {0, 22, #{argv.x}, #{argv.y}}
        set the URL of document 1 to "http://localhost:#{argv.p}"
        "   info  - Safari opened with window bounds: {0, 22, #{argv.x}, #{argv.y}}"
    end tell
    """
  # The AppleScript to open and initatize Google Chrome
  else if argv.b is "Google Chrome"
    as = """
    tell application "Google Chrome"
        activate
        -- set _windows to get windows
        -- if length of _windows is 0 then make new window
        if not (exists (window 1)) then make new window
        set bounds of window 1 to {0, 22, #{argv.x}, #{argv.y}}
        set the URL of active tab of window 1 to "http://localhost:#{argv.p}"
        "   info  - Google Chrome opened with window bounds: {0, 22, #{argv.x}, #{argv.y}}"
    end tell
    """

  # If the AppleScript code is set send it to the browser
  # via the "applescript" module's execString method
  if as?
    applescript.execString(as, (err, rtn) ->
      if err?
        # Something went wrong!
        throw err
      else
        # the return value
        console.log rtn
    )

# Set up and start a web server
console.log "   info  - server listening on http://localhost:" + argv.p
server.listen(argv.p)

# Set the web server routes
app.use(app.router)
app.use("/", express.static(path.join(__dirname, "../ish")))
app.use("/ish/css", express.static(path.join(__dirname, "../ish/css")))
app.use("/ish/js", express.static(path.join(__dirname, "../ish/js")))

# Set up an OSC server and an OSC client
oscServer = new osc.Server(argv.s, argv.i)
client = new osc.Client(argv.j, argv.c)

# Set the debugging level
unless debug
  io.set("log level", 1) # reduce logging

# Start the socke.io communication with the browser
io.sockets.on("connection", (socket) ->
  # Set up a listener for the width sent from the browser,
  # get the value and send it to the OSC client elements
  socket.on("sendWidth", (data) ->
    # console.log data
    px = data + "px"
    em = (data / 16) + "em"
    show = px + ", " + em
    normVal = data / argv.x
    val = Math.floor(normVal * 100) + "%"
    client.send "/1/hfader", normVal
    client.send "/1/hfadervalue", val
    client.send "/1/value", "#{show}"
    client.send "/2/hfader", normVal
    client.send "/2/value", "#{show}"
    client.send "/2/hfadervalue", val
    client.send "/3/hfader", normVal
    client.send "/3/value", "#{show}"
    client.send "/3/rotary", normVal
    client.send "/3/rotaryvalue", val
  )

  # Send the initial document URL to the browser
  if (argv.u and argv.u.indexOf("http://") is 0)
    socket.emit("jsCmd", {cmd: "set-url", val: argv.u})

  # Set a basic large width
  socket.emit("jsCmd", {cmd: "size-l", val: 0})

  # lLsten for incomming OSC messages
  oscServer.on("message", (msg) ->
    # For debugging print the OSC messge
    if debug
      console.log "TUIO message:", msg

    ###
     * Parse the OSC message and send the related command
     * to the browser
    ###
    if Array.isArray(msg) and msg.length > 0 and msg[1]
      switch msg[0]
        when "/1/small"
            socket.emit("jsCmd", {cmd: "size-s", val: 0})

        when "/1/medium"
            socket.emit("jsCmd", {cmd: "size-m", val: 0})

        when "/1/large"
            socket.emit("jsCmd", {cmd: "size-l", val: 0})

        when "/1/hay"
            socket.emit("jsCmd", {cmd: "size-hay", val: 0})

        when "/1/random"
            socket.emit("jsCmd", {cmd: "size-random", val: 0})

        when "/1/disco"
            socket.emit("jsCmd", {cmd: "size-disco", val: 0})

        when "/1/hfader", "/2/hfader", "/3/hfader", "/3/rotary"
            # console.log msg[1]
            val = Math.floor(msg[1] * 100) + "%"
            widthVal = Math.floor(argv.x * msg[1])
            socket.emit("jsCmd", {cmd: "size-viewport", val: widthVal})
            client.send("/1/hfadervalue", val)
            client.send("/2/hfadervalue", val)
            client.send("/3/rotary", msg[1])
            client.send("/3/rotaryvalue", val)

        when "/2/plus5em"
            socket.emit("jsCmd", {cmd: "size-plus5em", val: 0})

        when "/2/plus1em"
            socket.emit("jsCmd", {cmd: "size-plus1em", val: 0})

        when "/2/plus1px"
            socket.emit("jsCmd", {cmd: "size-plus1px", val: 0})

        when "/2/minus1px"
            socket.emit("jsCmd", {cmd: "size-minus1px", val: 0})

        when "/2/minus1em"
            socket.emit("jsCmd", {cmd: "size-minus1em", val: 0})

        when "/2/minus5em"
            socket.emit("jsCmd", {cmd: "size-minus5em", val: 0})

        else
  )
  return true
)

exports.ishosc = ->
  return @
