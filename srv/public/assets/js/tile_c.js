/******************************/
/*   TILE CELL                */
/******************************/
var tile_c = function(spec, my) {
  var _super = {};
  my = my || {};

  my.id = spec.id;

  // public
  var build;   /* build(); */
  var refresh; /* refresh(); */

  // private

  var that = CELL.cell(spec, my);

  /****************************/
  /*   BUILD                  */
  /****************************/
  build = function() {
    my.element = $('<div/>').addClass('envi-tile').html(my.path);

    return my.element;
  };

  /****************************/
  /*   REFRESH                */
  /****************************/
  /**
   * @expects { left, top, width, height,
   *            focus: true|false }
   */
  refresh = function(json) {
    my.element.css({ left: json.left,
                     top: json.top,
                     width: json.width,
                     height: json.height });
    if(json.focus)
      my.element.addClass('focus');
    else
      my.element.removeClass('focus');

    /*
    // test
    $('#envi-tile').html('test here a,.,.a ,., a,., ,.,a aasa s s\nvar it = function() {\n}\n\n\n\nok\n\n,\n\nhophon');
    var editor = ace.edit('envi-tile');
    editor.setTheme("ace/theme/envi");
    editor.session.setFoldStyle('manual');
    editor.setShowFoldWidgets(false);
    //editor.setShowInvisibles(true);
    //editor.setKeyboardHandler(require("ace/keyboard/vim").handler);
    editor.setKeyboardHandler(require("ace/keyboard/envi").handler);
    */

    _super.refresh(json);
  };
  
  CELL.method(that, 'build', build, _super);
  CELL.method(that, 'refresh', refresh, _super);

  return that;
};
