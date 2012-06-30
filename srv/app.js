#!/usr/bin/env node

var util = require('util');
var fwk = require('fwk');
var express = require("express");
var http = require('http');

var app = express.createServer();
var io = require('socket.io').listen(app);

// cfg
var cfg = fwk.populateConfig(require("./config.js").config);

// Use Express to serve static content, such as our index.html
app.configure(function(){
  app.use(express.static(__dirname + '/public'));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
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

app.get('/test', function(req, res, next) {
  res.json({ok: true});
});

app.listen(35710, '127.0.0.1');
