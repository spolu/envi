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

  my.tiles = ['t2', 't3', 't5'];
  my.focus = 2;
  my.next_id = 6;

  my.json = { 
    space: { 
      tiles: [],
      focus: -1 
    },
    cli: { str: '-- INSERT --' }
  };


  // public
  var load;    /* load(); */
  var refresh; /* refresh(); */

  // private

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

    // handlers
    $(document).keypress(function(evt) {
      console.log(evt);
      if(evt.ctrlKey) {
        switch(evt.keyCode) {
          case 10: // j
            my.focus = (my.focus - 1 + my.tiles.length) % my.tiles.length;
            that.refresh();
            break;
          case 11: // k
            my.focus = (my.focus + 1) % my.tiles.length;
            that.refresh();
            break;
          case 13: // enter
            if(evt.shiftKey) {
              my.tiles.unshift('t' + (my.next_id++));
              my.focus = 0;
              that.refresh();
            }
            else if(my.tiles.length > 0) {
              var t = my.tiles.splice(my.focus, 1);
              my.tiles.unshift(t);
              my.focus = 0;
              that.refresh();
            }
            break;
        }
      }
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


  CELL.method(that, 'load', load, _super);
  CELL.method(that, 'refresh', refresh, _super);

  return that;
};
