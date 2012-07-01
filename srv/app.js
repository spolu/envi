#!/usr/bin/env node

var util = require('util');
var fwk = require('fwk');
var express = require("express");
var http = require('http');

var app = express.createServer();
var io = require('socket.io').listen(app);

// cfg
var cfg = fwk.populateConfig(require("./config.js").config);

// edit
var edit = require('./lib/edit.js').edit({cfg: cfg});


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


// Routes

app.get( '/file', function(req, res, next) {
  var path = req.param('path');

  edit.read(path, function(err, buf) {
    if(err) {
      res.send(err.message, 500);
    }
    else {
      res.send(buf);
    }
  });
});
app.put( '/file', function(req, res, next) {
  var path = req.param('path');
  var buf = '';
  res.on('data', function(chunk) {
    buf += chunk;
  });
  res.on('end', function() {
    console.log('writing: ' + path);
    edit.write(path, buf, function(err) {
      if(err) {
        res.send(err.message, 500);
      }
      else {
        res.json({ ok: true });
      }
    });
  });
});
app.get( '/autocomplete', function(req, res, next) {
  var path = req.param('path');
  var current = req.param('current');

  edit.autocomplete(path, current, function(err, paths) {
    if(err) {
      res.send(err.message, 500);
    }
    else {
      res.json({ ok: true,
                 paths: paths });
    }
  });
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

app.listen(35710, '127.0.0.1');
