#!/usr/bin/env node

var express = require("express");
var app = express.createServer();
var io = require('socket.io').listen(app);

// Use Express to serve static content, such as our index.html
app.configure(function(){
  app.use(express.static(__dirname + '/public'));
});


//Socket.io emits this event when a connection is made.
io.sockets.on('connection', function (socket) {

  // Emit a message to send it to the client.
  socket.emit('ping', { msg: 'Hello. I know socket.io.' });

  // Print messages from the client.
  socket.on('pong', function (data) {
    console.log(data.msg);
  });

});


app.listen(8080);
console.log('socket.io server started on port 8080');
