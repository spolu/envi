## Envi is Not VI

`envi` is like if `vim` had a children with `dwm` at a party organised by `mosaic`. `envi` is a web-based
`vi`-like editor with a tiled dynamic buffer management layout. `envi` is also able to stream edits to an
`envi-stream` server and enables its user to subscribe to each others edit streams in real time.

### Core Principles 
`envi` is a web-based collaborative editor built with the following 4 principles in mind:

- `efficiency`    : no mouse. vi edition. dwm buffer management. what else?
- `open-source`   : envi local server as well as stream servers are entirely opensource
- `collaborative` : you can see what your team mates are working on in real time (read-only)


### Architecture

- `envi-srv`    : a server to serve the editor and files locally (listening to `127.0.0.1`)
- `envi-stream` : a streaming server for WLAN edits streams (one per organization or the public ones)
- `envi`        : an executable letting you open local files in your browser directly from the command-line

### Dependencies

`envi` is based on:

- ACE (with a whole new vi key binding)
- nodeJS  
- socket.IO (for read-only edit streams)

### Getting Started

```bash
$ git clone git://github.com/spolu/envi.git
$ cd envi/srv
$ npm install
$ node app.js
# Go to http://127.0.0.1:35710
# ctrl+shift+enter to open a new editor
# :e FILENAME to open a file
```

### Get Involved

IRC ChanneL: #envi (freenode)

### Contributors

- @spolu (Stanislas Polu)
- @AdrienGiboire (Adrien)
 
