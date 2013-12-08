# Save a reference to the px and em value fields in variables
$sizePx = $('.sg-size-px')
$sizeEm = $('.sg-size-em')

###
 * Send a keydown event to the element given the first parameter.
 *
 * @PARAM {object}  ele  The jQuery element the keydown event is sent to
 * @PARAM {int}     key  The key number for the keydown event,
 *                       defaults to the return key
###
keydown = (ele, key = 13) ->
  e = $.Event("keydown", {keyCode: 13})
  ele.trigger(e)

###
 * Set a submit event listener on the URL field
 *
 * When the user enters an URL and submits the form
 * the script sets the src attribute of the iframe holding the web page
###
$('#setUrl').on('submit', (e) ->
  e.preventDefault()
  src = $('#url').val()
  if src.indexOf('http://') is 0
    $('#sg-viewport').attr('src', src)
)

###
 * Set a transitionend event listener on the viewport element
 *
 * When the CSS transition ends the event is fired by the browser.
 * Read the viewport width and send the pixel value back to node.
###
$('#sg-viewport').on('transitionend', ->
  socket.emit 'sendWidth', $('#sg-viewport').width()
)

###
 * Set a keydown event listener on the px value element
 *
 * On arrow key up or down in the field get the pixel value and send it back
 * as the new viewport width.
###
$sizePx.on("keydown", (e) ->
  if e.keyCode is 38 or e.keyCode is 40
    val = Math.floor($(this).val())
    socket.emit 'sendWidth', val
)

###
 * Set a keydown event listener on the em value element
 *
 * On arrow key up or down in the field get the em value,
 * calculate the pixel value and send it back as the new viewport width.
 * The pixel value is calculated by em * 16 (The default font size in the browser).
###
$sizeEm.on("keydown", (e) ->
  if e.keyCode is 38 or e.keyCode is 40
    val = Math.floor($(this).val() * 16)
    socket.emit 'sendWidth', val
)

# Activate the socket.io connection and save a reference in a variable
socket = io.connect('http://localhost')

###
 * Set a jsCmd event listener on the socket to get the messages from node
 *
 * Each event triggers the related ish. interface action. The ish. interface responds
 * the same way as it resonds on user actions.
 * The node backend sends messages when it recieves OSC messages from the OSC client.
###
socket.on('jsCmd', (data) ->
  # console.log data

  switch data.cmd
    when "size-s"
      $("#sg-size-s").click()

    when "size-m"
      $("#sg-size-m").click()

    when "size-l"
      $("#sg-size-l").click()

    when "size-xl"
      $("#sg-size-xl").click()

    when "size-random"
      $("#sg-size-random").click()

    when "size-disco"
      $("#sg-size-disco").click()

    when "size-hay"
      $("#sg-size-hay").click()

    when "size-viewport"
      $sizePx.val(data.val)
      keydown $sizePx

    when "size-plus5em"
      $sizePx.val(parseInt($sizePx.val()) + 80)
      keydown $sizePx

    when "size-plus1em"
      $sizePx.val(parseInt($sizePx.val()) + 16)
      keydown $sizePx

    when "size-plus1px"
      $sizePx.val(parseInt($sizePx.val()) + 1)
      keydown $sizePx

    when "size-minus1px"
      $sizePx.val(parseInt($sizePx.val()) - 1)
      keydown $sizePx

    when "size-minus1em"
      $sizePx.val(parseInt($sizePx.val()) - 16)
      keydown $sizePx

    when "size-minus5em"
      $sizePx.val(parseInt($sizePx.val()) - 80)
      keydown $sizePx

    when "set-url"
      src = data.val
      if src.indexOf('http://') is 0
        $('#sg-viewport').attr('src', src)
)
