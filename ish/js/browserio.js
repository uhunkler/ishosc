(function() {
  var $sizeEm, $sizePx, keydown, socket;

  $sizePx = $('.sg-size-px');

  $sizeEm = $('.sg-size-em');

  /*
   * Send a keydown event to the element given the first parameter.
   *
   * @PARAM {object}  ele  The jQuery element the keydown event is sent to
   * @PARAM {int}     key  The key number for the keydown event,
   *                       defaults to the return key
  */


  keydown = function(ele, key) {
    var e;
    if (key == null) {
      key = 13;
    }
    e = $.Event("keydown", {
      keyCode: 13
    });
    return ele.trigger(e);
  };

  /*
   * Set a submit event listener on the URL field
   *
   * When the user enters an URL and submits the form
   * the script sets the src attribute of the iframe holding the web page
  */


  $('#setUrl').on('submit', function(e) {
    var src;
    e.preventDefault();
    src = $('#url').val();
    if (src.indexOf('http://') === 0) {
      return $('#sg-viewport').attr('src', src);
    }
  });

  /*
   * Set a transitionend event listener on the viewport element
   *
   * When the CSS transition ends the event is fired by the browser.
   * Read the viewport width and send the pixel value back to node.
  */


  $('#sg-viewport').on('transitionend', function() {
    return socket.emit('sendWidth', $('#sg-viewport').width());
  });

  /*
   * Set a keydown event listener on the px value element
   *
   * On arrow key up or down in the field get the pixel value and send it back
   * as the new viewport width.
  */


  $sizePx.on("keydown", function(e) {
    var val;
    if (e.keyCode === 38 || e.keyCode === 40) {
      val = Math.floor($(this).val());
      return socket.emit('sendWidth', val);
    }
  });

  /*
   * Set a keydown event listener on the em value element
   *
   * On arrow key up or down in the field get the em value,
   * calculate the pixel value and send it back as the new viewport width.
   * The pixel value is calculated by em * 16 (The default font size in the browser).
  */


  $sizeEm.on("keydown", function(e) {
    var val;
    if (e.keyCode === 38 || e.keyCode === 40) {
      val = Math.floor($(this).val() * 16);
      return socket.emit('sendWidth', val);
    }
  });

  socket = io.connect('http://localhost');

  /*
   * Set a jsCmd event listener on the socket to get the messages from node
   *
   * Each event triggers the related ish. interface action. The ish. interface responds
   * the same way as it resonds on user actions.
   * The node backend sends messages when it recieves OSC messages from the OSC client.
  */


  socket.on('jsCmd', function(data) {
    var src;
    switch (data.cmd) {
      case "size-s":
        return $("#sg-size-s").click();
      case "size-m":
        return $("#sg-size-m").click();
      case "size-l":
        return $("#sg-size-l").click();
      case "size-xl":
        return $("#sg-size-xl").click();
      case "size-random":
        return $("#sg-size-random").click();
      case "size-disco":
        return $("#sg-size-disco").click();
      case "size-hay":
        return $("#sg-size-hay").click();
      case "size-viewport":
        $sizePx.val(data.val);
        return keydown($sizePx);
      case "size-plus5em":
        $sizePx.val(parseInt($sizePx.val()) + 80);
        return keydown($sizePx);
      case "size-plus1em":
        $sizePx.val(parseInt($sizePx.val()) + 16);
        return keydown($sizePx);
      case "size-plus1px":
        $sizePx.val(parseInt($sizePx.val()) + 1);
        return keydown($sizePx);
      case "size-minus1px":
        $sizePx.val(parseInt($sizePx.val()) - 1);
        return keydown($sizePx);
      case "size-minus1em":
        $sizePx.val(parseInt($sizePx.val()) - 16);
        return keydown($sizePx);
      case "size-minus5em":
        $sizePx.val(parseInt($sizePx.val()) - 80);
        return keydown($sizePx);
      case "set-url":
        src = data.val;
        if (src.indexOf('http://') === 0) {
          return $('#sg-viewport').attr('src', src);
        }
    }
  });

}).call(this);
