/******************************/
/*   INITIALIZATION           */
/******************************/

var ENVI = {};

$(document).ready(function() {
  ENVI.envi = main_ct({});
  ENVI.envi.load({});
});


/******************************/
/*   MAIN  CONTAINER          */
/******************************/
var main_ct = function(spec, my) {
  var _super = {};
  my = my || {};

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

    my.children['cli'] = cli_c({ path: my.path + '/cli', container: that });
    top.append(my.children['cli'].build());
    my.children['tile'] = tile_c({ path: my.path + '/tile', container: that });
    top.append(my.children['tile'].build());
    
    // test
    $('#envi-tile').html('test here\nok\nhophop');
    var editor = ace.edit('envi-tile');
    editor.setTheme("ace/theme/envi");
    editor.session.setFoldStyle('manual');
    editor.setShowFoldWidgets(false);
    //editor.setShowInvisibles(true);
    //editor.setKeyboardHandler(require("ace/keyboard/vim").handler);
    editor.setKeyboardHandler(require("ace/keyboard/envi").handler);
  };

  CELL.method(that, 'load', load, _super);
  CELL.method(that, 'refresh', refresh, _super);

  return that;
};
