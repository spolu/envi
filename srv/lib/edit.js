var fs = require('fs');
var fwk = require('fwk');
var events = require('events');
var util = require('util');
var fs = require('fs');

/**
 * Edit Object
 *
 * in charge of opening, writing, autosaving and closing local files
 * by path.
 *
 * @inherits {}
 *
 * @param {cfg}
 */
var edit = function(spec, my) {
  my = my || {};
  var _super = {};

  my.cfg = spec.cfg; 

  // public
  var read;          /* read(path, cb); */
  var write;         /* write(path, buf, cb); */
  var autocomplete;  /* autocomplete(path, current, cb) */

  // private
  var get_home;      /* get_home(); */
  var ac_base;       /* ac_base(path, current); */

  var that = new events.EventEmitter();

  /***************************************
   * PRIVATE HELPER FUNCTIONS            *
   ***************************************/

  /**
   * private helper function to retrieve the home directory of the current
   * user.
   * @return home the home directory
   */
  get_home = function() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
  };

  /**
   * Computes the autocomplete base path and hint and returns it. this
   * function is useful for testing
   * @param path the partial path
   * @param current the current path (file or '/' ending)
   * @return { path, hint }
   */
  ac_base = function(path, current) {
    if(typeof path !== 'string')
      path = '';
    if(path[0] === '~')
      path = get_home() + path.substr(1);
    var path_c = path.split('/');

    if((path_c[0] !== '' || path_c.length === 1) && 
       typeof current === 'string') {
      var current_c = current.split('/');
      current_c.pop();
      path_c = current_c.concat(path_c);
    }

    return { hint: path_c.pop(),
             path: path_c.join('/') };
  };


  /***************************************
   * PUBLIC FUNCTIONS                    *
   ***************************************/

  /**
   * Opens a file and returns its content. For now there is no management
   * of concurrent acesses to a file. This should be added later.
   * TODO: add access management / autosaving / ..
   * @param path the file path
   * @param cb(err, buf) the callback
   */
  read = function(path, cb) {
    fs.readFile(path, 'utf8', cb);
  };

  /**
   * Completes a partial path with existing paths.
   * @param path the partial path
   * @param current the current path (file or '/' ending)
   * @param cb(err, cmpl) 
   */
  autocomplete = function(path, current, cb) {
    var base = ac_base(path, current);

    fs.readdir(base.path + '/', function(err, files) {
      if(err) {
        cb(err);
      }
      else {
        var cmpl = [];
        for(var i = 0; i < files.length; i ++) {
          if(files[i].substr(0, base.hint.length) === base.hint &&
             (files[i][0] !== '.' || base.hint[0] === '.')) {
            cmpl.push(base.path + '/' + files[i]);
          }
        }
        if(cmpl.length === 1) {
          fs.lstat(cmpl[0], function(err, stats) {
            if(err) {
              cb(err);
            }
            else {
              if(stats.isDirectory())
                cb(null, [cmpl[0] + '/'])
              if(stats.isFile())
                cb(null, cmpl);
            }
          });
        }
        else {
          cb(null, cmpl);
        }
      }
    });
  };

  /**
   * Saves the content of file with buf. Again no access management here.
   * @param path the file path
   * @param buf the buffer
   * @param cb(err) the callback
   */
  write = function(path, buf, cb) {
    fs.writeFile(path, buf, 'utf8', cb);
  };

  fwk.method(that, 't_get_home', get_home, _super);
  fwk.method(that, 't_ac_base', ac_base, _super);

  fwk.method(that, 'read', read, _super);
  fwk.method(that, 'autocomplete', autocomplete, _super);
  fwk.method(that, 'write', write, _super);

  return that;
};

exports.edit = edit;
