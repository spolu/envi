/******************************/
/*   INITIALIZATION           */
/******************************/

var ENVI = {};

$(document).ready(function() {
  ENVI.envi = main_ct({});
  ENVI.envi.load({});
  ENVI.envi.refresh();
});


/******************************/
/*   MAIN  CONTAINER          */
/******************************/
var main_ct = function(spec, my) {
  var _super = {};
  my = my || {};

  my.tiles = [];
  my.focus = -1;

  my.next_id = 0;

  my.json = { 
    space: { 
      tiles: [],
      focus: -1,
      cli: false
    },
    cli: { active: my.cli,
           str: '' }
  };


  // public
  var load;      /* load(); */
  var refresh;   /* refresh(); */

  // private
  var execute;   /* execute(); */
  

  var that = CELL.container({ name: 'main' }, my);

  /**
   * Loads the envi env within the DOM. A full-scren
   * editor is opened at the begining
   */
  load = function() {
    var top = $('#envi-top');

    my.children['cli'] = cli_c({ path: '/' + my.name + '/cli', container: that });
    top.append(my.children['cli'].build());
    my.children['space'] = space_c({ path: '/' + my.name + '/space', container: that });
    top.append(my.children['space'].build());

    /****************************************
     * HANDLERS                             *
     ****************************************/
    $(document).keypress(function(evt) {
      if(evt.ctrlKey) {
       console.log('ctrl + ' + evt.keyCode);
        switch(evt.keyCode) {
          case 13: // enter
            if(evt.shiftKey) {
              my.tiles.unshift('t' + (my.next_id++));
              my.focus = 0;
              that.refresh();
            }
          break;
          case 3: // 'c' 
            if(evt.shiftKey) {
              var tile = my.tiles[my.focus];
              that.find('/space/' + tile).close();
            }
          break;
          case 10: // 'j' 
            if(evt.shiftKey) {
              my.focus = (my.focus + 0) % my.tiles.length;
              that.refresh();
            }
          break;
          case 11: // 'k' 
            if(evt.shiftKey) {
              my.focus = (my.focus - 1 + my.tiles.length) % my.tiles.length;
              that.refresh();
            }
          break;
          case 8: // 'h' 
            if(evt.shiftKey && my.tiles.length > 0) {
              var t = my.tiles.splice(my.focus, 1);
              my.tiles.unshift(t);
              my.focus = 0;
              that.refresh();
            }
          break;
        }
      }
      else {
        //console.log(evt.keyCode);
        switch(evt.keyCode) {
          case 58:
            if(my.tiles.length === 0) {
              my.json.space.cli = true;
              my.json.cli.active = true;
              my.json.cli.str = ':';
              that.refresh();
            }
          break;
        }
      }
    });

    
    my.children['space'].on('focus', function(tile) {
      if(tile !== my.tiles[my.focus]) {
        var idx = my.tiles.indexOf(tile);
        if(idx !== -1) {
          my.focus = idx;
          that.refresh();
        }
      }
    });

    my.children['space'].on('cli', function(str) {
      console.log('CLI: ' + str);
      my.json.space.cli = true;
      my.json.cli.active = true;
      my.json.cli.str = str;
      that.refresh();
    });

    my.children['space'].on('destroy', function(tile) {
      console.log('DESTROY: ' + tile);
      my.tiles.splice(my.focus, 1);
      my.focus = my.focus % my.tiles.length;
      that.refresh();
    });
    
    my.children['cli'].on('done', function(ex) {
      my.json.space.cli = false;
      my.json.cli.active = false;
      my.json.cli.str = '';
      execute(ex);
      that.refresh();
    });

    my.children['cli'].on('cancel', function() {
      my.json.space.cli = false;
      my.json.cli.active = false;
      my.json.cli.str = '';
      that.refresh();
    });

  };


  /**
   * Refreshes the UI with new layout
   */
  refresh = function() {
    my.json.space.tiles = my.tiles;
    my.json.space.focus = my.focus;
    _super.refresh();
  };

  /*****************************************
   * PRIVATE HELPER FUNCTIONS              *
   *****************************************/
  /**
   * Execute a command received form the cli interface. This functions
   * receives the bare string a submitted by the suer
   * @param ex the command to execute
   */
  execute = function(ex) {
    if(ex.length > 0 && ex[0] === ':') {
      var cmp = ex.split(' ');
      var cmd = cmp.shift();
      var arg = cmp.join(' '); 

      if(cmd === ':e') {
        var tile = 't' + (my.next_id++);
        my.tiles.unshift(tile);
        my.focus = 0;
        that.refresh();
        that.find('/space/' + tile).open(arg);
      }
      if(cmd === ':q') {
        var tile = my.tiles[my.focus];
        that.find('/space/' + tile).close();
      }
      if(cmd === ':q!') {
        var tile = my.tiles[my.focus];
        that.find('/space/' + tile).close(true);
      }
      if(cmd === ':w') {
        var tile = my.tiles[my.focus];
        that.find('/space/' + tile).save();
      }
    }
    
  };


  CELL.method(that, 'load', load, _super);
  CELL.method(that, 'refresh', refresh, _super);

  return that;
};
